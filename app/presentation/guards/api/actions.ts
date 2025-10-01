import { RegistrationStatus, UserRole } from "@prisma/client";
import {
  type CreateFormResponseDTO,
  createFormResponseSchema,
} from "~/domain/dtos/form-response.dto";
import type { CreateRegistrationDto } from "~/domain/dtos/registration.dto";
import { type CreateGuestDTO, createGuestSchema } from "~/domain/dtos/user.dto";
import { runInTransaction } from "~/infrastructure/db/prisma";
import { generateQRCode, simplifyZodErrors } from "~/shared/lib/utils";
import type { Route } from "../routes/+types/register-attendee-handler";

export const createCheckInAction = async ({
  request,
  params,
  context: { repositories },
}: Route.ActionArgs) => {
  try {
    const { qrCode } = params;

    const registration =
      await repositories.registrationRepository.findByQrCode(qrCode);

    if (!registration) {
      return {
        success: false,
        error: "No se encontró el registro.",
      };
    }

    await repositories.registrationRepository.update({
      id: registration.id,
      status: RegistrationStatus.CHECKED_IN,
      checkedInAt: new Date(),
    });

    return {
      success: true,
      message: "Check-in registrado exitosamente.",
    };
  } catch (error) {
    return {
      success: false,
      error: "Error al crear el check-in",
    };
  }
};

