import { CheckCircle } from "lucide-react";
import { Card, CardContent } from "~/shared/components/ui/card";

export function RegistrationConfirm() {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="rounded-full bg-green-100 p-4 mb-4">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            ¡Registro Completado!
          </h3>
          <p className="text-gray-600 mb-4">
            Te hemos enviado un correo de confirmación con los detalles del
            evento.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
