import { useParams } from "react-router";
import { NoResults } from "~/shared/components/common/no-results";
import { getUserByIdLoaderWithouRoute } from "../api/get-user-by-id.loader";
import { updateUserAction } from "../api/update-user.action";
import { UserForm } from "../components/forms/user-form";
import type { Route } from "./+types/update-user";

export function meta() {
  return [
    { title: "Editar Usuario - Gestor de eventos" },
    {
      name: "description",
      content: "Página de edición de usuario de Gestor de Eventos",
    },
  ];
}
export async function loader({ params, context }: Route.LoaderArgs) {
  const userId = params.userId;
  if (!userId) {
    return <NoResults message="No se encontró el usuario solicitado." />;
  }

  const user = await getUserByIdLoaderWithouRoute(
    params.userId,
    context.repositories
  );
  return { user };
}
export { updateUserAction as action };
export default function UpdateUserPage() {
  const { userId } = useParams<{ userId: string }>();

  return (
    <div className="w-full max-w-[95rem] mx-auto">
      <UserForm actionUrl={`/usuarios/editar/${userId}`} isEditing />
    </div>
  );
}
