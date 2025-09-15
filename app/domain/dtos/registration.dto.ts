import { RegistrationStatus } from "@prisma/client";
import z from "zod";

export const createRegistrationSchema = z.object({
  qrCode: z.string(),
  eventId: z.string(),
  userId: z.string(),
  status: z.enum(RegistrationStatus).optional().default(RegistrationStatus.PENDING),
  inviteToken: z.string().optional(),
  invitedAt: z.date().optional(),
  respondedAt: z.date().optional(),
  registeredAt: z.date().optional(),
});

export const updateRegistrationSchema = createRegistrationSchema.partial().extend({
  id: z.uuid({
    error: "Id inválido",
  }),
});

export type CreateRegistrationDto = z.infer<typeof createRegistrationSchema>;
export type UpdateRegistrationDto = z.infer<typeof updateRegistrationSchema>;
