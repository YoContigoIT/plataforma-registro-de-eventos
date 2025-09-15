import { Calendar, CheckCircle, Mail } from "lucide-react";
import { Card, CardContent } from "~/shared/components/ui/card";

export function RegistrationConfirm() {
  return (
    <Card className="w-full max-w-2xl shadow-xl mx-auto border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="relative mb-6">
            <div className="rounded-full bg-green-100 p-5 animate-pulse">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-green-200 animate-ping opacity-20"></div>
          </div>

          <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            ¡Registro Completado con Éxito!
          </h3>

          <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
            Te hemos enviado un correo de confirmación con todos los detalles
            del evento.
          </p>

          <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-lg mb-6 w-full max-w-md">
            <div className="flex items-center justify-center mb-2">
              <Mail className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-blue-800 dark:text-blue-200 font-medium">
                Revisa tu bandeja de entrada
              </span>
            </div>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Si no encuentras el correo, revisa la carpeta de spam o
              promociones
            </p>
          </div>

          {/* Pasos siguientes */}
          <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl mb-6 w-full max-w-md">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-3 flex items-center justify-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Próximos pasos
            </h4>
            <ul className="text-left text-gray-600 dark:text-gray-300 space-y-2 text-sm">
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                  1
                </span>
                <span>Guarda el correo de confirmación</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                  2
                </span>
                <span>Agrega el evento a tu calendario</span>
              </li>
              <li className="flex items-start">
                <span className="bg-green-100 text-green-800 rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold mr-2 mt-0.5">
                  3
                </span>
                <span>Llega 15 minutos antes el día del evento</span>
              </li>
            </ul>
          </div>

          {/* Texto pequeño de ayuda */}
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-6">
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
