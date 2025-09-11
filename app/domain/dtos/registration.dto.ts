import z from "zod";

export const createRegistrationSchema = z.object({
  qrCode: z.string(),
  eventId: z.string(),
  userId: z.string(),
});

export const updateRegistrationSchema = createRegistrationSchema.partial();

export type CreateRegistrationDto = z.infer<typeof createRegistrationSchema>;
export type UpdateRegistrationDto = z.infer<typeof updateRegistrationSchema>;
