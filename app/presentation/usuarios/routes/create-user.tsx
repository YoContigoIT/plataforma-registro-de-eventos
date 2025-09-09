import { createUserAction } from "../api/create-user.action";
import { UserForm } from "../components/forms/user-form";

export { createUserAction as action };
export default function CreateUserPage() {
  return (
    <div className="w-full max-w-[95rem] mx-auto">
      <UserForm actionUrl="/usuarios/crear" />
    </div>
  );
}
