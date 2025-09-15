import type { PrismaClient } from "@prisma/client";
import type { IRegistrationRepository } from "~/domain/repositories/registration.repository";

export const PrismaRegistrationRepository = (
  prisma: PrismaClient
): IRegistrationRepository => {
  return {
    create: async (data) => {
      return await prisma.registration.create({
        data,
      });
    },
    countRegistrations: async ({
      userId,
      eventId,
    }: {
      userId?: string;
      eventId?: string;
    }) => {
      return await prisma.registration.count({
        where: {
          ...(userId && { userId }),
          ...(eventId && { eventId }),
        },
      });
    },
  };
};
