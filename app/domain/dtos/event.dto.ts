import { EventStatus } from "@prisma/client";
import { z } from "zod";
import { createFormFieldSchema, updateFormFieldSchema } from "./event-form.dto";

export const createEventSchema = z
  .object({
    name: z
      .string({
        error: "El nombre del evento es requerido",
      })
      .trim(),
    start_date: z.coerce.date({
      error: "La fecha de inicio es requerida y debe ser una fecha válida",
    }),
    end_date: z.coerce.date({
      error: "La fecha de fin es requerida y debe ser una fecha válida",
    }),
    location: z
      .string({
        error: "La ubicación del evento es requerida",
      })
      .trim(),
    agenda: z.string().trim().nullable().optional(),
    capacity: z
      .number({
        error: "La capacidad debe ser un número válido",
      })
      .int()
      .positive({
        message: "La capacidad debe ser un número positivo",
      }),
    description: z.string().trim().nullable().optional(),
    maxTickets: z
      .number({
        error: "El número máximo de tickets debe ser un número válido",
      })
      .int()
      .positive({
        message: "El número máximo de tickets debe ser un número positivo",
      })
      .nullable()
      .optional(),
    remainingCapacity: z
      .number({
        error: "La capacidad restante debe ser un número valido",
      })
      .int()
      .positive({
        message: "La capacidad restante debe ser un número positivo",
      })
      .nullable()
      .optional(),
    status: z.enum(EventStatus).default(EventStatus.DRAFT),
    organizerId: z.uuid({
      message: "El ID del organizador debe ser un UUID válido",
    }),
    isPublic: z.boolean().default(false),
    requiresSignature: z.boolean().default(false),
    publicInviteToken: z.string().trim().nullable().optional(),
    regeneratePublicInviteToken: z.boolean().default(false).optional(),
    formFields: z.array(createFormFieldSchema).nullable().optional(),
    eventUrl: z.string().trim().nullable().optional(),
    privacyPolicyUrl: z.string().trim().nullable().optional(),
    contactEmail: z.string().trim().nullable().optional(),
  })
  .refine((data) => data.end_date >= data.start_date, {
    message: "La fecha de fin debe ser posterior o igual a la fecha de inicio",
    path: ["end_date"],
  })
  .refine(
    (data) =>
      data.maxTickets == null ||
      data.capacity == null ||
      data.maxTickets <= data.capacity,
    {
      message:
        "El número máximo de tickets por persona no puede ser mayor que la capacidad total",
      path: ["maxTickets"],
    },
  );

export const updateEventSchema = createEventSchema.partial().extend({
  id: z.uuid(),
  formFields: z.array(updateFormFieldSchema).optional(),
});

export type CreateEventDTO = z.infer<typeof createEventSchema>;
export type UpdateEventDTO = z.infer<typeof updateEventSchema>;
