# Email Service — Documentación

Servicio centralizado para el envío de correos de la aplicación. Implementa la interfaz `IEmailService` y usa el `transporter` de Nodemailer junto con plantillas HTML.

**Dependencias**
- `transporter` (`../config/nodemailer`): cliente de envío de correos.
- `env.EMAIL_FROM` (`../config/env`): remitente por defecto.
- Plantillas:
  - `generateRegistrationConfirmationTemplate` (`~/presentation/templates/registration-confirmation.template`)
  - `generateInvitationEmailTemplate` (`~/presentation/templates/invitation-email.template`)
  - `generateCanceledEventEmailTemplate` (`~/presentation/templates/cancel-event-email.template`)
- Tipos y validaciones:
  - `EmailOptions`, `EmailResponse`, `IEmailService` (`~/domain/services/email.service`)
  - `InvitationEmailDto`, `invitationEmailSchema` (`~/domain/dtos/email-invitation.dto`)
  - `RegistrationConfirmationEmailDto` (`~/domain/dtos/email-invitation.dto`)

**API Pública**
- `sendEmail(options: EmailOptions): Promise<void>`
  - Recibe: `options` con `from?`, `to` (`string|string[]`), `subject`, `text?`, `html?`.
  - Hace: envía un correo directo usando Nodemailer; usa `env.EMAIL_FROM` si `from` no se provee; normaliza `to` cuando es arreglo.
  - Retorna: `void`. Lanza `Error` si falla el envío.

- `sendWelcomeEmail(to: string, userName: string): Promise<void>`
  - Recibe: correo destino y nombre del usuario.
  - Hace: construye y envía una plantilla HTML básica de bienvenida.
  - Retorna: `void`. Propaga errores de `sendMail` si ocurren.

- `sendLoginNotification(to: string, userName: string, loginInfo: { ipAddress: string; userAgent: string; timestamp: Date }): Promise<EmailResponse>`
  - Recibe: correo destino, nombre de usuario y datos de inicio de sesión (IP, agente, fecha).
  - Hace: genera HTML con fecha formateada (`es-ES`, zona `America/Mexico_City`), IP y navegador; envía notificación de seguridad.
  - Retorna: `EmailResponse` con `success: true` y mensaje en éxito; en error retorna `{ success: false, message }` (no lanza excepción).

- `sendPasswordReset(to: string, resetCode: string): Promise<void>`
  - Recibe: correo destino y código de restablecimiento.
  - Hace: envía correo con HTML que resalta el código y su expiración.
  - Retorna: `void`. Propaga errores de `sendMail` si ocurren.

- `sendRegistrationConfirmation(to: string, registrationData: RegistrationConfirmationEmailDto): Promise<EmailResponse>`
  - Recibe: correo destino y datos de confirmación del registro (incluye nombre del evento y datos del registro).
  - Hace: genera plantilla HTML de confirmación; envía correo con `attachDataUrls: true` (útil para imágenes embebidas como QR).
  - Retorna: `EmailResponse` (`success: true` o `false`); en error captura y retorna `success: false` (no lanza excepción).

- `sendInvitationEmail(emailData: InvitationEmailDto, recipientEmail: string): Promise<EmailResponse>`
  - Recibe: DTO de invitación (validado con `invitationEmailSchema`) y correo del destinatario.
  - Hace: valida datos; genera plantilla de invitación; envía correo con asunto `Invitación: {eventName}`.
  - Retorna: `EmailResponse` con `success: true` en éxito. En caso de datos inválidos o error de envío, lanza `Error`.

- `sendCancelInvitationEmail(emailData: InvitationEmailDto, recipientEmail: string): Promise<EmailResponse>`
  - Recibe: DTO de invitación y correo del destinatario.
  - Hace: valida datos; genera plantilla de cancelación de evento; envía correo con asunto `Cancelación de evento: {eventName}`.
  - Retorna: `EmailResponse` con `success: true` en éxito. En validación inválida o error de envío, lanza `Error`.

**Notas**
- Remitente por defecto: cuando no se especifica `from`, se usa `env.EMAIL_FROM`.
- Destinatarios múltiples: `sendEmail` acepta `to` como `string[]` y los une con comas.
- Manejo de errores inconsistente:
  - Algunos métodos retornan `EmailResponse` con `success: false` en error (`sendLoginNotification`, `sendRegistrationConfirmation`).
  - Otros lanzan `Error` (`sendEmail`, `sendInvitationEmail`, `sendCancelInvitationEmail`, `sendPasswordReset`).
  - Recomendación: estandarizar el contrato para facilitar manejo en capas superiores.
- Validaciones: `sendInvitationEmail` y `sendCancelInvitationEmail` validan `InvitationEmailDto` con Zod; si falla, se lanza `Error`.
- Localización: `sendLoginNotification` formatea fechas en español (`es-ES`) y zona horaria `America/Mexico_City`.

**Consideraciones de uso**
- En servicios o casos de uso, envolver llamadas en `try/catch` cuando los métodos puedan lanzar `Error` o retornar `success: false`.