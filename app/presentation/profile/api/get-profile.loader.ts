import type { Route } from "../routes/+types/profile";

export const getProfileLoader = async ({
  request,
  context: { repositories, session },
}: Route.LoaderArgs) => {
  const userId = session.get("user")?.id;
  const userRole = session.get("user")?.role;

  if (!userId) {
    return {
      success: false,
      error: "No se ha iniciado sesión",
    };
  }

  const user = await repositories.userRepository.findUnique(userId);

  if (!user) {
    return {
      success: false,
      error: "No se ha encontrado el usuario",
    };
  }

  return {
    user,
  };
};
