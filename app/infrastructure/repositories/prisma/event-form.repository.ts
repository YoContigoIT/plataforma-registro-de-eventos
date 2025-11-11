import type { PrismaClient } from "@prisma/client";
import type {
  CreateEventFormDTO,
  CreateFormFieldDTO,
  ReorderFieldsDTO,
  UpdateEventFormDTO,
  UpdateFormFieldDTO,
} from "~/domain/dtos/event-form.dto";
import type {
  EventFormEntity,
  EventFormWithFields,
  FormFieldEntity,
} from "~/domain/entities/event-form.entity";
import type { IEventFormRepository } from "~/domain/repositories/event-form.repository";
import { runInTransaction } from "~/infrastructure/db/prisma";

export const PrismaEventFormRepository = (
  prisma: PrismaClient
): IEventFormRepository => {
  return {
    findByEventId: async (
      eventId: string
    ): Promise<EventFormWithFields | null> => {
      return await prisma.eventForm.findUnique({
        where: { eventId },
        include: {
          fields: {
            orderBy: { order: "asc" },
          },
        },
      });
    },

    create: async (data: CreateEventFormDTO) => {
      return await runInTransaction(async () => {
        const form = await prisma.eventForm.create({
          data: {
            eventId: data.eventId,
            title: data.title,
            description: data.description,
          },
        });

        await prisma.formField.createMany({
          data: data.fields.map((field, index) => ({
            formId: form.id,
            label: field.label,
            type: field.type,
            required: field.required,
            placeholder: field.placeholder ?? undefined,
            options: field.options ?? undefined,
            validation: field.validation ?? undefined,
            order: index,
          })),
        });
      });
    },

    // Update form (title/description only)
    update: async (data: UpdateEventFormDTO): Promise<EventFormEntity> => {
      return await prisma.eventForm.update({
        where: { id: data.id },
        data: {
          title: data.title,
          description: data.description,
          isActive: data.isActive,
          updatedAt: new Date(),
        },
        include: {
          fields: {
            orderBy: { order: "asc" },
          },
        },
      });
    },

    delete: async (id: string): Promise<void> => {
      await prisma.eventForm.delete({
        where: { id },
      });
    },

    // Individual Field Management (for editing existing forms)
    updateField: async (data: UpdateFormFieldDTO): Promise<FormFieldEntity> => {
      return await prisma.formField.update({
        where: { id: data.id },
        data: {
          label: data.label,
          type: data.type,
          required: data.required,
          placeholder: data.placeholder ?? undefined,
          options: data.options ?? undefined,
          validation: data.validation ?? undefined,
          order: data.order,
        },
      });
    },

    deleteField: async (id: string): Promise<void> => {
      await prisma.formField.delete({
        where: { id },
      });
    },

    addField: async (
      formId: string,
      data: CreateFormFieldDTO
    ): Promise<FormFieldEntity> => {
      return await prisma.formField.create({
        data: {
          formId,
          label: data.label,
          type: data.type,
          required: data.required,
          placeholder: data.placeholder ?? undefined,
          options: data.options ?? undefined,
          validation: data.validation ?? undefined,
          order: data.order,
        },
      });
    },

    reorderFields: async (data: ReorderFieldsDTO): Promise<void> => {
      return await runInTransaction(async () => {
        for (const fieldOrder of data.fieldOrders) {
          await prisma.formField.update({
            where: { id: fieldOrder.id },
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
