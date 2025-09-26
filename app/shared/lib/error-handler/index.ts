import { clientPrismaErrors } from "@/prisma/errors";
import { Prisma } from "@prisma/client";

export async function handleServiceError(error: unknown, message?: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (process.env.NODE_ENV === "development") {
      console.error("Prisma error:", error);
    }

    return {
      success: false,
      message: clientPrismaErrors[error.code] || clientPrismaErrors.DEFAULT,
      error: error.code,
    };
  }

  if (error instanceof Error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Error:", error);
    }

    return {
      success: false,
      message: message || error.message || clientPrismaErrors.DEFAULT,
      error: error.name,
    };
  }

  return {
    success: false,
    message: message || clientPrismaErrors.DEFAULT,
    error: "UnknownError",
  };
}
