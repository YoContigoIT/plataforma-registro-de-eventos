import { z } from "zod";

// Individual field response schema
export const createFormFieldResponseSchema = z.object({
  fieldId: z.uuid("ID de campo inválido"),
  value: z.any(), // Flexible JSON value - can be string, number, array, etc.
});

// Create form response with all field responses
export const createFormResponseSchema = z.object({
  registrationId: z.uuid("ID de registro inválido"),
  fieldResponses: z
    .array(createFormFieldResponseSchema)
    .min(1, "Debe incluir al menos una respuesta"),
});

// Update individual field response
export const updateFormFieldResponseSchema = z.object({
  id: z.uuid("ID inválido"),
  value: z.any(), // Allow updating the value
});

// Update form response (mainly for bulk field updates)
export const updateFormResponseSchema = z.object({
  id: z.uuid("ID inválido"),
  fieldResponses: z.array(updateFormFieldResponseSchema).optional(),
});

// Bulk field response update (for editing existing responses)
export const bulkUpdateFieldResponsesSchema = z.object({
  responseId: z.uuid("ID de respuesta inválido"),
  fieldUpdates: z.array(
    z.object({
      fieldId: z.uuid("ID de campo inválido"),
      value: z.any(),
    })
  ).min(1, "Debe incluir al menos una actualización"),
});

// Inferred types
export type CreateFormFieldResponseDTO = z.infer<typeof createFormFieldResponseSchema>;
export type CreateFormResponseDTO = z.infer<typeof createFormResponseSchema>;
export type UpdateFormFieldResponseDTO = z.infer<typeof updateFormFieldResponseSchema>;
export type UpdateFormResponseDTO = z.infer<typeof updateFormResponseSchema>;
export type BulkUpdateFieldResponsesDTO = z.infer<typeof bulkUpdateFieldResponsesSchema>;