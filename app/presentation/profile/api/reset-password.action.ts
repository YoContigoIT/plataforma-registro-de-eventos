import {
  changePasswordSchema,
  type ChangePasswordDTO,
} from "~/domain/dtos/user.dto";
import { handleServiceError } from "~/shared/lib/error-handler";
import { simplifyZodErrors } from "~/shared/lib/utils";
import type { ActionData } from "~/shared/types";
import type { Route } from "../routes/+types/reset-password";

export const resetPasswordAction = async ({
  request,
  context: { repositories, session },
}: Route.ActionArgs): Promise<ActionData> => {
  try {
    const userId = session.get("user")?.id;
    if (!userId) {
      return {
        success: false,
        error: "No se ha iniciado sesión",
      };
    }

    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const result = changePasswordSchema.safeParse({
      ...data,
    });


    if (!result.success) {
      return {
        error: "Error de validación",
        errors: simplifyZodErrors<ChangePasswordDTO>(result.error),
      };
    }

    const currentUser = await repositories.userRepository.findUnique(userId);
    if (!currentUser) {
      return {
        error: "Usuario no encontrado.",
        message: "El usuario especificado no existe.",
      };
    }

    if (currentUser.password !== result.data.currentPassword) {
      return {
        success: false,
        error: "Contraseña actual incorrecta.",
      };
    }
    if (result.data.newPassword) {
      result.data.newPassword =
        await repositories.encryptorRepository.hashPassword(
          result.data.newPassword
        );
    }

    await repositories.userRepository.update(userId, {
      password: result.data.newPassword,
    });
    return {
      success: true,
      message: "Contraseña actualizada correctamente.",
      redirectTo: `/perfil`,
    };
  } catch (error) {
    return handleServiceError(error, "Error al actualizar la contraseña.");
  }
};
