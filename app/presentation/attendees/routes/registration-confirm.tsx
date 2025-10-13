import { Calendar, CheckCircle, Mail } from "lucide-react";
import { Card, CardContent } from "~/shared/components/ui/card";

export default function RegistrationConfirm() {
  return (
    <Card className="w-full max-w-2xl shadow-xl mx-auto border-0 bg-card">
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="relative mb-6">
            <div className="rounded-full bg-primary/10 p-5 animate-pulse">
              <CheckCircle className="h-16 w-16 text-primary" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping opacity-20"></div>
          </div>

          <h3 className="text-2xl font-bold text-foreground mb-4">
            ¡Registro completado con éxito!
          </h3>

          <p className="text-muted-foreground mb-6 text-lg">
            Te hemos enviado un correo de confirmación con todos los detalles
            del evento.
          </p>

          <div className="bg-primary/10 p-4 rounded-lg mb-6 w-full max-w-md">
            <div className="flex items-center justify-center mb-2">
              <Mail className="h-5 w-5 text-primary mr-2" />
              <span className="text-primary font-medium">
                Revisa tu bandeja de entrada
              </span>
            </div>
            <p className="text-primary/80 text-sm">
              Si no encuentras el correo, revisa la carpeta de spam o
              promociones
            </p>
          </div>

          <div className="bg-muted p-5 rounded-xl mb-6 w-full max-w-md">
            <h4 className="font-semibold text-foreground mb-3 flex items-center justify-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Próximos pasos
            </h4>
            <ul className="text-left text-muted-foreground space-y-2 text-sm">
              <li className="flex items-start">
                <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                  1
                </span>
                <span>Guarda el correo de confirmación</span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                  2
                </span>
                <span>Agrega el evento a tu calendario</span>
              </li>
              <li className="flex items-start">
                <span className="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                  3
                </span>
                <span>Llega 15 minutos antes el día del evento</span>
              </li>
            </ul>
          </div>

          <p className="text-muted-foreground text-sm mt-6">
            ¿Necesitas ayuda?{" "}
            <a
              href="mailto:soporte@eventos.com"
              className="text-primary hover:underline font-medium"
            >
              Contáctanos
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
