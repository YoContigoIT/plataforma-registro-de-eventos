import { NoResults } from "~/shared/components/common/no-results";
import { getUserByIdLoader } from "../api/get-user-by-id.loader";
import { UserDetails } from "../components/cards/user-details";
import type { Route } from "./+types/user-by-id";

export function meta() {
  return [
    { title: "Usuario - Gestor de eventos" },
    {
      name: "description",
      content: "Página de usuario de Gestor de Finanzas",
    },
  ];
}

export const loader = getUserByIdLoader;
export default function UserByIdPage({ loaderData }: Route.ComponentProps) {
  if (!loaderData) {
    return <NoResults message="Usuario no encontrado" />;
  }
  return (
    <div className="w-full max-w-[95rem] mx-auto">
      <UserDetails user={loaderData} />
    </div>
  );
}
