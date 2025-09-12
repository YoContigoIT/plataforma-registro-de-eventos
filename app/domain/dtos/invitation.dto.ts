import { RegistrationStatus } from "@prisma/client";
import { z } from "zod";

// Esquema para un solo email de invitación
export const invitationEmailSchema = z.object({
  email: z
    .email({
      message: "Debe ser un correo electrónico válido",
    })
    .trim()
    .toLowerCase(),
  name: z
    .string({
      error: "El nombre es requerido",
    })
    .trim()
    .min(1, "El nombre no puede estar vacío")
    .optional(),
});

// Esquema para el formulario de invitaciones múltiples
export const sendInvitationsSchema = z.object({
  eventId: z.uuid({
    message: "El ID del evento debe ser un UUID válido",
  }),
  emails: z.string({
    error: "Debe proporcionar al menos un correo electrónico",
  }),
  message: z
    .string()
    .trim()
    .max(500, "El mensaje personalizado no puede exceder 500 caracteres")
    .optional(),
});

// Esquema para invitación individual (para casos específicos)
export const sendSingleInvitationSchema = z.object({
  eventId: z
    .string({
      error: "El ID del evento es requerido",
    })
    .uuid({
      message: "El ID del evento debe ser un UUID válido",
    }),
  email: z
    .string({
      error: "El correo electrónico es requerido",
    })
    .email({
      message: "Debe ser un correo electrónico válido",
    })
    .trim()
    .toLowerCase(),
  name: z.string().trim().min(1, "El nombre no puede estar vacío").optional(),
  message: z
    .string()
    .trim()
    .max(500, "El mensaje personalizado no puede exceder 500 caracteres")
    .optional(),
});

// Esquema para validar emails desde texto (separados por comas, saltos de línea, etc.)
export const bulkEmailInputSchema = z
  .object({
    emailText: z
      .string({
        error: "Debe proporcionar los correos electrónicos",
      })
      .trim()
      .min(1, "Debe incluir al menos un correo electrónico"),
  })
  .transform((data) => {
    // Extraer emails del texto usando regex
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = data.emailText.match(emailRegex) || [];

    // Eliminar duplicados y convertir a lowercase
    const uniqueEmails = [
      ...new Set(emails.map((email) => email.toLowerCase())),
    ];

    return {
      emails: uniqueEmails.map((email) => ({ email })),
      originalText: data.emailText,
    };
  })
  .refine((data) => data.emails.length > 0, {
    message: "No se encontraron correos electrónicos válidos en el texto",
    path: ["emailText"],
  })
  .refine((data) => data.emails.length <= 100, {
    message: "No puede procesar más de 100 correos electrónicos a la vez",
    path: ["emailText"],
  });

// Esquema para respuesta de invitación (cuando el usuario responde)
export const invitationResponseSchema = z.object({
  token: z
    .string({
      error: "El token de invitación es requerido",
    })
    .trim()
    .min(1, "Token de invitación inválido"),
  response: z.enum(RegistrationStatus).default(RegistrationStatus.PENDING),
  additionalInfo: z
    .object({
      dietaryRestrictions: z.string().trim().optional(),
      specialRequests: z.string().trim().optional(),
      companionCount: z.number().int().min(0).max(5).optional(),
    })
    .optional(),
});

// Tipos TypeScript inferidos
export type InvitationEmailDTO = z.infer<typeof invitationEmailSchema>;
export type SendInvitationsDTO = z.infer<typeof sendInvitationsSchema>;
export type SendSingleInvitationDTO = z.infer<
  typeof sendSingleInvitationSchema
>;
export type BulkEmailInputDTO = z.infer<typeof bulkEmailInputSchema>;
export type InvitationResponseDTO = z.infer<typeof invitationResponseSchema>;

// Esquemas de validación adicionales para formularios
export const invitationFormSchema = sendInvitationsSchema.extend({
  // Campos adicionales específicos del formulario
  includeEventDetails: z.boolean().default(true),
  reminderDate: z.coerce.date().optional(),
  allowGuestRegistration: z.boolean().default(false),
});

export type InvitationFormDTO = z.infer<typeof invitationFormSchema>;
