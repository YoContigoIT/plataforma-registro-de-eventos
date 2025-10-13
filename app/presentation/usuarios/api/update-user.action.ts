import { type UpdateUserDTO, updateUserSchema } from "~/domain/dtos/user.dto";
import { handleServiceError } from "~/shared/lib/error-handler";
import { simplifyZodErrors } from "~/shared/lib/utils";
import type { Route } from "../routes/+types/update-user";

export const updateUserAction = async ({
  request,
  params,
  context: { repositories },
}: Route.ActionArgs) => {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const result = updateUserSchema.safeParse({
      email: data.email,
      name: data.name,
      company: data.company || undefined,
      title: data.title || undefined,
      phone: data.phone || undefined,
      role: data.role || undefined,
      password: data.password || undefined,
    });

    if (!result.success) {
      return {
        error: "Error de validación",
        errors: simplifyZodErrors<UpdateUserDTO>(result.error),
      };
    }

    const userId = params.userId as string;
    if (!userId) {
      return {
        error: "ID de usuario faltante",
        message: "No se proporcionó el ID del usuario.",
      };
    }

    const currentUser = await repositories.userRepository.findUnique(userId);
    if (!currentUser) {
      return {
        error: "Usuario no encontrado.",
        message: "El usuario especificado no existe.",
      };
    }

    if (result.data.password) {
      result.data.password =
        await repositories.encryptorRepository.hashPassword(
          result.data.password,
        );
    }

    if (result.data.email && result.data.email !== currentUser.email) {
      const existingUser = await repositories.userRepository.findByEmail(
        result.data.email,
      );
      if (existingUser && existingUser.id !== userId) {
        return {
          error: "El correo electrónico ya está en uso.",
          errors: { email: "El correo electrónico ya está en uso." },
        };
      }
    }

    await repositories.userRepository.update(userId, result.data);

    return {
      message: "Usuario actualizado exitosamente.",
      redirectTo: "/usuarios",
    };
  } catch (error) {
    handleServiceError(error, "Error al actualizar el usuario.");
  }
};
