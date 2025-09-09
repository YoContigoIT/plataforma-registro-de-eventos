import { createUserSchema } from "~/domain/dtos/user.dto";
import { formatZodErrors } from "~/shared/lib/zod-errors";
import type { Route } from "../routes/+types/create-user";

export const createUserAction = async ({
  request,
  context: { repositories },
}: Route.ActionArgs) => {
  try {
    const formData = await request.formData();
    console.log("formData: ", formData);
    const data = Object.fromEntries(formData);

    const result = createUserSchema.safeParse({
      email: data.email,
      name: data.name,
      company: data.company || undefined,
      title: data.title || undefined,
      phone: data.phone || undefined,
      role: data.role || undefined,
      password: data.password,
    });
    console.log("result: ", result);

    if (!result.success) {
      console.log("RETURNING ERRORS", formatZodErrors(result.error));

      return {
        error: "Error de validación",
        errors: formatZodErrors(result.error),
      };
    }

    // Crear usuario
    await repositories.userRepository.create(result.data);

    return {
      message: "Usuario creado exitosamente.",
      redirectTo: "/usuarios",
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Error al crear el usuario.",
      message: "Intenta de nuevo más tarde.",
    };
  }
};
