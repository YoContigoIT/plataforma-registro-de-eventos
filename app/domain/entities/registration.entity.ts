import type { Prisma, Registration } from "@prisma/client";

export type RegistrationEntity = Registration;

export type RegistrationWithRelations = Prisma.RegistrationGetPayload<{
  include: {
    user: true;
    event: true;
  }
}>
