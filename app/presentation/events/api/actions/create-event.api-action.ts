import type { Route as RouteList } from ".react-router/types/app/presentation/events/routes/+types/create";
import { simplifyZodErrors } from "@/shared/lib/utils";
import { EventStatus } from "@prisma/client";
import { updateFormFieldSchema } from "~/domain/dtos/event-form.dto";
import { createEventSchema } from "~/domain/dtos/event.dto";
import { handleServiceError } from "~/shared/lib/error-handler";
import type { ActionData } from "~/shared/types";

export const createEventAction = async ({
  request,
  context: { repositories, session },
}: RouteList.ActionArgs): Promise<ActionData> => {
  const formData = Object.fromEntries(await request.formData());
  const userId = session.get("user")?.id;

  if (!userId) {
    return {
      success: false,
      error: "No se ha iniciado sesión",
    };
  }

  const parsedData = {
    ...formData,
    capacity: formData.capacity ? Number(formData.capacity) : undefined,
    maxTickets: formData.maxTickets ? Number(formData.maxTickets) : undefined,
    status: formData.status || EventStatus.DRAFT,
    organizerId: userId,
    isActive: Boolean(formData.isActive),
    formFields: (() => {
      if (!formData.formFields) return undefined;

      try {
        const parsed = JSON.parse(formData.formFields.toString());

        if (!Array.isArray(parsed)) {
          return null;
        }

        const validatedFields = [];
        for (const [field] of parsed.entries()) {
          const result = updateFormFieldSchema.safeParse(field);
          if (!result.success) {
            return null;
          }
          validatedFields.push(result.data);
        }

        return validatedFields.length > 0 ? validatedFields : undefined;
      } catch {
        return null;
      }
    })(),
    remainingCapacity: formData.capacity
      ? Number(formData.capacity)
      : undefined,
  };

  const { data, success, error } = createEventSchema.safeParse(parsedData);

  console.log("validated form fields: ", data?.formFields);

  if (!success) {
    return {
      success: false,
      errors: simplifyZodErrors(error),
    };
  }

  if ([EventStatus.CANCELLED, EventStatus.ENDED].includes(data.status as any)) {
    return {
      success: false,
      error: "No se puede crear un evento como Cancelado o Finalizado.",
    };
  }

  try {
    const { formFields, ...eventData } = data;

    const createdEvent = await repositories.eventRepository.create({
      ...eventData,
    });

    if (formFields && formFields.length > 0) {
      await repositories.eventFormRepository.create({
        eventId: createdEvent.id,
        title: `Formulario de registro - ${createdEvent.name}`,
        description: "Formulario de registro para el evento",
        isActive: true,
        fields: formFields.map((field, index) => ({
          label: field.label,
          type: field.type,
          required: field.required,
          placeholder: field.placeholder,
          options: field.options,
          validation: field.validation,
          order: index,
        })),
      });
    }

    return {
      success: true,
      message: "Evento creado exitosamente",
      redirectTo: `/eventos`,
    };
  } catch (error) {
    return handleServiceError(error);
  }
};
