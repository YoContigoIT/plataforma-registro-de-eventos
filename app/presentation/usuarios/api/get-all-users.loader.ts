import { UserRole, type User } from "@prisma/client";
import type { PaginatedResponse } from "~/shared/types";
import type { Route } from "../routes/+types/users";

export async function getAllUsersPagination({
  request,
  context: { repositories },
}: Route.LoaderArgs): Promise<PaginatedResponse<User>> {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page")) || 1;
  const limit = Number(url.searchParams.get("limit")) || 10;

  const users = await repositories.userRepository.findMany(
    { page, limit },
    {
      currentUserId: undefined,
      excludeRoles: [UserRole.ATTENDEE],
    }
  );

  return users;
}
