import { createFormResponseSchema } from "~/domain/dtos/form-response.dto";
import { simplifyZodErrors } from "~/shared/lib/utils";
import type { Route } from "../../routes/+types/join";

export const createFormResponseAction = async ({
  request,
  context: { repositories },
}: Route.ActionArgs) => {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    
    const registrationId = data.registrationId as string;
    if (!registrationId) {
      return {
        success: false,
        error: "ID de registro requerido.",
      };
    }

    // Check if registration exists
    const registration = await repositories.registrationRepository.findOne(registrationId);
    if (!registration) {
      return {
        success: false,
        error: "Invitación no encontrada.",
      };
    }

    // Check if form response already exists for this registration
    const existingResponse = await repositories.formResponseRepository.findByRegistrationId(registrationId);
    if (existingResponse) {
      return {
        success: false,
        error: "Ya existe una respuesta para este registro.",
      };
    }

    // Extract field responses from form data
    const fieldResponses = [];
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith('field_')) {
        const fieldId = key.replace('field_', '');
        fieldResponses.push({
          fieldId,
          value: value as any, // The DTO allows any type for value
        });
      }
    }

    const result = createFormResponseSchema.safeParse({
      registrationId,
      fieldResponses,
    });

    if (!result.success) {
      return {
        success: false,
        error: "Error de validación",
        errors: simplifyZodErrors(result.error),
      };
    }

    const formResponse = await repositories.formResponseRepository.create(result.data);

    return {
      success: true,
      message: "Formulario enviado exitosamente.",
      data: {
        responseId: formResponse.id,
        submittedAt: formResponse.submittedAt,
      },
    };

  } catch (error) {
    console.error("Error creating form response:", error);
    return {
      success: false,
      error: "Error al enviar el formulario.",
      message: "Intenta de nuevo más tarde.",
    };
  }
};