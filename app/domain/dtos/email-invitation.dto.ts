import { z } from 'zod';

// Email invitation template data schema
export const invitationEmailSchema = z.object({
  userName: z.string().min(1, 'User name is required'),
  eventName: z.string().min(1, 'Event name is required'),
  eventDate: z.string().min(1, 'Event date is required'),
  eventTime: z.string().min(1, 'Event time is required'),
  eventLocation: z.string().min(1, 'Event location is required'),
  customMessage: z.string().optional(),
  inviteUrl: z.string().url('Invalid invite URL'),
  eventDetailsUrl: z.string().url('Invalid event details URL'),
  inviteToken: z.string().min(1, 'Invite token is required'),
  supportEmail: z.string().email('Invalid support email')
});

// Send email invitation request schema
export const SendEmailInvitationSchema = z.object({
  recipientEmail: z.string().email('Invalid recipient email'),
  recipientName: z.string().min(1, 'Recipient name is required'),
  eventId: z.string().min(1, 'Event ID is required'),
  customMessage: z.string().optional(),
  inviteToken: z.string().min(1, 'Invite token is required')
});

// Email invitation response schema
export const EmailInvitationResponseSchema = z.object({
  success: z.boolean(),
  messageId: z.string().optional(),
  error: z.string().optional()
});

// Type inference from schemas
export type InvitationEmailDto = z.infer<typeof invitationEmailSchema>;
export type SendEmailInvitationDto = z.infer<typeof SendEmailInvitationSchema>;
export type EmailInvitationResponseDto = z.infer<typeof EmailInvitationResponseSchema>;
