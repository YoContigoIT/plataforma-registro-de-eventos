import type { User } from "@prisma/client";
import type { Route } from "../routes/+types/user-by-id";

export async function getUserByIdLoaderWithouRoute(
  userId: string | undefined,
  repositories: {
    userRepository: {
      findUnique: (id: string) => Promise<Omit<User, "password"> | null>;
    };
  }
): Promise<Omit<User, "password"> | null> {
  if (!userId) return null;

  const user = await repositories.userRepository.findUnique(userId);
  return user;
}

export async function getUserByIdLoader({
  params,
  context: { repositories },
}: Route.LoaderArgs) {
  const userId = params.userId;
  if (!userId) {
    return null;
  }

  const user = await repositories.userRepository.findUnique(userId);
  return user;
}
