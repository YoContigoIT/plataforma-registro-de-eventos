import { createTransport, type Transporter } from "nodemailer";
import { env } from "./env";

/**
 * Para usar Gmail, la configuración en tus variables de entorno (.env) debería ser:
 *
 * EMAIL_HOST=smtp.gmail.com
 * EMAIL_PORT=465
 * EMAIL_SECURE=true
 * EMAIL_USER=tu_correo@gmail.com
 * EMAIL_PASSWORD=tu_contraseña_de_aplicacion
 *
 * IMPORTANTE: Para Gmail, no uses tu contraseña normal. Debes generar una
 * "Contraseña de Aplicación" desde la configuración de seguridad de tu cuenta de Google
 * y usarla como EMAIL_PASSWORD.
 */
export const transporter: Transporter = createTransport({
  host: env.EMAIL_HOST,
  port: env.EMAIL_PORT,
  secure: env.EMAIL_SECURE,
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASSWORD,
  },
});
