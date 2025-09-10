import type {
    EmailOptions,
    IEmailService,
} from "~/domain/services/email.service";
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
      console.log(`Email sent successfully to: ${options.to}`);
    } catch (error) {
      console.error("Error sending email:", error);
      throw new Error("Failed to send email");
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
    loginInfo: { ipAddress: string; userAgent: string; timestamp: Date },
  ): Promise<void> => {
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
  },

  sendEventInvitation: async (
    to: string,
    eventName: string,
    eventDate: string,
  ): Promise<void> => {
    const subject = `Invitación al evento: ${eventName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">¡Estás invitado!</h2>
        <p>Te invitamos al evento <strong>${eventName}</strong></p>
        <p><strong>Fecha:</strong> ${eventDate}</p>
        <p>No te pierdas esta oportunidad única.</p>
        <a href="#" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirmar Asistencia</a>
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
});
