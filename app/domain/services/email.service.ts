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
  sendEventInvitation(to: string, eventName: string, eventDate: string): Promise<void>;
  sendPasswordReset(to: string, resetCode: string): Promise<void>;
}