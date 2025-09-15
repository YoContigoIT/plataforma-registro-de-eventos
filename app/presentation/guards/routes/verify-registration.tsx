import { registrationByTokenLoader } from "../api/loaders";
import { RegistrationInfo } from "../components/registration-info";
export const loader = registrationByTokenLoader;
export default function VerifyRegistration() {
  return (
    <div className="bg-background flex min-h-svh bg-gradient-to-t from-primary/20 to-secondary/20 dark:from-primary/30 dark:to-secondary/30">
      <div className="w-full  flex flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-5xl">
          <RegistrationInfo />
        </div>
      </div>
    </div>
  );
}
