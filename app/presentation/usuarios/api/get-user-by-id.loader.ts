import type { User } from "@prisma/client";
import type { Route } from "../routes/+types/user-by-id";

export async function getUserByIdLoader({
  params,
  context: { repositories },
}: Route.LoaderArgs): Promise<Omit<User, "password"> | null> {
  const { userId } = params;

  if (!userId) {
    return null;
  }

  const user = await repositories.userRepository.findUnique(userId);

  return user;
}
