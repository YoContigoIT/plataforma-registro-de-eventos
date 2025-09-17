import type { RegistrationConfirmationEmailDto } from "~/domain/dtos/email-invitation.dto";
import { invitationEmailSchema } from "~/domain/dtos/email-invitation.dto";
import type {
  EmailOptions,
  EmailResponse,
  IEmailService,
} from "~/domain/services/email.service";
import { generateRegistrationConfirmationTemplate } from "~/presentation/templates/registration-confirmation.template";
import type { InvitationEmailDto } from "../../domain/dtos/email-invitation.dto";
import { generateInvitationEmailTemplate } from "../../presentation/templates/invitation-email.template";
import { env } from "../config/env";
import { transporter } from "../config/nodemailer";

export const EmailService = (): IEmailService => ({
  sendEmail: async (options: EmailOptions): Promise<void> => {
    try {
      await transporter.sendMail({
        from: options.from || env.EMAIL_FROM,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
    } catch (error) {
      throw new Error(`Error sending email: ${error}`);
    }
  },

  sendWelcomeEmail: async (to: string, userName: string): Promise<void> => {
    const subject = "¡Bienvenido a la plataforma de eventos!";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">¡Hola ${userName}!</h2>
        <p>Bienvenido a nuestra plataforma de gestión de eventos.</p>
        <p>Ya puedes comenzar a explorar y registrarte en los eventos disponibles.</p>
        <p>¡Esperamos que disfrutes de la experiencia!</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Este es un correo automático, por favor no responder.</p>
      </div>
    `;

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  },

  sendLoginNotification: async (
    to: string,
    userName: string,
    loginInfo: { ipAddress: string; userAgent: string; timestamp: Date }
  ): Promise<EmailResponse> => {
    try {
      const subject = "Nuevo inicio de sesión detectado";
      const formattedDate = loginInfo.timestamp.toLocaleString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Mexico_City",
      });

      const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">¡Hola ${userName}!</h2>
        <p>Se ha detectado un nuevo inicio de sesión en tu cuenta.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">Detalles del inicio de sesión:</h3>
          <p><strong>Fecha y hora:</strong> ${formattedDate}</p>
          <p><strong>Dirección IP:</strong> ${loginInfo.ipAddress}</p>
          <p><strong>Navegador:</strong> ${loginInfo.userAgent}</p>
        </div>
        
        <p>Si fuiste tú quien inició sesión, puedes ignorar este correo.</p>
        <p>Si no reconoces esta actividad, te recomendamos cambiar tu contraseña inmediatamente.</p>
        
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Este es un correo automático de seguridad, por favor no responder.</p>
      </div>
    `;

      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
      });
      return {
        success: true,
        message: "Login notification email sent successfully",
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Login notification email sent failed",
      };
    }
  },

  sendPasswordReset: async (to: string, resetCode: string): Promise<void> => {
    const subject = "Código de restablecimiento de contraseña";
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Restablecimiento de contraseña</h2>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Tu código de verificación es:</p>
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 3px; margin: 20px 0;">
          ${resetCode}
        </div>
        <p>Este código expira en 15 minutos.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">Este es un correo automático, por favor no responder.</p>
      </div>
    `;

    await transporter.sendMail({
      from: env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  },

  sendRegistrationConfirmation: async (
    to: string,
    registrationData: RegistrationConfirmationEmailDto
  ): Promise<EmailResponse> => {
    try {
      console.log(registrationData);

      const subject = `Confirmación de registro - ${registrationData.eventName}`;

      const htmlTemplate =
        generateRegistrationConfirmationTemplate(registrationData);

      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        html: htmlTemplate,
        attachDataUrls: true,
      });
      return {
        success: true,
        message: "Registration confirmation email sent successfully",
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "Registration confirmation email sent failed",
      };
    }
  },

  sendInvitationEmail: async (
    emailData: InvitationEmailDto,
    recipientEmail: string
  ): Promise<EmailResponse> => {
    const { success, data } = invitationEmailSchema.safeParse(emailData);

    if (!success) {
      throw new Error("Invalid invitation email data");
    }

    const htmlContent = generateInvitationEmailTemplate(data);

    try {
      await transporter.sendMail({
        to: recipientEmail,
        from: env.EMAIL_FROM,
        subject: `Invitación: ${emailData.eventName}`,
        html: htmlContent,
      });

      return {
        success: true,
        message: "Invitation email sent successfully",
      };
    } catch (error) {
      console.error('❌ Invitation email failed:', {
        error,
        recipientEmail,
        emailData,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return {
        success: false,
        message: `Invitation email failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };

    }
  },
});
