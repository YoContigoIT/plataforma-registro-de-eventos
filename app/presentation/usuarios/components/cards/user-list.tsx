import type { User } from "@prisma/client";
import { NoResults } from "~/shared/components/common/no-results";
import { UserCardInfo } from "./user-card-info";

interface UserListProps {
  users: User[];
}
export function UserList({ users }: UserListProps) {
  return (
    <div className="w-full">
      <div className="rounded-md">
        {users.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 md:mb-6 px-2 sm:px-0">
            {users.map((user) => (
              <UserCardInfo key={user.id} user={user} />
            ))}
          </div>
        ) : (
          <NoResults message="No se encontraron usuarios" />
        )}
      </div>
    </div>
  );
}
