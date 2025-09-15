import { z } from "zod";

// Email invitation template data schema
export const invitationEmailSchema = z.object({
  userName: z.string().min(1, "User name is required"),
  userEmail: z.email("Invalid user email").optional(),
  userCompany: z.string().optional(),
  userTitle: z.string().optional(),
  eventName: z.string().min(1, "Event name is required"),
  eventDescription: z.string().optional(),
  eventDate: z.string().min(1, "Event date is required"),
  eventTime: z.string().min(1, "Event time is required"),
  eventLocation: z.string().min(1, "Event location is required"),
  eventCapacity: z.number().optional(),
  maxTickets: z.number().optional(),
  organizerName: z.string().min(1, "Organizer name is required").optional(),
  organizerEmail: z.email("Invalid organizer email").optional(),
  customMessage: z.string().optional(),
  inviteUrl: z.string().url("Invalid invite URL").optional(),
  eventDetailsUrl: z.string().url("Invalid event details URL").optional(),
  inviteToken: z.string().optional(),
  supportEmail: z.email("Invalid support email").optional(),
  responseDeadline: z.string().optional(),
});

// Registration confirmation email template data schema
export const registrationConfirmationEmailSchema = z.object({
  userName: z.string().min(1, "User name is required"),
  eventName: z.string().min(1, "Event name is required"),
  eventDate: z.string().min(1, "Event date is required"),
  eventTime: z.string().min(1, "Event time is required"),
  eventLocation: z.string().min(1, "Event location is required"),
  qrCode: z.string().min(1, "QR code is required"),
  qrCodeUrl: z.string().url("Invalid QR code URL"),
  customMessage: z.string().optional(),
  eventDetailsUrl: z.string().url("Invalid event details URL").optional(),
  supportEmail: z.string().email("Invalid support email").optional(),
  ticketsQuantity: z.number().optional(),
});

// Type inference from schemas
export type InvitationEmailDto = z.infer<typeof invitationEmailSchema>;
export type RegistrationConfirmationEmailDto = z.infer<
  typeof registrationConfirmationEmailSchema
>;
