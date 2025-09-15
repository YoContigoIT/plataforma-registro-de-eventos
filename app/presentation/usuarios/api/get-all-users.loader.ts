import { UserRole } from "@prisma/client";
import type { Route } from "../routes/+types/users";

export async function getAllUsersPagination({
  request,
  context: { repositories },
}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const limit = parseInt(url.searchParams.get("limit") || "10", 10);

  const users = await repositories.userRepository.findMany(
    { page, limit },
    {
      currentUserId: undefined,
      excludeRoles: [UserRole.ATTENDEE],
    }
  );

  return {
    users: users.data,
    pagination: users.pagination,
  };
}
