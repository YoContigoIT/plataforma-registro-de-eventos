import { UserRole } from "@prisma/client";
import { z } from "zod";

export const createUserSchema = z.object({
  email: z
    .email({
      error: "Correo electrónico inválido",
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    })
    .trim(),
  name: z.string().trim(),
  company: z.string().trim().nullable().optional(),
  title: z.string().trim().nullable().optional(),
  phone: z
    .string({
      error: "El número de teléfono es requerido",
    })
    .trim()
    .transform((val) => (val === "" ? undefined : val)) // 🔑
    .optional()
    .refine((val) => !val || /^\d+$/.test(val), {
      message: "El número de teléfono solo debe contener dígitos",
    }),
  password: z.string().trim().optional(),
  role: z.enum(UserRole).optional(),
});

export const updateUserSchema = createUserSchema.partial();

export const changePasswordSchema = z.object({
  currentPassword: z
    .string({
      error: "La contraseña actual es requerida.",
    })
    .trim(),
  newPassword: z
    .string({
      error: "La nueva contraseña es requerida.",
    })
    .trim(),
});

export const createGuestSchema = createUserSchema.extend({
  eventId: z.string({
    error: "El ID del evento es requerido",
  }),
  quantity: z
    .string({ error: "La cantidad de invitados es requerida" })
    .min(1, "La cantidad de invitados debe ser al menos 1"),
});

export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;
export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type CreateGuestDTO = z.infer<typeof createGuestSchema>;
