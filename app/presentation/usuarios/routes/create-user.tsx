import { createUserAction } from "../api/create-user.action";
import { UserForm } from "../components/forms/user-form";

export function meta() {
  return [
    { title: "Crear Usuario - Gestor de eventos" },
    {
      name: "description",
      content: "Página de creación de usuario de Gestor de Eventos",
    },
  ];
}
export { createUserAction as action };

export default function CreateUserPage() {
  return (
    <div className="w-full max-w-[95rem] mx-auto">
      <UserForm actionUrl="/usuarios/crear" />
    </div>
  );
}
