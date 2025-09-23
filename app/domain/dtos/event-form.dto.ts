import { FormFieldType } from "@prisma/client";
import { z } from "zod";

// Form Field DTOs
export const createFormFieldSchema = z.object({
  label: z
    .string({
      error: "La etiqueta del campo es requerida",
    })
    .trim()
    .min(1, "La etiqueta no puede estar vacía"),
  type: z.enum(FormFieldType, {
    error: "El tipo de campo debe ser válido",
  }),
  required: z.boolean().default(false),
  placeholder: z.string().trim().nullable().optional(),
  options: z
    .array(z.string().trim())
    .nullable()
    .optional(),
  validation: z.record(z.string(), z.any()).nullable().optional(),
  order: z
    .number({
      error: "El orden debe ser un número válido",
    })
    .int()
    .min(0, "El orden debe ser un número positivo"),
});

export const updateFormFieldSchema = createFormFieldSchema.partial().extend({
  id: z
    .string({
      message: "El ID del campo debe ser un UUID válido",
    })
    .trim()
    .optional(),
});

// Event Form DTOs
export const createEventFormSchema = z.object({
  eventId: z
    .string({
      error: "El ID del evento es requerido",
    })
    .uuid({
      message: "El ID del evento debe ser un UUID válido",
    })
    .trim(),
  title: z
    .string({
      error: "El título del formulario es requerido",
    })
    .trim()
    .min(1, "El título no puede estar vacío"),
  description: z.string().trim().nullable().optional(),
  isActive: z.boolean().default(true),
  fields: z.array(createFormFieldSchema).min(1, "Debe incluir al menos un campo"),
});

export const updateEventFormSchema = createEventFormSchema.partial().extend({
  id: z
    .uuid({
      message: "El ID del formulario debe ser un UUID válido",
    })
    .trim(),
});

// Field reordering DTO
export const reorderFieldsSchema = z.object({
  formId: z
    .uuid({
      message: "El ID del formulario debe ser un UUID válido",
    })
    .trim(),
  fieldOrders: z.array(
    z.object({
      id: z
        .string({
          error: "El ID del campo es requerido",
        })
        .uuid({
          message: "El ID del campo debe ser un UUID válido",
        })
        .trim(),
      order: z
        .number({
          error: "El orden debe ser un número válido",
        })
        .int()
        .min(0, "El orden debe ser un número positivo"),
    })
  ),
});

// Type exports
export type CreateFormFieldDTO = z.infer<typeof createFormFieldSchema>;
export type UpdateFormFieldDTO = z.infer<typeof updateFormFieldSchema>;
export type CreateEventFormDTO = z.infer<typeof createEventFormSchema>;
export type UpdateEventFormDTO = z.infer<typeof updateEventFormSchema>;
export type ReorderFieldsDTO = z.infer<typeof reorderFieldsSchema>;