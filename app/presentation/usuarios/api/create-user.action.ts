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
    if (result.data.password) {
      result.data.password =
        await repositories.encryptorRepository.hashPassword(
          result.data.password
        );
    }

    // Validar si el usuario ya existe
    const existingUser = await repositories.userRepository.findByEmail(
      result.data.email
    );
    if (existingUser) {
      return {
        error: "El correo electrónico ya está en uso.",
        errors: { email: "El correo electrónico ya está en uso." },
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
