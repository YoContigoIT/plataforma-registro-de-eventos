import type {
  FormField,
  FormFieldResponse,
  FormResponse,
  Prisma,
} from "@prisma/client";

export type FormFieldResponseEntity = FormFieldResponse;
export type FormResponseEntity = FormResponse;
export type FormResponseAnswers = Prisma.FormResponseGetPayload<{
  include: {
    fieldResponses: {
        select: {
          fieldId: true,
          value: true,
          id: true,
        }
    }
  };
}>;
export type FormResponseEntityWithFields = Prisma.FormResponseGetPayload<{
  include: {
    fieldResponses: {
        include: {
            field: true,
        }
    }
  };
}>;
export type FormFieldEntity = FormField;