export const createGuestAction = async ({
  request,
  context: { repositories, session, services },
}: Route.ActionArgs) => {
  const userId = session.get("user")?.id;
  const userRole = session.get("user")?.role;

  if (!userId) {
    return {
      success: false,
      error: "No se ha iniciado sesión",
    };
  }

  if (
    !userRole ||
    (userRole !== UserRole.GUARD && userRole !== UserRole.ADMIN)
  ) {
    return {
      success: false,
      error: "No tienes permisos para registrar asistentes",
    };
  }

  try {
    return await runInTransaction(async () => {
      const data = Object.fromEntries(await request.formData());

      const parsedData = {
        email: data.email,
        quantity: data.quantity,
        eventId: data.eventId,
        name: data.name,
        phone: data.phone,
      };

      const result = createGuestSchema.safeParse(parsedData);

      if (!result.success) {
        return {
          success: false,
          error: "Error de validación",
          errors: simplifyZodErrors<CreateGuestDTO>(result.error),
        };
      }

      const { email, quantity, eventId, name, phone } = result.data;

      const ticketsRequested = Number(quantity);
      if (ticketsRequested <= 0) {
        return { error: "La cantidad de tickets debe ser mayor a 0." };
      }

      // Buscar usuario por email
      let user = await repositories.userRepository.findByEmail(email);
      if (!user) {
        user = await repositories.userRepository.create({
          email,
          name,
          phone,
          role: UserRole.ATTENDEE,
        });
      }

      // Buscar evento
      const event = await repositories.eventRepository.findUnique(eventId);
      if (!event) return { success: false, error: "Evento no encontrado" };

      const maxTickets = event.maxTickets || 0;
      const remainingTickets = event.remainingCapacity || 0;

      if (ticketsRequested > maxTickets) {
        return {
          error: `Solo puedes comprar ${maxTickets} tickets como máximo. 
                Intentaste comprar ${ticketsRequested}.`,
        };
      }

      if (ticketsRequested > remainingTickets) {
        return {
          error: `No hay suficientes tickets disponibles. 
                Quedan ${remainingTickets}, intentaste comprar ${ticketsRequested}.`,
        };
      }

      // Buscar registro previo del usuario en este evento
     /*  const existingRegistration =
        await repositories.registrationRepository.findTickesPurchased(
          eventId,
          user.id,
        );

      

      // 🔹 Caso 1: Usuario invitado pendiente
      if (existingRegistration?.status === RegistrationStatus.PENDING) {
        await repositories.registrationRepository.update({
          id: existingRegistration.id,
          qrCode: generateQRCode(user.id, eventId),
          status: RegistrationStatus.CHECKED_IN,
          checkedInAt: new Date(),
          registeredAt: new Date(),
          purchasedTickets: ticketsRequested,
        });

        return {
          success: true,
          message:
            "Usuario invitado pendiente ahora está registrado y en check-in.",
          redirectTo: "/panel",
        };
      }

      // 🔹 Caso 2: Usuario ya registrado
      if (existingRegistration?.status === RegistrationStatus.REGISTERED) {
        await repositories.registrationRepository.update({
          id: existingRegistration.id,
          status: RegistrationStatus.CHECKED_IN,
          checkedInAt: new Date(),
        });

        return {
          success: true,
          message: "El usuario ya estaba registrado y en check-in.",
          redirectTo: "/panel",
        };
      } */

      // 🔹 Caso 3: Usuario nuevo
      const registration: CreateRegistrationDto = {
        qrCode: generateQRCode(user.id, eventId),
        eventId,
        userId: user.id,
        status: RegistrationStatus.CHECKED_IN,
        registeredAt: new Date(),
        respondedAt: new Date(),
        purchasedTickets: ticketsRequested,
        checkedInAt: new Date(),
      };

      const newRegistration = await repositories.registrationRepository.create(registration);

      const eventFormData = {
        registrationId: newRegistration.id, //at this point is non existent, we will set it later after creating the registration
        fieldResponses: [] as { fieldId: string; value: string }[],
      };

      for (const [key, value] of Object.entries(data)) {
        if (key.startsWith("field_")) {
          const fieldId = key.replace("field_", "");
          eventFormData.fieldResponses.push({
            fieldId,
            value: value as string,
          });
        }
      }

      //we dont need it right now but we might as well validate right now
      const formResponseResult =
        createFormResponseSchema.safeParse(eventFormData);

      if (!formResponseResult.success) {
        return {
          success: false,
          error: "Error de validación",
          errors: simplifyZodErrors<CreateFormResponseDTO>(
            formResponseResult.error,
          ),
        };
      }

      const formResponse = await repositories.formResponseRepository.create({
        registrationId: newRegistration.id,
        fieldResponses: eventFormData.fieldResponses,
      })

      console.log("registered response: ", formResponse)

      // Actualizar capacidad del evento
      await repositories.eventRepository.update({
        id: event.id,
        remainingCapacity: remainingTickets - ticketsRequested,
      });

      // Buscar registro final
     /*  const finalRegistration =
        await repositories.registrationRepository.findTickesPurchased(
          eventId,
          user.id,
        );

      if (!finalRegistration) {
        return { error: "Error al registrar el asistente.", success: false };
      }

      // Enviar QR por correo
      const qrCodeUrl = await QRCode.toDataURL(
        `${process.env.APP_URL}/verificar-registro/${finalRegistration.qrCode}`,
      );

      await services.emailService.sendRegistrationConfirmation(user.email, {
        userName: user.name || "",
        eventName: event.name,
        eventDate: event.start_date.toISOString().split("T")[0],
        eventLocation: event.location,
        eventTime: event.start_date.toISOString().split("T")[1],
        qrCode: finalRegistration.qrCode,
        qrCodeUrl,
        ticketsQuantity: finalRegistration.purchasedTickets || 0,
      }); */

      return {
        success: true,
        message: "Asistente registrado exitosamente.",
        redirectTo: "/registrar-asistente",
      };
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error interno al registrar invitado." };
  }
};

/* export const updateGuestRegistrationAction = async ({
  request,
  context: { repositories, session, services },
}: Route.ActionArgs) => {
  const userId = session.get("user")?.id;
  const userRole = session.get("user")?.role;

  if (!userId) {
    return {
      success: false,
      error: "No se ha iniciado sesión",
    };
  }

  if (
    !userRole ||
    (userRole !== UserRole.GUARD && userRole !== UserRole.ADMIN)
  ) {
    return {
      success: false,
      error: "No tienes permisos para actualizar registros de asistentes",
    };
  }

  try {
    return await runInTransaction(async () => {
      const formData = await request.formData();
      
      // Handle form data properly to support arrays (checkboxes)
      const data: Record<string, any> = {};
      
      for (const [key, value] of formData.entries()) {
        if (data[key]) {
          // If key already exists, convert to array or add to existing array
          if (Array.isArray(data[key])) {
            data[key].push(value);
          } else {
            data[key] = [data[key], value];
          }
        } else {
          data[key] = value;
        }
      }

      const parsedData = {
        email: data.email,
        quantity: data.quantity,
        eventId: data.eventId,
        name: data.name,
        phone: data.phone,
      };

      const result = createGuestSchema.safeParse(parsedData);

      if (!result.success) {
        return {
          success: false,
          error: "Error de validación",
          errors: simplifyZodErrors<CreateGuestDTO>(result.error),
        };
      }

      const { email, quantity, eventId, name, phone } = result.data;

      const ticketsRequested = Number(quantity);
      if (ticketsRequested <= 0) {
        return { error: "La cantidad de tickets debe ser mayor a 0." };
      }

      // Buscar usuario por email
      let user = await repositories.userRepository.findByEmail(email);
      if (!user) {
        return {
          success: false,
          error: "Usuario no encontrado. Use la acción de creación para nuevos usuarios.",
        };
      }

      // Buscar evento
      const event = await repositories.eventRepository.findUnique(eventId);
      if (!event) return { success: false, error: "Evento no encontrado" };

      const maxTickets = event.maxTickets || 0;
      const remainingTickets = event.remainingCapacity || 0;

      // Buscar registro previo del usuario en este evento
      const existingRegistration =
        await repositories.registrationRepository.findTickesPurchased(
          eventId,
          user.id,
        );

      if (!existingRegistration) {
        return {
          success: false,
          error: "No se encontró un registro existente para este usuario en este evento. Use la acción de creación.",
        };
      }

      // Validar capacidad considerando los tickets ya asignados
      const currentTickets = existingRegistration.purchasedTickets || 0;
      const ticketDifference = ticketsRequested - currentTickets;

      if (ticketsRequested > maxTickets) {
        return {
          error: `Solo puedes asignar ${maxTickets} tickets como máximo. 
                Intentaste asignar ${ticketsRequested}.`,
        };
      }

      // Solo validar capacidad restante si se están agregando más tickets
      if (ticketDifference > 0 && ticketDifference > remainingTickets) {
        return {
          error: `No hay suficientes tickets disponibles. 
                Quedan ${remainingTickets}, intentaste agregar ${ticketDifference} más.`,
        };
      }

      // 🔹 Caso 1: Usuario invitado pendiente
      if (existingRegistration.status === RegistrationStatus.PENDING) {
        await repositories.registrationRepository.update({
          id: existingRegistration.id,
          qrCode: generateQRCode(user.id, eventId),
          status: RegistrationStatus.CHECKED_IN,
          checkedInAt: new Date(),
          registeredAt: new Date(),
          respondedAt: new Date(),
          purchasedTickets: ticketsRequested,
        });

        // Update user info if provided
        if (name !== user.name || phone !== user.phone) {
          await repositories.userRepository.update({
            id: user.id,
            name,
            phone,
          });
        }

        // Handle event form data
        const eventFormData = {
          registrationId: existingRegistration.id,
          fieldResponses: [] as { fieldId: string; value: any }[],
        };

        for (const [key, value] of Object.entries(data)) {
          if (key.startsWith("field_")) {
            const fieldId = key.replace("field_", "");
            eventFormData.fieldResponses.push({
              fieldId,
              value: Array.isArray(value) ? value : value,
            });
          }
        }

        // Check if form response already exists
        const existingFormResponse = await repositories.formResponseRepository.findByRegistrationId(existingRegistration.id);

        if (existingFormResponse && eventFormData.fieldResponses.length > 0) {
          // Update existing form response
          await repositories.formResponseRepository.bulkUpdateFieldResponses({
            responseId: existingFormResponse.id,
            fieldUpdates: eventFormData.fieldResponses.map(fr => ({
              fieldId: fr.fieldId,
              value: fr.value,
            })),
          });
        } else if (eventFormData.fieldResponses.length > 0) {
          // Create new form response
          const formResponseResult = createFormResponseSchema.safeParse(eventFormData);

          if (!formResponseResult.success) {
            return {
              success: false,
              error: "Error de validación del formulario",
              errors: simplifyZodErrors<CreateFormResponseDTO>(formResponseResult.error),
            };
          }

          await repositories.formResponseRepository.create({
            registrationId: existingRegistration.id,
            fieldResponses: eventFormData.fieldResponses,
          });
        }

        // Update event capacity
        await repositories.eventRepository.update({
          id: event.id,
          remainingCapacity: remainingTickets - ticketDifference,
        });

        return {
          success: true,
          message: "Usuario invitado pendiente ahora está registrado y en check-in.",
          redirectTo: "/registrar-asistente",
        };
      }

      // 🔹 Caso 2: Usuario ya registrado
      if (existingRegistration.status === RegistrationStatus.REGISTERED) {
        await repositories.registrationRepository.update({
          id: existingRegistration.id,
          status: RegistrationStatus.CHECKED_IN,
          checkedInAt: new Date(),
          purchasedTickets: ticketsRequested,
        });

        // Update user info if provided
        if (name !== user.name || phone !== user.phone) {
          await repositories.userRepository.update({
            id: user.id,
            name,
            phone,
          });
        }

        // Handle event form data (same logic as above)
        const eventFormData = {
          registrationId: existingRegistration.id,
          fieldResponses: [] as { fieldId: string; value: any }[],
        };

        for (const [key, value] of Object.entries(data)) {
          if (key.startsWith("field_")) {
            const fieldId = key.replace("field_", "");
            eventFormData.fieldResponses.push({
              fieldId,
              value: Array.isArray(value) ? value : value,
            });
          }
        }

        // Check if form response already exists
        const existingFormResponse = await repositories.formResponseRepository.findByRegistrationId(existingRegistration.id);

        if (existingFormResponse && eventFormData.fieldResponses.length > 0) {
          // Update existing form response
          await repositories.formResponseRepository.bulkUpdateFieldResponses({
            responseId: existingFormResponse.id,
            fieldUpdates: eventFormData.fieldResponses.map(fr => ({
              fieldId: fr.fieldId,
              value: fr.value,
            })),
          });
        } else if (eventFormData.fieldResponses.length > 0) {
          // Create new form response
          const formResponseResult = createFormResponseSchema.safeParse(eventFormData);

          if (!formResponseResult.success) {
            return {
              success: false,
              error: "Error de validación del formulario",
              errors: simplifyZodErrors<CreateFormResponseDTO>(formResponseResult.error),
            };
          }

          await repositories.formResponseRepository.create({
            registrationId: existingRegistration.id,
            fieldResponses: eventFormData.fieldResponses,
          });
        }

        // Update event capacity
        await repositories.eventRepository.update({
          id: event.id,
          remainingCapacity: remainingTickets - ticketDifference,
        });

        return {
          success: true,
          message: "El usuario ya estaba registrado y ahora está en check-in.",
          redirectTo: "/registrar-asistente",
        };
      }

      // 🔹 Caso 3: Usuario ya en check-in
      if (existingRegistration.status === RegistrationStatus.CHECKED_IN) {
        // Just update ticket quantity and form data if needed
        await repositories.registrationRepository.update({
          id: existingRegistration.id,
          purchasedTickets: ticketsRequested,
        });

        // Update user info if provided
        if (name !== user.name || phone !== user.phone) {
          await repositories.userRepository.update({
            id: user.id,
            name,
            phone,
          });
        }

        // Handle event form data (same logic as above)
        const eventFormData = {
          registrationId: existingRegistration.id,
          fieldResponses: [] as { fieldId: string; value: any }[],
        };

        for (const [key, value] of Object.entries(data)) {
          if (key.startsWith("field_")) {
            const fieldId = key.replace("field_", "");
            eventFormData.fieldResponses.push({
              fieldId,
              value: Array.isArray(value) ? value : value,
            });
          }
        }

        // Update form response if there are field responses
        if (eventFormData.fieldResponses.length > 0) {
          const existingFormResponse = await repositories.formResponseRepository.findByRegistrationId(existingRegistration.id);

          if (existingFormResponse) {
            await repositories.formResponseRepository.bulkUpdateFieldResponses({
              responseId: existingFormResponse.id,
              fieldUpdates: eventFormData.fieldResponses.map(fr => ({
                fieldId: fr.fieldId,
                value: fr.value,
              })),
            });
          } else {
            const formResponseResult = createFormResponseSchema.safeParse(eventFormData);

            if (!formResponseResult.success) {
              return {
                success: false,
                error: "Error de validación del formulario",
                errors: simplifyZodErrors<CreateFormResponseDTO>(formResponseResult.error),
              };
            }

            await repositories.formResponseRepository.create({
              registrationId: existingRegistration.id,
              fieldResponses: eventFormData.fieldResponses,
            });
          }
        }

        // Update event capacity
        await repositories.eventRepository.update({
          id: event.id,
          remainingCapacity: remainingTickets - ticketDifference,
        });

        return {
          success: true,
          message: "Registro actualizado exitosamente.",
          redirectTo: "/registrar-asistente",
        };
      }

      return {
        success: false,
        error: "Estado de registro no válido para actualización.",
      };
    });
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error interno al actualizar registro." };
  }
}; */
