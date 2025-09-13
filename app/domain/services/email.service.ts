import type { InvitationEmailDto, RegistrationConfirmationEmailDto } from "../dtos/email-invitation.dto";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export interface IEmailService {
  sendEmail(options: EmailOptions): Promise<void>;
  sendWelcomeEmail(to: string, userName: string): Promise<void>;
  sendLoginNotification(to: string, userName: string, loginInfo: { ipAddress: string; userAgent: string; timestamp: Date }): Promise<void>;
  sendPasswordReset(to: string, resetCode: string): Promise<void>;
  sendRegistrationConfirmation(to: string, registrationData: RegistrationConfirmationEmailDto): Promise<void>;
  sendInvitationEmail(emailData: InvitationEmailDto, recipientEmail: string): Promise<void>;
}
