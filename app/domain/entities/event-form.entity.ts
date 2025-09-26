import type { EventForm, FormField, Prisma } from "@prisma/client";

export type EventFormEntity = EventForm;

export type EventFormWithFields = Prisma.EventFormGetPayload<{
  include: {
    fields: {
      orderBy: {
        order: "asc";
      };
    };
  };
}>;

export type FormFieldEntity = FormField;
