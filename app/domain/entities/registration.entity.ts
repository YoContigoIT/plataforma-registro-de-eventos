import type { Prisma, Registration } from "@prisma/client";

export type RegistrationEntity = Registration;

export type RegistrationWithRelations = Prisma.RegistrationGetPayload<{
  include: {
    user: true;
    event: true;
  }
}>

export type RegistrationWithFullRelations = Prisma.RegistrationGetPayload<{
  include: {
    user: true;
    event: true;
    FormResponse: {
      include: {
        fieldResponses: {
          include: {
            field: true,
          }
        }
      }
    };
  }
}>
