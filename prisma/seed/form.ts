import {
    FormFieldType,
    type PrismaClient,
    RegistrationStatus,
} from "@prisma/client";

export async function seedEventForms(prisma: PrismaClient) {
  // Get events that should have forms (non-draft events)
  const events = await prisma.event.findMany({
    where: {
      status: {
        not: "DRAFT",
      },
    },
  });

  if (events.length === 0) {
    console.log("No events found for form seeding");
    return;
  }

  const eventForms = [];

  // Create forms for the first two events
  for (let i = 0; i < Math.min(2, events.length); i++) {
    const event = events[i];

    // Create EventForm
    const eventForm = await prisma.eventForm.create({
      data: {
        eventId: event.id,
        title: `Formulario de Registro - ${event.name}`,
        description: `Por favor completa la siguiente información para registrarte en ${event.name}.`,
        isActive: true,
      },
    });

    // Create FormFields
    const formFields = [];

    // Basic contact fields
    formFields.push(
      await prisma.formField.create({
        data: {
          formId: eventForm.id,
          label: "Nombre completo",
          type: FormFieldType.TEXT,
          required: true,
          placeholder: "Ingresa tu nombre completo",
          order: 1,
        },
      }),
    );

    formFields.push(
      await prisma.formField.create({
        data: {
          formId: eventForm.id,
          label: "Correo electrónico",
          type: FormFieldType.EMAIL,
          required: true,
          placeholder: "tu@email.com",
          order: 2,
        },
      }),
    );

    formFields.push(
      await prisma.formField.create({
        data: {
          formId: eventForm.id,
          label: "Teléfono",
          type: FormFieldType.PHONE,
          required: false,
          placeholder: "+52 33 1234 5678",
          order: 3,
        },
      }),
    );

    // Company info
    formFields.push(
      await prisma.formField.create({
        data: {
          formId: eventForm.id,
          label: "Empresa",
          type: FormFieldType.TEXT,
          required: true,
          placeholder: "Nombre de tu empresa",
          order: 4,
        },
      }),
    );

    formFields.push(
      await prisma.formField.create({
        data: {
          formId: eventForm.id,
          label: "Cargo/Posición",
          type: FormFieldType.SELECT,
          required: true,
          options: [
            "Desarrollador",
            "Gerente de Producto",
            "Diseñador UX/UI",
            "Analista de Datos",
            "Director Técnico",
            "Consultor",
            "Estudiante",
            "Otro",
          ],
          order: 5,
        },
      }),
    );

    // Experience level
    formFields.push(
      await prisma.formField.create({
        data: {
          formId: eventForm.id,
          label: "Nivel de experiencia",
          type: FormFieldType.RADIO,
          required: true,
          options: ["Principiante", "Intermedio", "Avanzado", "Experto"],
          order: 6,
        },
      }),
    );

    // Interests (for tech conference)
    if (
      event.name.toLowerCase().includes("tech") ||
      event.name.toLowerCase().includes("developer")
    ) {
      formFields.push(
        await prisma.formField.create({
          data: {
            formId: eventForm.id,
            label: "Áreas de interés",
            type: FormFieldType.CHECKBOX,
            required: false,
            options: [
              "Inteligencia Artificial",
              "Desarrollo Web",
              "Desarrollo Móvil",
              "DevOps",
              "Ciberseguridad",
              "Blockchain",
              "Cloud Computing",
              "Data Science",
            ],
            order: 7,
          },
        }),
      );
    }

    // Dietary restrictions
    formFields.push(
      await prisma.formField.create({
        data: {
          formId: eventForm.id,
          label: "Restricciones alimentarias",
          type: FormFieldType.TEXTAREA,
          required: false,
          placeholder: "Describe cualquier restricción alimentaria o alergia",
          order: 8,
        },
      }),
    );

    // T-shirt size
    formFields.push(
      await prisma.formField.create({
        data: {
          formId: eventForm.id,
          label: "Talla de playera",
          type: FormFieldType.SELECT,
          required: false,
          options: ["XS", "S", "M", "L", "XL", "XXL"],
          order: 9,
        },
      }),
    );

    // Comments
    formFields.push(
      await prisma.formField.create({
        data: {
          formId: eventForm.id,
          label: "Comentarios adicionales",
          type: FormFieldType.TEXTAREA,
          required: false,
          placeholder: "¿Hay algo más que te gustaría que sepamos?",
          order: 10,
        },
      }),
    );

    eventForms.push({ eventForm, formFields });
  }

  // Now create some form responses for registered users
  await seedFormResponses(prisma, eventForms);

  return eventForms;
}

