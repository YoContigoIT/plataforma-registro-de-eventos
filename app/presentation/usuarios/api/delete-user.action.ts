import { redirect } from "react-router";
import type { Route } from "../routes/+types/delete-user";

export const deleteUserAction = async ({
  request,
  context: { repositories },
}: Route.ActionArgs) => {
  try {
    // Obtener datos del body
    const formData = await request.formData();
    const userId = formData.get("id") as string;

    if (!userId) {
      return { success: false, error: "ID de usuario no proporcionado." };
    }

    await repositories.userRepository.delete(userId);
    return redirect("/usuarios");
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error al eliminar el usuario." };
  }
};
