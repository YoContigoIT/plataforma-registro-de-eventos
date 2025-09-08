import { getAllUsersPagination } from "../api/get-all-users.loader";
import UserCardHeader from "../components/cards/user-card-header";
import { UserList } from "../components/cards/user-list";
import type { Route } from "./+types/users";

export function meta() {
  return [
    { title: "Lista de usuarios - Gestor de eventos" },
    {
      name: "description",
      content: "Página de lista de usuarios de Gestor de Finanzas",
    },
  ];
}

export const loader = getAllUsersPagination;
export default function UsersPage({ loaderData }: Route.ComponentProps) {
  console.log("loaderData: ", loaderData);
  return (
    <div className="w-full max-w-[95rem] mx-auto">
      <UserCardHeader />
      <div className="mt-4 sm:mt-6">
        <UserList users={loaderData.data} />
      </div>
    </div>
  );
}