async function seedFormResponses(prisma: PrismaClient, eventForms: any[]) {
  for (const { eventForm, formFields } of eventForms) {
    // Get registrations for this event that are REGISTERED or CHECKED_IN
    const registrations = await prisma.registration.findMany({
      where: {
        eventId: eventForm.eventId,
        status: {
          in: [RegistrationStatus.REGISTERED, RegistrationStatus.CHECKED_IN],
        },
      },
      include: {
        user: true,
      },
    });

    // Create responses for some of the registrations
    for (let i = 0; i < Math.min(3, registrations.length); i++) {
      const registration = registrations[i];

      // Use registeredAt if available, otherwise use invitedAt + some time
      const baseTime = registration.registeredAt || registration.invitedAt;
      const submittedAt = new Date(baseTime.getTime() + 10 * 60 * 1000); // 10 minutes after registration/invite

      // Create FormResponse
      const formResponse = await prisma.formResponse.create({
        data: {
          registrationId: registration.id,
          submittedAt: submittedAt,
        },
      });

      // Create FormFieldResponses
      for (const field of formFields) {
        let value: any;

        switch (field.type) {
          case FormFieldType.TEXT:
            if (field.label.includes("Nombre")) {
              value = registration.user.name || `Usuario ${i + 1}`;
            } else if (field.label.includes("Empresa")) {
              value = registration.user.company || "Empresa Ejemplo S.A.";
            } else {
              value = "Respuesta de ejemplo";
            }
            break;

          case FormFieldType.EMAIL:
            value = registration.user.email;
            break;

          case FormFieldType.PHONE:
            value = registration.user.phone || "+52 33 1234 5678";
            break;

          case FormFieldType.SELECT:
            if (field.options && Array.isArray(field.options)) {
              value =
                field.options[Math.floor(Math.random() * field.options.length)];
            }
            break;

          case FormFieldType.RADIO:
            if (field.options && Array.isArray(field.options)) {
              value =
                field.options[Math.floor(Math.random() * field.options.length)];
            }
            break;

          case FormFieldType.CHECKBOX:
            if (field.options && Array.isArray(field.options)) {
              // Select 1-3 random options
              const selectedCount = Math.floor(Math.random() * 3) + 1;
              const shuffled = [...field.options].sort(
                () => 0.5 - Math.random(),
              );
              value = shuffled.slice(0, selectedCount);
            }
            break;

          case FormFieldType.TEXTAREA:
            if (field.label.includes("Restricciones")) {
              value = Math.random() > 0.7 ? "Sin restricciones" : "Vegetariano";
            } else {
              value =
                "Este es un comentario de ejemplo para el campo de texto largo.";
            }
            break;

          case FormFieldType.NUMBER:
            value = Math.floor(Math.random() * 10) + 1;
            break;

          case FormFieldType.DATE:
            value = new Date().toISOString().split("T")[0];
            break;

          default:
            value = "Valor por defecto";
        }

        // Only create response if field is required or randomly for optional fields
        if (field.required || Math.random() > 0.3) {
          await prisma.formFieldResponse.create({
            data: {
              responseId: formResponse.id,
              fieldId: field.id,
              value: value,
            },
          });
        }
      }
    }
  }
}
