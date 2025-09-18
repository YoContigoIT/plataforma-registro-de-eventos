import { createGuestAction } from "../api/actions";
import { getEventsLoader } from "../api/loaders";
import { RegisterGuestForm } from "../components/register-guest-form";

export const loader = getEventsLoader;
export { createGuestAction as action };
export default function RegisterGuest() {
  return (
    <div>
      <RegisterGuestForm />
    </div>
  );
}
