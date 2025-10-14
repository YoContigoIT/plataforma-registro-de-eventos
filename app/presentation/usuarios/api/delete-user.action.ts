import { UserRole } from "@prisma/client";
import { redirect } from "react-router";
import type { Route } from "../routes/+types/delete";

export const deleteUserAction = async ({
  params,
  context: { repositories, session },
}: Route.ActionArgs) => {
  try {
    const userId = session.get("user")?.id;
    const userRole = session.get("user")?.role;
    const userIdDelete = params.userId as string;
    if (!userId) {
      return {
        success: false,
        error: "No se ha iniciado sesión",
      };
    }

    if (!userRole || userRole !== UserRole.ADMIN) {
      return {
        success: false,
        error: "No tienes permisos para archivar eventos",
      };
    }

    await repositories.userRepository.delete(userIdDelete);
    return redirect("/usuarios");
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al eliminar el usuario." };
  }
};
