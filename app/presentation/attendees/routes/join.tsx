import { AlertCircle, CalendarX } from "lucide-react";
import { useLoaderData } from "react-router";
import { Badge } from "~/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import type { LoaderData } from "~/shared/types";
/* import { createAttendeeAction } from "../api/create-attendee.action"; */
import {
  getInvitationDataLoader,
  type InvitationData,
} from "../api/get-invitation-data.loader";
import { RegistrationFormHandler } from "../components/forms/registration-form-handler";

export const loader = getInvitationDataLoader;
/* export { createAttendeeAction as action }; */

export default function JoinPage() {
  const { data, success } = useLoaderData<LoaderData<InvitationData>>();

  if (!success || !data?.event) {
    return (
      <div className="bg-background flex min-h-svh bg-gradient-to-t from-primary/20 to-secondary/20 dark:from-primary/30 dark:to-secondary/30">
        <div className="w-full flex flex-col items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md">
            <Card className="border-0 shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                  <CalendarX className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                  Evento finalizado
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-slate-600 dark:text-slate-400">
                    Este evento ya ha finalizado y no está disponible para
                    nuevos registros.
                  </p>
                  {/* <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-500">
                    <Clock className="h-4 w-4" />
                    <span>El período de inscripción ha terminado</span>
                  </div> */}
                </div>

                <div className="pt-2">
                  <Badge
                    variant="secondary"
                    className="bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800"
                  >
                    <AlertCircle className="h-3 w-3 mr-1" />
                    No disponible
                  </Badge>
                </div>

                <div className="pt-4 text-xs text-slate-400 dark:text-slate-600">
                  Si crees que esto es un error, contacta al organizador del
                  evento.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
