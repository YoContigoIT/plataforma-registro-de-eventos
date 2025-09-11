import { NoResults } from "~/shared/components/common/no-results";
import { deleteUserAction } from "../api/delete-user.action";
import { getUserByIdLoader } from "../api/get-user-by-id.loader";
import { UserDetails } from "../components/cards/user-details";
import type { Route } from "./+types/user-by-id";

export function meta() {
  return [
    { title: "Usuario - Gestor de eventos" },
    {
      name: "description",
      content: "Página de usuario de Gestor de Eventos",
    },
  ];
}

export const loader = getUserByIdLoader;
export const action = deleteUserAction;
export default function UserByIdPage({ loaderData }: Route.ComponentProps) {
  if (!loaderData) {
    return <NoResults message="Usuario no encontrado" />;
  }
  return (
    <div>
      <UserDetails user={loaderData} />
    </div>
  );
}
