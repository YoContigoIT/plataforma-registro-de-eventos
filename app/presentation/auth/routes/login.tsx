import { Bell, Calendar, CheckCircle, Users } from "lucide-react";
import { redirect } from "react-router";
import { getSession } from "~/infrastructure/auth/session.service";
import { loginAction } from "~/presentation/auth/api/actions";
import { LoginForm } from "~/presentation/auth/components/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import type { Route } from "./+types/login";

export function meta() {
  return [
    { title: "Inicio de sesión - Gestor de eventos" },
    {
      name: "description",
      content: "Página de inicio de sesión de Gestor de Finanzas",
    },
  ];
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = session.get("user");

  if (user) {
    return redirect("/panel");
  }
};

export { loginAction as action };

export default function LoginPage() {
  return (
    <div className="bg-background flex min-h-svh bg-gradient-to-t from-primary/20 to-secondary/20 dark:from-primary/30 dark:to-secondary/30">
      {/* Left side - Login form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>

      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center p-10">
          <img
            src="https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg"
            alt="Login illustration"
            className="w-full h-full object-cover absolute"
          />

          <Card className="w-full max-w-lg shadow-xl relative z-10">
            <CardHeader>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Gestión de eventos simplificada
              </CardTitle>
              <CardDescription className="text-foreground text-md">
                Tu solución todo en uno para planificación y gestión de eventos
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    Seguimiento de eventos sin esfuerzo
                  </h3>
                  <p className="text-foreground text-sm">
                    Crea, programa y gestiona todos tus eventos en un solo lugar
                    con nuestro panel intuitivo.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    Notificaciones inteligentes
                  </h3>
                  <p className="text-foreground text-sm">
                    Envía invitaciones y recordatorios automatizados para
                    mantener a tus asistentes informados y comprometidos.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    Gestión de asistentes
                  </h3>
                  <p className="text-foreground text-sm">
                    Registra y haz seguimiento de asistentes, gestiona la
                    capacidad y recopila datos valiosos de los participantes.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">
                    Experiencia perfecta
                  </h3>
                  <p className="text-foreground text-sm">
                    Proporciona una experiencia profesional desde el registro
                    hasta el check-in con nuestra plataforma todo en uno.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
