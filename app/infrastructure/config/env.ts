export const env = {
  EMAIL_HOST: process.env.EMAIL_HOST || "",
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  EMAIL_PORT: Number(process.env.EMAIL_PORT) || 587,
  EMAIL_SECURE: process.env.EMAIL_SECURE === "true",
  EMAIL_FROM: process.env.EMAIL_FROM || "",
};
