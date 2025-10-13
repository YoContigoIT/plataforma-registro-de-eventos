# nodemailer.ts — Servicio de envío de correos

## Resumen
Crea y exporta un `Transporter` de `nodemailer` configurado con variables de entorno. Compatible con Gmail y otros SMTP.

## Ubicación
`app/infrastructure/config/nodemailer.ts`

## Responsabilidades
- Configurar `host`, `port`, `secure` y `auth` desde `env`.
- Proveer un `Transporter` listo para ser usado por el servicio de email.

## API pública
- `transporter: Transporter`

## Uso típico
```ts
import { transporter } from "~/app/infrastructure/config/nodemailer";

await transporter.sendMail({
  to: "destinatario@dominio.com",
  from: env.EMAIL_FROM,
  subject: "Hola 👋",
  html: "<p>Contenido del correo</p>",
});
```

## Consideraciones y errores
- Para Gmail usa contraseñas de aplicación, no la contraseña normal.
- Requiere `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_USER`, `EMAIL_PASSWORD`.
- Verifica puerto/secure: `465` + `true` es típico en SMTP seguro.

## Mantenimiento
- Si cambias proveedor SMTP, actualiza `env` y valida TLS/puertos.
- Maneja errores de `sendMail` en el servicio que consume el transporter.