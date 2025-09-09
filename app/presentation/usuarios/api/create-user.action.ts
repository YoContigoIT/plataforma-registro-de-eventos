import { createUserSchema, type CreateUserDTO } from "~/domain/dtos/user.dto";
import { simplifyZodErrors } from "~/shared/lib/utils";
import type { Route } from "../routes/+types/create-user";

export const createUserAction = async ({
  request,
  context: { repositories },
}: Route.ActionArgs) => {
  try {
    const formData = await request.formData();
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

    if (!result.success) {
      return {
        error: "Error de validación",
        errors: simplifyZodErrors<CreateUserDTO>(result.error),
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
