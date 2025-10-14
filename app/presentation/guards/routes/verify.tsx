import { UserRole } from "@prisma/client";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { useLoaderData } from "react-router";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { registrationByTokenLoader } from "../api/loaders/registration.loader";
import InviteDetailsPage from "../components/event-invite-details";
import { VerifyRegistration } from "../components/verify-registration";

export const loader = registrationByTokenLoader;

export default function Verify() {
  const loaderData = useLoaderData<typeof loader>();

  if (!loaderData.success) {
    return (
      <div className="bg-background flex min-h-svh bg-gradient-to-t from-primary/20 to-secondary/20 dark:from-primary/30 dark:to-secondary/30">
        <div className="w-full flex flex-col items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-destructive">
                  Error al cargar los datos
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {loaderData.error ||
                    "No se pudieron cargar los datos de verificación."}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Intentar de nuevo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const { data } = loaderData;

  if ((!data?.userId || data?.userRole !== UserRole.GUARD) && data?.event) {
    return <InviteDetailsPage event={data?.event} />;
  }

  if (!data?.invite || !data?.event || !data?.user) {
    return (
      <div className="bg-background flex min-h-svh bg-gradient-to-t from-primary/20 to-secondary/20 dark:from-primary/30 dark:to-secondary/30">
        <div className="w-full flex flex-col items-center justify-center p-6 md:p-10">
          <div className="w-full max-w-md">
            <Card className="border-destructive/20 bg-destructive/5">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <CardTitle className="text-destructive">
                  Error al cargar los datos
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  No se pudieron cargar los datos de verificación.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button
                  onClick={() => window.location.reload()}
                  variant="outline"
                  className="w-full"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Intentar de nuevo
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-svh bg-gradient-to-t from-primary/20 to-secondary/20 dark:from-primary/30 dark:to-secondary/30">
      <div className="w-full  flex flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-5xl">
          <VerifyRegistration
            invite={data?.invite}
            event={data?.event}
            user={data?.user}
            qrCodeUrl={data?.qrCodeUrl}
          />
        </div>
      </div>
    </div>
  );
}
