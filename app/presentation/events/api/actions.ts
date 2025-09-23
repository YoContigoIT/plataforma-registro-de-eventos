import type { Route as RouteList } from ".react-router/types/app/presentation/events/routes/+types/create";
import { simplifyZodErrors } from "@/shared/lib/utils";
import { EventStatus, UserRole } from "@prisma/client";
import {
  type CreateFormFieldDTO,
  type UpdateFormFieldDTO,
  updateFormFieldSchema,
} from "~/domain/dtos/event-form.dto";
import { createEventSchema, updateEventSchema } from "~/domain/dtos/event.dto";
import type { FormFieldEntity } from "~/domain/entities/event-form.entity";
import { runInTransaction } from "~/infrastructure/db/prisma";
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
    formFields: (() => {
      if (!formData.formFields) return undefined;

      try {
        const parsed = JSON.parse(formData.formFields.toString());

        if (!Array.isArray(parsed)) {
          return null;
        }

        const validatedFields = [];
        for (const [index, field] of parsed.entries()) {
          const result = updateFormFieldSchema.safeParse(field);
          if (!result.success) {
            return null;
          }
          validatedFields.push(result.data);
        }

        return validatedFields.length > 0 ? validatedFields : undefined;
      } catch (error) {
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

  /* const eventFormParsedData = formData.eventFormFields

  const { data: eventFormData, success: eventFormSuccess, error: eventFormError } = createEventFormSchema.safeParse(eventFormParsedData);

  if (!eventFormSuccess) {
    return {
      success: false,
      errors: simplifyZodErrors(eventFormError),
    };
  }
 */

  try {
    // Create the event
    const { formFields, ...eventData } = data;

    const createdEvent = await repositories.eventRepository.create({
      ...eventData,
      /* formFields: undefined, // Remove formFields from event data */
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
    } else {
      // Fallback to default form if no fields provided
      await repositories.eventFormRepository.create({
        eventId: createdEvent.id,
        title: `Formulario de registro - ${createdEvent.name}`,
        description: "Formulario de registro para el evento",
        isActive: true,
        fields: [
          {
            label: "Nombre completo",
            type: "TEXT",
            required: true,
            order: 0,
            validation: { minLength: 2, maxLength: 100 },
          },
          {
            label: "Correo electrónico",
            type: "EMAIL",
            required: true,
            order: 1,
            validation: { pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
          },
        ],
      });
    }

    return {
      success: true,
      message: "Evento creado exitosamente",
      redirectTo: `/eventos`,
    };
  } catch (error) {
    console.error("Error creating event:", error);
    return {
      success: false,
      error: "Error al crear el evento",
    };
  }
};

export const updateEventAction = async ({
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

  let formFields: FormFieldEntity[] | undefined;
  try {
    formFields = formData.formFields
      ? JSON.parse(formData.formFields.toString())
      : undefined;
  } catch {
    return {
      success: false,
      error: "Formato de campos de formulario inválido",
    };
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
    formFields: formFields, // Use the parsed formFields
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

    if (formFields && formFields.length > 0) {
      const existingForm = await repositories.eventFormRepository.findByEventId(
        data.id,
      );

      if (existingForm) {
        await repositories.eventFormRepository.update({
          id: existingForm.id,
          title: `Formulario de registro - ${updatedEvent.name}`,
          description: "Formulario de registro para el evento",
        });

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
                /*  formId: existingForm.id, */
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
      } else {
        // Create new form if it doesn't exist
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
    } else {
      // If no form fields provided, delete existing form if it exists
      const existingForm = await repositories.eventFormRepository.findByEventId(
        data.id,
      );
      if (existingForm) {
        await repositories.eventFormRepository.delete(existingForm.id);
      }
    }

    return {
      success: true,
      message: "Evento actualizado exitosamente",
      redirectTo: `/eventos`,
    };
  } catch (error) {
    console.error("Error updating event:", error);
    return {
      success: false,
      error: "Error al actualizar el evento",
    };
  }
};

export const archiveEventAction = async ({
  request,
  context: { repositories, session },
}: RouteList.ActionArgs): Promise<ActionData> => {
  const formData = Object.fromEntries(await request.formData());
  const userId = session.get("user")?.id;
  const userRole = session.get("user")?.role;
  const eventId = formData.id as string;

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
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Error al archivar el evento",
    };
  }
};

/* 

formFields: (() => {
      if (!formData.formFields) return undefined;

      try {
        const parsed = JSON.parse(formData.formFields.toString());

        if (!Array.isArray(parsed)) {
          return null;
        }

        const validatedFields = [];
        for (const [index, field] of parsed.entries()) {
          const result = updateFormFieldSchema
            .omit({ id: true })
            .safeParse(field);

          if (!result.success) {
            return null;
          }
          validatedFields.push(result.data);
        }

        return validatedFields.length > 0 ? validatedFields : undefined;
      } catch (error) {
        console.error("Error parsing form fields:", error);
        return null;
      }
    })(),*/
