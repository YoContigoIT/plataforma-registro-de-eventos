import { Button } from "@/components/ui/button";
import {
  BadgeCheck,
  CheckCircle,
  ClipboardCheck,
  Loader2,
  Mail,
  Phone,
  Sparkles,
  UserCircle,
} from "lucide-react";
import { useEffect, useId, useState } from "react";
import type { FetcherWithComponents } from "react-router";
import type { EventEntity } from "~/domain/entities/event.entity";
import type { UserEntity } from "~/domain/entities/user.entity";
import { FormField } from "~/shared/components/common/form-field";
import { SelectInput } from "~/shared/components/common/select-input";
import { TextInput } from "~/shared/components/common/text-input";

interface RegistrationFormProps {
  event: EventEntity;
  user: UserEntity | null;
  fetcher: FetcherWithComponents<FormData>;
  inviteToken?: string;
}

export function RegistrationForm({
  event,
  user,
  fetcher,
  inviteToken,
}: RegistrationFormProps) {
  // Get submission state from fetcher
  const isSubmitting = fetcher.state === "submitting";

  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const quantityId = useId();

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

  const handleFieldBlur = (fieldName: string) => {
    setTouchedFields((prev) => ({ ...prev, [fieldName]: true }));
  };

  // Simple input change handler without validation (handled by parent)
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={`p-8 transition-all duration-500 ease-in-out`}>
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
          <h2 className="text-2xl font-bold text-foreground">
            Confirmar asistencia
          </h2>
          {user && (
            <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center">
              <BadgeCheck className="h-3 w-3 mr-1" />
              Usuario verificado
            </span>
          )}
        </div>
        <p className="text-muted-foreground">
          Completa tus datos para confirmar tu asistencia al evento.
        </p>
      </div>

      <fetcher.Form
        method="post"
        className="space-y-6"
        action={`/api/create-attendee/${inviteToken}`}
      >
        {user && !user.name && (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div className="space-y-2">
              <FormField id={nameId}>
                <TextInput
                  label="Nombre completo"
                  name="name"
                  type="text"
                  placeholder="Ej. Andrea Sánchez"
                  required
                  readOnly={!!user?.name}
                  defaultValue={user?.name ?? ""}
                  icon={<UserCircle size={20} className="text-gray-400" />}
                  disabled={isSubmitting}
                  onChange={(e) => {
                    handleInputChange(e);
                    if (!touchedFields.name) {
                      setTouchedFields((prev) => ({ ...prev, name: true }));
                    }
                    setFormData((prev) => ({ ...prev, name: e.target.value }));
                  }}
                  onBlur={() => handleFieldBlur("name")}
                  className={
                    touchedFields.name && formData.name
                      ? "border-green-500 focus:ring-green-500 focus:border-green-500"
                      : ""
                  }
                />
              </FormField>
              {(user?.name || (touchedFields.name && formData.name)) && (
                <p className="text-green-600 text-xs flex items-center">
                  <CheckCircle size={14} className="mr-1" />
                  {user?.name ? "Precargado desde tu cuenta" : "Campo válido"}
                </p>
              )}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Correo */}
          <div className="space-y-2">
            <FormField id={emailId}>
              <TextInput
                label="Correo electrónico"
                name="email"
                type="email"
                placeholder="correo@ejemplo.com"
                required
                readOnly
                defaultValue={user?.email}
                icon={<Mail size={20} className="text-gray-400" />}
                disabled={isSubmitting}
                onChange={(e) => {
                  handleInputChange(e);
                  if (!touchedFields.email) {
                    setTouchedFields((prev) => ({
                      ...prev,
                      email: true,
                    }));
                  }
                  setFormData((prev) => ({ ...prev, email: e.target.value }));
                }}
                onBlur={() => handleFieldBlur("email")}
                className={
                  touchedFields.email && formData.email
                    ? "border-green-500 focus:ring-green-500 focus:border-green-500"
                    : ""
                }
              />
            </FormField>
            {(user?.email || (touchedFields.email && formData.email)) && (
              <p className="text-green-600 text-xs flex items-center">
                <CheckCircle size={14} className="mr-1" />
                {user?.email ? "Precargado desde tu cuenta" : "Campo válido"}
              </p>
            )}
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <FormField id={phoneId}>
              <TextInput
                label="Teléfono (opcional)"
                name="phone"
                type="tel"
                placeholder="Ej. +1 234 567 8900"
                defaultValue={user?.phone ?? ""}
                icon={<Phone size={20} className="text-gray-400" />}
                disabled={isSubmitting}
                onChange={handleInputChange}
              />
            </FormField>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          {/* Cantidad de Tickets a reservar */}
          <div className="space-y-2">
            <FormField id={quantityId}>
              <SelectInput
                label="Número de invitaciones"
                placeholder="Seleccione cantidad"
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
                disabled={isSubmitting}
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
                  const hasValue = Number.parseInt(value.trim(), 10);
                  setFormData((prev) => ({
                    ...prev,
                    quantity: hasValue,
                  }));
                }}
                className={
                  touchedFields.quantity && formData.quantity
                    ? "border-green-500 focus:ring-green-500 focus:border-green-500"
                    : ""
                }
              />
            </FormField>
            {touchedFields.quantity && formData.quantity && (
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
                ? new Date(event.start_date).toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Fecha por confirmar"}
            </div>

            <div className="text-gray-600">Hora:</div>
            <div className="font-medium text-right">
              {event?.start_date
                ? new Date(event.start_date).toLocaleTimeString("es-ES", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Hora por confirmar"}
            </div>
          </div>
        </div>

        {/* Botón de envío */}
        <div className="flex justify-center pt-4">
          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="w-full md:w-auto min-w-[200px] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Confirmando asistencia...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Confirmar asistencia
              </>
            )}
          </Button>
        </div>
      </fetcher.Form>
    </div>
  );
}
