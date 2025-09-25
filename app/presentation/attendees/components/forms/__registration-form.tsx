import { Button } from "@/components/ui/button";
import { AlertCircle, Calendar, Loader2, MapPin, Users } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Form } from "react-router";
import { EventFormRenderer } from "~/presentation/events/components/event-form-renderer";
import { FormField } from "~/shared/components/common/form-field";
import { SelectInput } from "~/shared/components/common/select-input";
import { TextInput } from "~/shared/components/common/text-input";
import { useRegistrationForm } from "../../hooks/useRegistrationForm";
import { RegistrationConfirm } from "./registration-confirm";

export function RegistrationForm() {
  const {
    isSubmitting,
    errors,
    handleInputChange,
    isLoading,
    event,
    user,
    showSuccess,
    eventForm,
    registrationId,
  } = useRegistrationForm();

  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const quantityId = useId();

  const [progress, setProgress] = useState(0);

  // Efecto de progreso simplificado - solo para envío
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

  if (showSuccess) {
    return <RegistrationConfirm />;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Barra de progreso única - solo durante el envío */}
      {isSubmitting && (
        <div className="w-full h-1 bg-gray-200">
          <div
            className="h-full bg-blue-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      <div className="flex flex-col md:flex-row">
        {/* Información del evento simplificada */}
        <div className="bg-blue-600 text-white p-6 md:w-2/5">
          <h2 className="text-2xl font-bold mb-6">
            {event?.name || "Nombre del Evento"}
          </h2>

          <div className="space-y-4">
            {/* Solo detalles esenciales del evento */}
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-3" />
              <div>
                <p className="text-sm font-medium">Fecha</p>
                <p className="text-sm opacity-90">
                  {event?.start_date
                    ? new Date(event.start_date).toLocaleDateString("es-ES", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Fecha del evento"}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-3" />
              <div>
                <p className="text-sm font-medium">Ubicación</p>
                <p className="text-sm opacity-90">
                  {event?.location || "Ubicación del evento"}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <Users className="h-4 w-4 mr-3" />
              <div>
                <p className="text-sm font-medium">Capacidad</p>
                <p className="text-sm opacity-90">
                  {event?.capacity || "0"} personas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección del formulario simplificada */}
        <div className="p-6 md:w-3/5">
          {/* Encabezado mínimo */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Confirmar Asistencia
            </h2>
            <p className="text-gray-600">
              Completa tus datos para confirmar tu asistencia.
            </p>
          </div>

          <Form method="post" className="space-y-4" replace>
            {/* Campo de nombre - solo mostrar si el usuario no tiene nombre */}
            {user && !user.name && (
              <FormField id={nameId} error={errors.name}>
                <TextInput
                  label="Nombre Completo"
                  name="name"
                  type="text"
                  placeholder="Ingresa tu nombre completo"
                  required
                  disabled={isSubmitting || isLoading}
                  onChange={handleInputChange}
                />
              </FormField>
            )}

            {/* Campo de email */}
            <FormField id={emailId} error={errors.email}>
              <TextInput
                label="Correo Electrónico"
                name="email"
                type="email"
                placeholder="tu.correo@ejemplo.com"
                required
                readOnly={!!user?.email}
                defaultValue={user?.email}
                disabled={isSubmitting || isLoading}
                onChange={handleInputChange}
              />
            </FormField>

            {/* Campo de teléfono */}
            <FormField id={phoneId} error={errors.phone}>
              <TextInput
                label="Teléfono"
                name="phone"
                type="tel"
                defaultValue={user?.phone}
                placeholder="Tu número de teléfono"
                disabled={isSubmitting || isLoading}
                onChange={handleInputChange}
              />
            </FormField>

            {/* Campo de cantidad */}
            <FormField id={quantityId} error={errors.quantity}>
              <SelectInput
                label="Número de boletos"
                placeholder="Selecciona cantidad"
                name="quantity"
                required
                options={Array.from(
                  {
                    length: Math.min(
                      event?.maxTickets || 5,
                      event?.capacity || 5
                    ),
                  },
                  (_, index) => ({
                    value: (index + 1).toString(),
                    label: (index + 1).toString(),
                  })
                )}
                disabled={isSubmitting || isLoading}
                onValueChange={(value) => {
                  handleInputChange({
                    target: { name: "quantity", value },
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
              />
            </FormField>

            {/* Resumen simple */}
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-medium text-gray-900 mb-2">Resumen</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex justify-between">
                  <span>Evento:</span>
                  <span>{event?.name || "Nombre del evento"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Boletos:</span>
                  <span>0</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo:</span>
                  <span className="text-green-600 font-medium">GRATIS</span>
                </div>
              </div>
            </div>

            <EventFormRenderer
              eventForm={eventForm}
              registrationId={registrationId}
            />

            {/* CTA único y claro */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 py-3"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Confirmar Asistencia"
              )}
            </Button>
          </Form>

          {/* Información del pie de página mínima */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-start">
              <AlertCircle size={14} className="text-gray-400 mr-2 mt-0.5" />
              <p className="text-xs text-gray-500">
                Tus datos se utilizarán exclusivamente para gestionar tu
                asistencia al evento. Recibirás un correo de confirmación con
                los detalles de tu reserva
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
