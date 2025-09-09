import { z } from "zod";

export interface FormErrors {
  [key: string]: string;
}

export function formatZodErrors(error: z.ZodError): FormErrors {
  const errors: FormErrors = {};

  for (const issue of error.issues) {
    const field = issue.path.join(".");
    if (!errors[field]) {
      errors[field] = issue.message;
    } else {
      errors[field] += `. ${issue.message}`;
    }
  }

  return errors;
}
