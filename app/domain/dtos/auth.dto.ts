import { z } from "zod";

// Esquema para el inicio de sesión
export const loginSchema = z.object({
  email: z
    .email({ error: "El correo electrónico es requerido" })
    .toLowerCase()
    .trim(),
  password: z
    .string({
      error: "El tipo de dato ingresado no es válido",
    })
    .trim()
    .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
    .max(32, { message: "La contraseña no debe exceder 32 caracteres" }),
});

// Esquema para solicitar restablecimiento de contraseña
export const forgotPasswordSchema = z.object({
  email: z
    .email({ error: "Ingresa un correo válido" })
    .toLowerCase()
    .trim(),
});

// Esquema para restablecer la contraseña con el código
export const resetPasswordSchema = z
  .object({
    email: z
      .email({ error: "El correo electrónico es requerido" })
      .toLowerCase()
      .trim(),
    code: z
      .string()
      .trim()
      .min(1, { message: "El código es requerido" })
      .length(6, { message: "El código debe tener exactamente 6 dígitos" })
      .regex(/^\d+$/, { message: "El código solo debe contener números" }),
    newPassword: z  
      .string()
      .trim()
      .min(6, { message: "La contraseña debe tener al menos 6 caracteres" })
      .max(32, { message: "La contraseña no debe exceder 32 caracteres" }),
    confirmNewPassword: z
      .string()
      .trim()
      .min(1, { message: "La confirmación de contraseña es requerida" }),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmNewPassword"], // El error se asigna a este campo
  });

// Tipos inferidos (DTOs), no necesitan cambios
export type LoginDTO = z.infer<typeof loginSchema>;
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDTO = z.infer<typeof resetPasswordSchema>;