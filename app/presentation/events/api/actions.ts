import type { Route as ArchiveRoute } from ".react-router/types/app/presentation/events/routes/+types/archive";
import type { Route as RouteList } from ".react-router/types/app/presentation/events/routes/+types/create";
import { simplifyZodErrors } from "@/shared/lib/utils";
import { EventStatus, RegistrationStatus, UserRole } from "@prisma/client";
import {
  type CreateFormFieldDTO,
  type UpdateFormFieldDTO,
  updateFormFieldSchema,
} from "~/domain/dtos/event-form.dto";
import { createEventSchema, updateEventSchema } from "~/domain/dtos/event.dto";
import type { FormFieldEntity } from "~/domain/entities/event-form.entity";
import { runInTransaction } from "~/infrastructure/db/prisma";
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
    await repositories.eventRepository.create(data);

    return {
      success: true,
      message: "Evento creado exitosamente",
      redirectTo: `/eventos`,
    };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const updateEventAction = async ({
  request,
  context: { repositories, session, services },
}: RouteList.ActionArgs): Promise<ActionData> => {
  const formData = Object.fromEntries(await request.formData());
  const userId = session.get("user")?.id;

  console.log("isActive:", formData.isActive === "true");

  if (!userId) {
    return {
      success: false,
      error: "No se ha iniciado sesión",
    };
  }

  let formFields: FormFieldEntity[] | undefined;
  try {
    formFields = formData.formFields
      ? JSON.parse(formData.formFields.toString())
      : undefined;
  } catch (error) {
    return handleServiceError(error);
  }

  const parsedData = {
    ...formData,
    id: formData.id,
    start_date: formData.start_date
      ? new Date(formData.start_date.toString())
      : undefined,
    end_date: formData.end_date
      ? new Date(formData.end_date.toString())
      : undefined,
    capacity: formData.capacity ? Number(formData.capacity) : undefined,
    maxTickets: formData.maxTickets ? Number(formData.maxTickets) : undefined,
    status: formData.status || EventStatus.DRAFT,
    organizerId: userId,
    formFields: formFields,
    remainingCapacity: formData.capacity
      ? Number(formData.capacity)
      : undefined,
  };

  const { data, success, error } = updateEventSchema.safeParse(parsedData);

  if (!success) {
    return {
      success: false,
      errors: simplifyZodErrors(error),
    };
  }

  const existingEvent = await repositories.eventRepository.findUnique(data.id);
  if (!existingEvent) {
    return { success: false, error: "Evento no encontrado" };
  }

  // Si ya terminó, no se puede cambiar el estado
  if (
    existingEvent.status === EventStatus.ENDED &&
    data.status !== EventStatus.ENDED
  ) {
    return {
      success: false,
      error: "El evento ya terminó, no se permite cambiar el estado.",
    };
  }

  // Si está en curso, solo se permite pasar a Finalizado
  if (
    existingEvent.status === EventStatus.ONGOING &&
    data.status !== EventStatus.ENDED
  ) {
    return {
      success: false,
      error: "Un evento en curso solo puede marcarse como Finalizado.",
    };
  }

  try {
    //edge case: when we update the event capacity, we preserve the updated capacity
    //even if the event is full, we allow the update to keep the capacity
    const statusCounts =
      await repositories.registrationRepository.countAllStatusesByEvent(
        data.id,
      );

    const registeredCount =
      (statusCounts.REGISTERED || 0) + (statusCounts.CHECKED_IN || 0);

    const eventCapacity = Number(data.capacity);

    //validate that new capacity is not smaller than current registered attendees
    if (eventCapacity < registeredCount) {
      return {
        success: false,
        error: `No se puede reducir la capacidad a ${eventCapacity} porque ya hay ${registeredCount} personas registradas. 
        La capacidad mínima debe ser ${registeredCount}.`,
      };
    }

    const calculatedRemainingCapacity = Math.max(
      0,
      eventCapacity - registeredCount,
    );

    const { formFields, ...eventData } = data;

    const updatedEvent = await repositories.eventRepository.update({
      ...eventData,
      remainingCapacity: calculatedRemainingCapacity,
    });

    if (data.status === EventStatus.CANCELLED) {
      const invitations =
        await repositories.registrationRepository.findByEventId(data.id);
      // Filtrar solo los asistentes con estado válido
      const attendeesToNotify = invitations.filter(
        (invite) =>
          invite.status === RegistrationStatus.REGISTERED ||
          invite.status === RegistrationStatus.CHECKED_IN,
      );

      // Generar y enviar el correo de cancelación
      for (const attendee of attendeesToNotify) {
        if (!data.start_date) continue;
        await services.emailService.sendCancelInvitationEmail(
          {
            eventName: data.name || "",
            eventDate: data?.start_date.toLocaleDateString() || "",
            eventTime: data?.start_date.toLocaleTimeString() || "",
            eventLocation: data.location || "",
            userName: attendee.user.name || "",
          },
          attendee.user.email,
        );
      }
    }

    // Check if we have an existing form
    const existingForm = await repositories.eventFormRepository.findByEventId(
      data.id,
    );

    // Handle form logic based on isActive state and form fields
    const isFormActive = formData.isActive === "true";

    if (existingForm) {
      // Update existing form's isActive state
      await repositories.eventFormRepository.update({
        id: existingForm.id,
        title: `Formulario de registro - ${updatedEvent.name}`,
        description: "Formulario de registro para el evento",
        isActive: isFormActive,
      });

      // Only update fields if form is active and fields are provided
      if (isFormActive && formFields && formFields.length > 0) {
        // Get current fields for comparison
        const currentFields = existingForm.fields || [];
        const newFields = formFields;

        // Create maps for efficient O(1) lookup
        const currentFieldsMap = new Map(
          currentFields.map((field) => [field.id, field]),
        );

        // Track operations for batch processing
        const fieldsToUpdate: Array<{
          id: string;
          data: Partial<UpdateFormFieldDTO>;
        }> = [];
        const fieldsToDelete: string[] = [];
        const fieldsToCreate: Array<{
          data: CreateFormFieldDTO;
          tempId?: string;
        }> = [];
        const fieldsToReorder: Array<{ id: string; order: number }> = [];

        // 1. Identify fields to update (existing fields with real database IDs)
        for (const newField of newFields) {
          if (
            newField.id &&
            !newField.id.startsWith("new-field-") &&
            currentFieldsMap.has(newField.id)
          ) {
            const currentField = currentFieldsMap.get(newField.id);
            if (!currentField) continue;

            // Deep comparison to check if field needs updating
            const needsUpdate =
              currentField.label !== newField.label ||
              currentField.type !== newField.type ||
              currentField.required !== newField.required ||
              currentField.placeholder !== newField.placeholder ||
              JSON.stringify(currentField.options) !==
                JSON.stringify(newField.options) ||
              JSON.stringify(currentField.validation) !==
                JSON.stringify(newField.validation);

            if (needsUpdate) {
              fieldsToUpdate.push({
                id: newField.id,
                data: {
                  label: newField.label,
                  type: newField.type,
                  required: newField.required,
                  placeholder: newField.placeholder,
                  options: newField.options,
                  validation: newField.validation,
                },
              });
            }

            // Check if order changed
            const newOrder = newFields.findIndex((f) => f.id === newField.id);
            if (currentField.order !== newOrder) {
              fieldsToReorder.push({
                id: newField.id,
                order: newOrder,
              });
            }
          }
        }

        // 2. Identify fields to delete (exist in current but not in new)
        const newFieldIds = new Set(
          newFields
            .filter((field) => field.id && !field.id.startsWith("new-field-"))
            .map((field) => field.id),
        );

        for (const currentField of currentFields) {
          if (!newFieldIds.has(currentField.id)) {
            fieldsToDelete.push(currentField.id);
          }
        }

        // 3. Identify fields to create (fields with new-field- prefix)
        for (const [index, newField] of newFields.entries()) {
          if (newField.id?.startsWith("new-field-")) {
            fieldsToCreate.push({
              data: {
                label: newField.label || "",
                type: newField.type || "TEXT",
                required: newField.required || false,
                placeholder: newField.placeholder || "",
                options: newField.options || [],
                validation: newField.validation || {},
                order: index,
              },
              tempId: newField.id,
            });
          }
        }

        // Execute operations in transaction for atomicity
        await runInTransaction(async () => {
          // Batch update existing fields
          for (const fieldUpdate of fieldsToUpdate) {
            await repositories.eventFormRepository.updateField({
              id: fieldUpdate.id,
              ...fieldUpdate.data,
            });
          }

          // Batch delete removed fields
          for (const fieldId of fieldsToDelete) {
            await repositories.eventFormRepository.deleteField(fieldId);
          }

          // Create new fields one by one (since we need individual IDs)
          for (const fieldCreate of fieldsToCreate) {
            // Get the highest order to append new fields
            const maxOrder = await repositories.eventFormRepository
              .getFieldsByFormId(existingForm.id)
              .then((fields) => Math.max(...fields.map((f) => f.order), -1));

            await repositories.eventFormRepository.addField(existingForm.id, {
              ...fieldCreate.data,
              order: maxOrder + 1,
            });
          }

          // Batch reorder fields if needed
          if (fieldsToReorder.length > 0) {
            await repositories.eventFormRepository.reorderFields({
              formId: existingForm.id,
              fieldOrders: fieldsToReorder,
            });
          }
        });
      }
      // If form is disabled, we keep the existing fields unchanged
    } else if (isFormActive && formFields && formFields.length > 0) {
      // Create new form only if form is active and has fields
      await repositories.eventFormRepository.create({
        eventId: data.id,
        title: `Formulario de registro - ${updatedEvent.name}`,
        description: "Formulario de registro para el evento",
        isActive: true,
        fields: formFields.map((field, index) => ({
          label: field.label || "",
          type: field.type || "TEXT",
          required: field.required || false,
          placeholder: field.placeholder || "",
          options: field.options || [],
          validation: field.validation || {},
          order: index,
        })),
      });
    }
    // Note: We no longer delete the form when no fields are provided
    // The form is only deleted if explicitly requested, not when disabled

    return {
      success: true,
      message: "Evento actualizado exitosamente",
      redirectTo: `/eventos`,
    };
  } catch (error) {
    return handleServiceError(error);
  }
};

export const archiveEventAction = async ({
  params,
  context: { repositories, session },
}: ArchiveRoute.ActionArgs): Promise<ActionData> => {
  const userId = session.get("user")?.id;
  const userRole = session.get("user")?.role;
  const eventId = params.id as string;

  if (!userId) {
    return {
      success: false,
      error: "No se ha iniciado sesión",
    };
  }

  if (!userRole || userRole !== UserRole.ADMIN) {
    return {
      success: false,
      error: "No tienes permisos para archivar eventos",
    };
  }

  try {
    await repositories.eventRepository.softDelete(eventId);

    return {
      success: true,
      message: "Evento archivado exitosamente",
      redirectTo: `/eventos`,
    };
  } catch (error) {
    console.error("Error al archivar el evento:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Error al archivar el evento",
    };
  }
};
