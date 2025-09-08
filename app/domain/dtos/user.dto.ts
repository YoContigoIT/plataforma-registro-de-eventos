import { UserRole } from "@prisma/client";
import { z } from "zod";

export const createUserSchema = z.object({
  email: z.email({
    error: "Correo electrónico inválido",
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  }).trim(),
  name: z.string().trim(),
  company: z.string().trim().nullable().optional(),
  title: z.string().trim().nullable().optional(),
  phone: z
    .string({
      error: "El número de teléfono es requerido",
    })
    .trim()
    .regex(/^\d+$/, { message: "El número de teléfono solo debe contener dígitos" })
    .optional(),
  password: z.string().trim().optional(),
  role: z.enum(UserRole).optional(),
});

export const updateUserSchema = createUserSchema.partial();

export const changePasswordSchema = z.object({
  currentPassword: z.string({
    error: "La contraseña actual es requerida.",
  }).trim(),
  newPassword: z.string({
    error: "La nueva contraseña es requerida.",
  }).trim(),
});

export type ChangePasswordDTO = z.infer<typeof changePasswordSchema>;
export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
