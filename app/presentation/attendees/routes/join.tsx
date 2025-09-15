import { createAttendeeAction } from "../api/create-attendee.action";
import { getEventByIdLoader } from "../api/get-event-by-id.loader";
import { RegistrationForm } from "../components/forms/registration-form";

export const loader = getEventByIdLoader;
export { createAttendeeAction as action };
export default function JoinPage() {
  return (
    <div className="bg-background flex min-h-svh bg-gradient-to-t from-primary/20 to-secondary/20 dark:from-primary/30 dark:to-secondary/30">
      <div className="w-full  flex flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-5xl">
          <RegistrationForm />
        </div>
      </div>
    </div>
  );
}
