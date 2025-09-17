import { clientPrismaErrors } from "@/prisma/errors";
import { Prisma } from "@prisma/client";
import type { ActionData } from "../../types";

export async function handleServiceError(error: unknown): Promise<ActionData> {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return {
      success: false,
      message: clientPrismaErrors[error.code] || clientPrismaErrors.DEFAULT,
      error: error.code,
    };
  }

  if (error instanceof Error) {
    return {
      success: false,
      message: error.message || clientPrismaErrors.DEFAULT,
      error: error.name,
    };
  }

  return {
    success: false,
    message: clientPrismaErrors.DEFAULT,
    error: "UnknownError",
  };
}
