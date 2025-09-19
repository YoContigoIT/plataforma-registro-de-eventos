import type { PrismaClient } from "@prisma/client";
import type {
    CreateEventFormDTO,
    ReorderFieldsDTO,
    UpdateEventFormDTO,
    UpdateFormFieldDTO,
} from "~/domain/dtos/event-form.dto";
import type {
    EventFormEntity,
    FormFieldEntity,
} from "~/domain/entities/event-form.entity";
import type {
    IEventFormRepository
} from "~/domain/repositories/event-form.repository";

export const PrismaEventFormRepository = (
  prisma: PrismaClient,
): IEventFormRepository => {
  return {
    // Find form by event ID with all fields
    findByEventId: async (eventId: string): Promise<EventFormEntity | null> => {
      return await prisma.eventForm.findUnique({
        where: { eventId },
        include: {
          fields: {
            orderBy: { order: "asc" },
          },
        },
      });
    },

    // Create form with all fields atomically
    create: async (data: CreateEventFormDTO): Promise<EventFormEntity> => {
      return await prisma.$transaction(async (tx) => {
        // Create the form first
        const form = await tx.eventForm.create({
          data: {
            eventId: data.eventId,
            title: data.title,
            description: data.description,
          },
        });

        // Create all fields with proper order
        await tx.formField.createMany({
          data: data.fields.map((field, index) => ({
            formId: form.id,
            label: field.label,
            type: field.type,
            required: field.required,
            options: field.options ?? undefined,
            validation: field.validation ?? undefined,
            order: index, // Auto-assign order based on array position
          })),
        });

        // Return form with fields
        return (await tx.eventForm.findUnique({
          where: { id: form.id },
          include: {
            fields: {
              orderBy: { order: "asc" },
            },
          },
        })) as EventFormEntity;
      });
    },

    // Update form (title/description only)
    update: async (data: UpdateEventFormDTO): Promise<EventFormEntity> => {
      return await prisma.eventForm.update({
        where: { id: data.id },
        data: {
          title: data.title,
          description: data.description,
        },
        include: {
          fields: {
            orderBy: { order: "asc" },
          },
        },
      });
    },

    // Delete form (cascade will delete fields)
    delete: async (id: string): Promise<void> => {
      await prisma.eventForm.delete({
        where: { id },
      });
    },

    // Update individual field
    updateField: async (data: UpdateFormFieldDTO): Promise<FormFieldEntity> => {
      return await prisma.formField.update({
        where: { id: data.id },
        data: {
          label: data.label,
          type: data.type,
          required: data.required,
          options: data.options ?? undefined,
          validation: data.validation ?? undefined,
        },
      });
    },

    // Delete individual field
    deleteField: async (id: string): Promise<void> => {
      await prisma.formField.delete({
        where: { id },
      });
    },

    // Reorder fields
    reorderFields: async (data: ReorderFieldsDTO): Promise<void> => {
      await prisma.$transaction(async (tx) => {
        // Update each field's order
        for (const fieldOrder of data.fieldOrders) {
          await tx.formField.update({
            where: { id: fieldOrder.fieldId },
            data: { order: fieldOrder.order },
          });
        }
      });
    },

    // Check if form exists for event
    formExists: async (eventId: string): Promise<boolean> => {
      const count = await prisma.eventForm.count({
        where: { eventId },
      });
      return count > 0;
    },

    // Get fields by form ID
    getFieldsByFormId: async (formId: string): Promise<FormFieldEntity[]> => {
      return await prisma.formField.findMany({
        where: { formId },
        orderBy: { order: "asc" },
      });
    },
  };
};
