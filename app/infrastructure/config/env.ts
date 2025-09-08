export const env = {
  EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
  EMAIL_USER: process.env.EMAIL_USER || "correo@ejemplo.com",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "contrasenia",
  EMAIL_PORT: Number(process.env.EMAIL_PORT),
  EMAIL_SECURE: process.env.EMAIL_SECURE === "true",
  EMAIL_FROM: process.env.EMAIL_FROM || "correo@ejemplo.com",
};
