import { createAttendeeAction } from "../api/create-attendee.action";
import { getInvitationDataLoader } from "../api/get-invitation-data.loader";
import { RegistrationFormHandler } from "../components/forms/registration-form-handler";

export const loader = getInvitationDataLoader;
export { createAttendeeAction as action };
export default function JoinPage() {
  return (
    <div className="bg-background flex min-h-svh bg-gradient-to-t from-primary/20 to-secondary/20 dark:from-primary/30 dark:to-secondary/30">
      <div className="w-full flex flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full">
          <RegistrationFormHandler />
        </div>
      </div>
    </div>
  );
}
