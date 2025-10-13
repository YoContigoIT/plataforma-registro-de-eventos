import { bulkUpdateFieldResponsesSchema } from "~/domain/dtos/form-response.dto";
import type {
  FormResponseAnswers,
  FormResponseEntity,
} from "~/domain/entities/form-response.entity";
import { handleServiceError } from "~/shared/lib/error-handler";
import { simplifyZodErrors } from "~/shared/lib/utils";
import type { Route } from "../../routes/+types/join";

export const updateFormResponseAction = async ({
  request,
  context: { repositories },
}: Route.ActionArgs) => {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    let responseId = data.formResponseId as string;
    let existingResponse: FormResponseAnswers | FormResponseEntity | null =
      null;

    if (responseId) {
      existingResponse =
        await repositories.formResponseRepository.findById(responseId);
      if (!existingResponse) {
        return {
          success: false,
          error: "Respuesta no encontrada.",
        };
      }
    } else {
      const registrationId = data.registrationId as string;
      if (!registrationId) {
        return {
          success: false,
          error: "ID de registro o respuesta requerido.",
        };
      }

      existingResponse =
        await repositories.formResponseRepository.findByRegistrationId(
          registrationId,
        );
      if (!existingResponse) {
        return {
          success: false,
          error: "No existe una respuesta para este registro.",
        };
      }
      responseId = existingResponse.id;
    }

    const fieldUpdates = [];
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith("field_")) {
        const fieldId = key.replace("field_", "");
        fieldUpdates.push({
          fieldId,
          value: value as any, //the DTO allows any type for value
        });
      }
    }

    const result = bulkUpdateFieldResponsesSchema.safeParse({
      responseId: existingResponse.id,
      fieldUpdates,
    });

    if (!result.success) {
      return {
        success: false,
        error: "Error de validación",
        errors: simplifyZodErrors(result.error),
      };
    }

    const updatedFormResponse =
      await repositories.formResponseRepository.bulkUpdateFieldResponses(
        result.data,
      );

    return {
      success: true,
      message: "Formulario actualizado exitosamente.",
      data: {
        responseId: updatedFormResponse.id,
        submittedAt: updatedFormResponse.submittedAt,
      },
    };
  } catch (error) {
    return handleServiceError(error, "Error al actualizar el formulario.");
  }
};
