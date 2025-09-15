import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  BadgeCheck,
  Calendar,
  CheckCircle,
  ClipboardCheck,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Ticket,
  UserCircle,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Form } from "react-router";
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
  } = useRegistrationForm();

  const [progress, setProgress] = useState(0);
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    email: false,
    quantity: false,
  });
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    quantity: 0,
  });

  //Efecto para inicializar el formulario con los datos del usuario
  useEffect(() => {
    if (user) {
      if (user.name) {
        setTouchedFields((prev) => ({ ...prev, name: true }));
      }
      if (user.email) {
        setTouchedFields((prev) => ({ ...prev, email: true }));
      }
    }
  }, [user]);
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

    if (touchedFields.quantity && !errors.quantity && formData.quantity)
      completed++;

    return (completed / totalFields) * 100;
  };

  if (showSuccess) {
    return <RegistrationConfirm />;
  }

  return (
    <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Barra de progreso durante envío */}
      {isSubmitting && (
        <div className="w-full h-1.5 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      )}

      {/* Indicador de progreso de completado */}
      <div className="w-full h-1.5 bg-gray-100">
        <div
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
          style={{ width: `${completionPercentage()}%` }}
        ></div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sección de información del evento (lado izquierdo) */}
        <div className="bg-gradient-to-br from-primary to-secondary text-white p-8 md:w-2/5">
          <div className="mb-8">
            {/* Etiqueta invitación */}
            <div className="flex items-center mb-6">
              <Ticket className="h-5 w-5 mr-2 text-white/80" />
              <span className="text-xs font-semibold tracking-wide bg-white/20 px-3 py-1 rounded-full">
                INVITACIÓN GRATUITA
              </span>
            </div>

            {/* Título */}
            <h2 className="text-3xl font-extrabold mb-6 leading-snug">
              {event?.name || "Nombre del Evento"}
            </h2>

            {/* Detalles */}
            <div className="space-y-6">
              {/* Fecha y hora */}
              <div className="flex items-start">
                <div className="bg-white/20 p-2 rounded-lg mr-3">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm uppercase tracking-wide">
                    Fecha y Hora
                  </p>
                  <p className="text-sm opacity-90">
                    {event?.start_date
                      ? new Date(event.start_date).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Fecha del evento"}
                    {event?.start_date && (
                      <>
                        {" · "}
                        {new Date(event.start_date).toLocaleTimeString(
                          "es-ES",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </>
                    )}
                  </p>
                  {event?.end_date && (
                    <p className="text-xs opacity-75 mt-1">
                      Hasta{" "}
                      {new Date(event.end_date).toLocaleDateString("es-ES")} ·{" "}
                      {new Date(event.end_date).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </div>

              {/* Ubicación */}
              <div className="flex items-start">
                <div className="bg-white/20 p-2 rounded-lg mr-3">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm uppercase tracking-wide">
                    Ubicación
                  </p>
                  <p className="text-sm opacity-90">
                    {event?.location || "Ubicación del evento"}
                  </p>
                </div>
              </div>

              {/* Capacidad */}
              <div className="flex items-start">
                <div className="bg-white/20 p-2 rounded-lg mr-3">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm uppercase tracking-wide">
                    Capacidad
                  </p>
                  <p className="text-sm opacity-90">
                    {event?.capacity || "0"} personas ·{" "}
                    {event?.maxTickets
                      ? `${event.maxTickets} máx. por persona`
                      : "Invitaciones limitadas"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección del formulario (lado derecho) */}
        <div className="p-8 md:w-3/5">
          {/* Header personalizado para usuarios registrados */}
          {user ? (
            <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-100 p-4 rounded-xl border border-green-200">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-full mr-3">
                  <BadgeCheck className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-800 flex items-center">
                    ¡Hola de nuevo {user.name?.split(" ")[0]}!
                    <Sparkles className="h-4 w-4 ml-2 text-yellow-500" />
                  </h3>
                  <p className="text-sm text-green-600">
                    Tus datos se han precargado para una experiencia más rápida
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <UserCircle className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-800">¡Bienvenido!</h3>
                  <p className="text-sm text-blue-600">
                    Completa tus datos para confirmar tu asistencia
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-800">
                Confirmar Asistencia
              </h2>
              {user && (
                <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center">
                  <BadgeCheck className="h-3 w-3 mr-1" />
                  Usuario verificado
                </span>
              )}
            </div>
            <p className="text-gray-600">
              Completa tus datos para confirmar tu asistencia al evento.
              {/* {completionPercentage() > 0 && (
                <span className="text-green-600 font-medium ml-2">
                  {Math.round(completionPercentage())}% completado
                </span>
              )} */}
            </p>
          </div>

          <Form method="post" className="space-y-6" replace>
            {/* Nombre */}
            {user && !user.name && (
              <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="space-y-2">
                  <FormField id="name" error={errors.name}>
                    <TextInput
                      label="Nombre completo"
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Ej. Andrea Sánchez"
                      required
                      readOnly={user && user.name ? true : false}
                      defaultValue={user?.name}
                      icon={<UserCircle size={20} className="text-gray-400" />}
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
                          ? "border-green-500 focus:ring-green-500 focus:border-green-500"
                          : ""
                      }
                    />
                  </FormField>
                  {(user?.name ||
                    (touchedFields.name && !errors.name && formData.name)) && (
                    <p className="text-green-600 text-xs flex items-center">
                      <CheckCircle size={14} className="mr-1" />
                      {user?.name
                        ? "Precargado desde tu cuenta"
                        : "Campo válido"}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    readOnly
                    defaultValue={user?.email}
                    icon={<Mail size={20} className="text-gray-400" />}
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
                        ? "border-green-500 focus:ring-green-500 focus:border-green-500"
                        : ""
                    }
                  />
                </FormField>
                {(user?.email ||
                  (touchedFields.email && !errors.email && formData.email)) && (
                  <p className="text-green-600 text-xs flex items-center">
                    <CheckCircle size={14} className="mr-1" />
                    {user?.email
                      ? "Precargado desde tu cuenta"
                      : "Campo válido"}
                  </p>
                )}
              </div>

              {/* Teléfono */}
              <div className="space-y-2">
                <FormField id="phone" error={errors.phone}>
                  <TextInput
                    label="Teléfono"
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    defaultValue={user?.phone}
                    placeholder="Ej. +34 600 123 456"
                    icon={<Phone size={20} className="text-gray-400" />}
                    disabled={isSubmitting || isLoading}
                    onChange={(e) => {
                      handleInputChange(e);
                    }}
                    onBlur={() => handleFieldBlur("phone")}
                    aria-invalid={!!errors.phone}
                    aria-errormessage={errors.phone ? "phone-error" : undefined}
                  />
                </FormField>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              {/* Cantidad de Tickets a reservar */}
              <div className="space-y-2">
                <FormField id="quantity" error={errors.quantity}>
                  <SelectInput
                    label="Número de invitaciones"
                    placeholder="Seleccione cantidad"
                    id="quantity"
                    name="quantity"
                    required
                    options={Array.from(
                      {
                        length: Math.min(
                          event.maxTickets || 5,
                          event.capacity || 5
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
                      if (!touchedFields.quantity) {
                        setTouchedFields((prev) => ({
                          ...prev,
                          quantity: true,
                        }));
                      }
                      const hasValue = parseInt(value.trim());
                      setFormData((prev) => ({
                        ...prev,
                        quantity: hasValue,
                      }));
                    }}
                    aria-invalid={!!errors.quantity}
                    aria-errormessage={
                      errors.quantity ? "quantity-error" : undefined
                    }
                    className={
                      touchedFields.quantity &&
                      !errors.quantity &&
                      formData.quantity
                        ? "border-green-500 focus:ring-green-500 focus:border-green-500"
                        : ""
                    }
                  />
                </FormField>
                {touchedFields.quantity &&
                  !errors.quantity &&
                  formData.quantity && (
                    <p className="text-green-600 text-xs flex items-center">
                      <CheckCircle size={14} className="mr-1" /> Campo válido
                    </p>
                  )}
              </div>
            </div>

            {/* Resumen de la reserva */}
            <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                <ClipboardCheck size={18} className="mr-2 text-blue-600" />
                Resumen de tu reserva
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-gray-600">Evento:</div>
                <div className="font-medium text-right">
                  {event?.name || "Nombre del evento"}
                </div>

                <div className="text-gray-600">Invitaciones:</div>
                <div className="font-medium text-right">
                  {formData.quantity || 0}
                </div>

                <div className="text-gray-600">Fecha:</div>
                <div className="font-medium text-right">
                  {event?.start_date
                    ? new Date(event.start_date).toLocaleDateString("es-ES")
                    : "Fecha del evento"}
                </div>
              </div>
              {/* <div className="mt-4 pt-3 border-t border-blue-200">
                <div className="flex justify-between items-center">
                  <span className="text-blue-800 font-semibold">Total:</span>
                  <span className="text-green-600 font-bold text-lg">
                    GRATUITO
                  </span>
                </div>
              </div> */}
            </div>

            {/* Botón */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                className="bg-gradient-to-r from-primary to-secondary  hover:from-secondary hover:to-primary transition-all shadow-md hover:shadow-lg relative py-3 px-8 text-base rounded-lg"
                disabled={isSubmitting || isLoading || !formData.quantity}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Procesando reserva...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Confirmar Asistencia
                  </>
                )}
              </Button>
            </div>
          </Form>

          {/* Información adicional */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-start">
              <AlertCircle
                size={16}
                className="text-gray-500 mr-2 mt-0.5 flex-shrink-0"
              />
              <p className="text-sm text-gray-600">
                Tus datos se utilizarán exclusivamente para gestionar tu
                asistencia al evento. Recibirás un correo de confirmación con
                los detalles de tu reserva.
              </p>
            </div>

            {event?.organizer && (
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <span className="mr-2">Organizado por:</span>
                <span className="font-medium">{event.organizer.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
