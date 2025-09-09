import { updateUserSchema } from "~/domain/dtos/user.dto";
import { formatZodErrors } from "~/shared/lib/zod-errors";
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
      console.log("RETURNING ERRORS", formatZodErrors(result.error));

      return {
        error: "Error de validación",
        errors: formatZodErrors(result.error),
      };
    }

    const userId = params.userId as string;
    if (!userId) {
      return {
        error: "ID de usuario faltante",
        message: "No se proporcionó el ID del usuario.",
      };
    }

    await repositories.userRepository.update(userId, result.data);

    return {
      message: "Usuario actualizado exitosamente.",
      redirectTo: "/usuarios",
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Error al actualizar el usuario.",
      message: "Intenta de nuevo más tarde.",
    };
  }
};
