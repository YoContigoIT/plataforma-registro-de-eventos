import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Mail,
  Phone,
  UserCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Form } from "react-router";
import { FormField } from "~/shared/components/common/form-field";
import { TextInput } from "~/shared/components/common/text-input";
import { useRegistrationForm } from "../../hooks/useRegistrationForm";
import { RegistrationConfirm } from "./registration-confirm";

export function RegistrationForm() {
  const {
    isSubmitting,
    errors,
    handleInputChange,
    isLoading,
    loaderData,
    showSuccess,
  } = useRegistrationForm();

  const [progress, setProgress] = useState(0);
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    email: false,
    phone: false,
  });
  const [formData, setFormData] = useState({
    name: false,
    email: false,
    phone: false,
  });

  // Efecto para simular progreso de carga
  useEffect(() => {
    if (isSubmitting) {
      const timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(timer);
    } else {
      setProgress(0);
    }
  }, [isSubmitting]);

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  // Calcular progreso de completado del formulario
  const completionPercentage = () => {
    let completed = 0;
    const totalFields = 3;

    if (touchedFields.name && !errors.name && formData.name) completed++;
    if (touchedFields.email && !errors.email && formData.email) completed++;
    if (touchedFields.phone && !errors.phone && formData.phone) completed++;

    return (completed / totalFields) * 100;
  };

  if (showSuccess) {
    return <RegistrationConfirm />;
  }

  return (
    <Card className="w-full max-w-md shadow-lg relative overflow-hidden">
      {/* Barra de progreso durante envío */}
      {isSubmitting && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* Indicador de progreso de completado */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
        <div
          className="h-full bg-green-500 transition-all duration-500"
          style={{ width: `${completionPercentage()}%` }}
        ></div>
      </div>

      <CardHeader>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-800">
              Registro al Evento
            </CardTitle>
            {loaderData?.event?.name && (
              <span className="bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full">
                {loaderData.event.name}
              </span>
            )}
          </div>
          <CardDescription>
            Completa el formulario para confirmar tu asistencia.
            {completionPercentage() > 0 && (
              <span className="text-green-600 font-medium ml-2">
                {Math.round(completionPercentage())}% completado
              </span>
            )}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        <Form method="post" className="space-y-4" replace>
          {/* Nombre */}
          <div className="space-y-2">
            <FormField id="name" error={errors.name}>
              <TextInput
                label="Nombre completo"
                id="name"
                name="name"
                type="text"
                placeholder="Ej. Andrea Sánchez"
                required
                icon={
                  <UserCircle size={20} className="text-muted-foreground" />
                }
                disabled={isSubmitting || isLoading}
                onChange={(e) => {
                  handleInputChange(e);
                  if (!touchedFields.name) {
                    setTouchedFields((prev) => ({ ...prev, name: true }));
                  }
                  const hasValue = e.target.value.trim() !== "";
                  setFormData((prev) => ({ ...prev, name: hasValue }));
                }}
                onBlur={() => handleFieldBlur("name")}
                aria-invalid={!!errors.name}
                aria-errormessage={errors.name ? "name-error" : undefined}
                className={
                  touchedFields.name && !errors.name && formData.name
                    ? "border-green-500 focus:ring-green-500"
                    : ""
                }
              />
            </FormField>
            {touchedFields.name && !errors.name && formData.name && (
              <p className="text-green-600 text-xs flex items-center">
                <CheckCircle size={14} className="mr-1" /> Campo válido
              </p>
            )}
          </div>

          {/* Correo */}
          <div className="space-y-2">
            <FormField id="email" error={errors.email}>
              <TextInput
                label="Correo electrónico"
                id="email"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                required
                icon={<Mail size={20} className="text-muted-foreground" />}
                disabled={isSubmitting || isLoading}
                onChange={(e) => {
                  handleInputChange(e);
                  if (!touchedFields.email) {
                    setTouchedFields((prev) => ({
                      ...prev,
                      email: true,
                    }));
                  }
                  const hasValue = e.target.value.trim() !== "";
                  setFormData((prev) => ({ ...prev, email: hasValue }));
                }}
                onBlur={() => handleFieldBlur("email")}
                aria-invalid={!!errors.email}
                aria-errormessage={errors.email ? "email-error" : undefined}
                className={
                  touchedFields.email && !errors.email && formData.email
                    ? "border-green-500 focus:ring-green-500"
                    : ""
                }
              />
            </FormField>
            {touchedFields.email && !errors.email && formData.email && (
              <p className="text-green-600 text-xs flex items-center">
                <CheckCircle size={14} className="mr-1" /> Campo válido
              </p>
            )}
          </div>

          {/* Telefono */}
          <div className="space-y-2">
            <FormField id="phone" error={errors.phone}>
              <TextInput
                label="Teléfono"
                id="phone"
                name="phone"
                type="tel"
                inputMode="tel"
                placeholder="Ej. +34 600 123 456"
                required
                icon={<Phone size={20} className="text-muted-foreground" />}
                disabled={isSubmitting || isLoading}
                onChange={(e) => {
                  handleInputChange(e);

                  if (!touchedFields.phone) {
                    setTouchedFields((prev) => ({
                      ...prev,
                      phone: true,
                    }));
                  }

                  const hasValue = e.target.value.trim() !== "";
                  setFormData((prev) => ({ ...prev, phone: hasValue }));
                }}
                onBlur={() => handleFieldBlur("phone")}
                aria-invalid={!!errors.phone}
                aria-errormessage={errors.phone ? "phone-error" : undefined}
                className={
                  touchedFields.phone && !errors.phone && formData.phone
                    ? "border-green-500 focus:ring-green-500"
                    : ""
                }
              />
            </FormField>
            {touchedFields.phone && !errors.phone && formData.phone && (
              <p className="text-green-600 text-xs flex items-center">
                <CheckCircle size={14} className="mr-1" /> Campo válido
              </p>
            )}
          </div>

          {/* Botón */}
          <div className="flex justify-end pt-6 border-t border-border gap-3">
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors relative"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Confirmar Registro"
              )}
            </Button>
          </div>
        </Form>

        {/* Información adicional */}
        <div className="mt-6 text-xs text-muted-foreground border-t pt-4">
          <p className="flex items-center">
            <AlertCircle size={14} className="mr-1" />
            Tus datos se utilizarán exclusivamente para gestionar tu asistencia
            al evento.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
