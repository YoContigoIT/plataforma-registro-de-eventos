export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL || "",
  
  // JWT & Authentication
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",
  SESSION_SECRET: process.env.SESSION_SECRET || "",
  INVITATION_SECRET: process.env.INVITATION_SECRET || "",
  
  // Application
  APP_URL: process.env.APP_URL || "http://localhost:3000",
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 3000,
  
  // Email Configuration
  EMAIL_HOST: process.env.EMAIL_HOST || "",
  EMAIL_USER: process.env.EMAIL_USER || "",
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD || "",
  EMAIL_PORT: Number(process.env.EMAIL_PORT) || 587,
  EMAIL_SECURE: process.env.EMAIL_SECURE === "true",
  EMAIL_FROM: process.env.EMAIL_FROM || "",
};
