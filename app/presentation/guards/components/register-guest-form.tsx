import { RegistrationStatus } from "@prisma/client";
import { Briefcase, Loader2, Mail, UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Form, useLoaderData } from "react-router";
import { createGuestSchema } from "~/domain/dtos/user.dto";
import type { EventEntity } from "~/domain/entities/event.entity";
import { FormField } from "~/shared/components/common/form-field";
import { PageHeader } from "~/shared/components/common/page-header";
import { SelectInput } from "~/shared/components/common/select-input";
import { TextInput } from "~/shared/components/common/text-input";
import { Badge, type BadgeVariants } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import { Card, CardContent } from "~/shared/components/ui/card";
import { useFormAction } from "~/shared/hooks/use-form-action.hook";
import { useSearchParamsManager } from "~/shared/hooks/use-search-params-manager";

export function RegisterGuestForm() {
  const { isSubmitting, errors, handleInputChange } = useFormAction({
    zodSchema: createGuestSchema,
  });
  const { handleSearchParams, searchParams } = useSearchParamsManager();

  const { events, invites, user } = useLoaderData();

  const [selectedEventId, setSelectedEventId] = useState<string>(
    searchParams.get("eventId") || ""
  );

  // Estado controlado de todo el formulario
  const [formValues, setFormValues] = useState({
    eventId: searchParams.get("eventId") || "",
    quantity:
      invites &&
      invites.status === RegistrationStatus.REGISTERED &&
      invites.purchasedTickets
        ? invites.purchasedTickets.toString()
        : "",
    name: user?.name || "",
    email: searchParams.get("email") || "",
    phone: user?.phone || "",
  });

  const canFillDetails = Boolean(formValues.eventId && formValues.email);

  // Actualizar selectedEventId cuando cambia eventId
  useEffect(() => {
    setSelectedEventId(formValues.eventId);
  }, [formValues.eventId]);

  // Resetear valores cuando cambia el correo
  useEffect(() => {
    setFormValues((prev) => ({
      ...prev,
      name: user?.name || "",
      phone: user?.phone || "",
      quantity:
        invites &&
        invites.status === RegistrationStatus.REGISTERED &&
        invites.purchasedTickets
          ? invites.purchasedTickets.toString()
          : "",
    }));
  }, [formValues.email, invites, user]);

  const selectedEvent = events.find(
    (e: EventEntity) => e.id === selectedEventId
  );
  const userStatusBadges: Record<
    RegistrationStatus | "NEW",
    { text: string; variant: BadgeVariants }
  > = {
    [RegistrationStatus.PENDING]: {
      text: "Pendiente: invitado pero no registrado",
      variant: "amber",
    },
    [RegistrationStatus.REGISTERED]: {
      text: "Registrado",
      variant: "emerald",
    },
    [RegistrationStatus.CHECKED_IN]: {
      text: "Asistencia confirmada",
      variant: "emerald",
    },
    [RegistrationStatus.CANCELLED]: {
      text: "Registro cancelado",
      variant: "destructive",
    },
    [RegistrationStatus.WAITLISTED]: {
      text: "En lista de espera",
      variant: "slate",
    },
    [RegistrationStatus.DECLINED]: {
      text: "Invitación rechazada",
      variant: "destructive",
    },
    NEW: {
      text: "Usuario no invitado, será registrado",
      variant: "sky",
    },
  };

  const statusKey = invites ? invites.status : "NEW";
  const statusBadge =
    userStatusBadges[statusKey as keyof typeof userStatusBadges];

  return (
    <div className="max-w-full mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <PageHeader
          title="Crear invitado"
          description="Completa la información para crear un nuevo invitado"
          goBack={"/panel"}
        />
      </div>
      <Card className="w-full max-w-full shadow-xl relative z-10">
        <CardContent className="space-y-8">
          <Form method="post" replace>
            {/* Mensaje de tipo de usuario */}
            <div className="flex justify-end">
              <Badge variant={statusBadge.variant}>{statusBadge.text}</Badge>
            </div>

            {/* Sección Evento */}
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-4">Evento</h3>
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField id="eventId" error={errors.eventId}>
                    <SelectInput
                      label="Seleccionar evento"
                      name="eventId"
                      id="eventId"
                      value={formValues.eventId}
                      placeholder="Elige un evento..."
                      options={events.map((event: EventEntity) => ({
                        value: event.id,
                        label: event.name,
                      }))}
                      onValueChange={(value) => {
                        setFormValues((prev) => ({ ...prev, eventId: value }));
                        handleInputChange({
                          target: { name: "eventId", value },
                        } as React.ChangeEvent<HTMLInputElement>);
                        handleSearchParams("eventId", value);
                      }}
                      aria-invalid={!!errors.eventId}
                      aria-errormessage={
                        errors.eventId ? "eventId-error" : undefined
                      }
                      className="w-full"
                      required
                    />
                  </FormField>

                  <FormField id="email" error={errors?.email}>
                    <TextInput
                      label="Correo electrónico"
                      name="email"
                      id="email"
                      type="email"
                      value={formValues.email}
                      placeholder="ejemplo@correo.com"
                      required
                      icon={
                        <Mail size={20} className="text-muted-foreground" />
                      }
                      disabled={isSubmitting}
                      onChange={(e) => {
                        const { value } = e.target;
                        setFormValues((prev) => ({ ...prev, email: value }));
                        handleInputChange(e);
                      }}
                      onBlur={(e) =>
                        handleSearchParams("email", e.target.value)
                      }
                      aria-invalid={!!errors?.email}
                      aria-describedby={
                        errors?.email ? "email-error" : undefined
                      }
                    />
                  </FormField>
                </div>
                <div className="grid gap-5 md:grid-cols-1 mt-2">
                  <FormField id="quantity" error={errors.quantity}>
                    <SelectInput
                      label="Número de invitaciones"
                      name="quantity"
                      id="quantity"
                      value={formValues.quantity}
                      placeholder="Seleccione cantidad"
                      required
                      options={Array.from(
                        {
                          length: Math.min(
                            selectedEvent?.maxTickets || 0,
                            selectedEvent?.capacity || 0
                          ),
                        },
                        (_, index) => ({
                          value: (index + 1).toString(),
                          label: (index + 1).toString(),
                        })
                      )}
                      disabled={isSubmitting || !canFillDetails}
                      onValueChange={(value) => {
                        setFormValues((prev) => ({ ...prev, quantity: value }));
                        handleInputChange({
                          target: { name: "quantity", value },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      aria-invalid={!!errors.quantity}
                      aria-errormessage={
                        errors.quantity ? "quantity-error" : undefined
                      }
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Información personal */}
            <div className="flex items-start gap-4 pt-2">
              <div className="bg-primary/10 p-3 rounded-lg">
                <UserCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-4">
                  Información personal
                </h3>
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField id="name" error={errors?.name}>
                    <TextInput
                      label="Nombre completo"
                      name="name"
                      id="name"
                      type="text"
                      value={formValues.name}
                      placeholder="Ej: María González"
                      required
                      icon={
                        <UserCircle
                          size={20}
                          className="text-muted-foreground"
                        />
                      }
                      disabled={isSubmitting || !canFillDetails}
                      onChange={(e) => {
                        const { value } = e.target;
                        setFormValues((prev) => ({ ...prev, name: value }));
                        handleInputChange(e);
                      }}
                      aria-invalid={!!errors?.name}
                      aria-describedby={errors?.name ? "name-error" : undefined}
                    />
                  </FormField>

                  <FormField id="phone" error={errors?.phone}>
                    <TextInput
                      label="Teléfono"
                      name="phone"
                      id="phone"
                      type="tel"
                      inputMode="tel"
                      value={formValues.phone}
                      placeholder="+52 123 456 7890"
                      disabled={isSubmitting || !canFillDetails}
                      onChange={(e) => {
                        const { value } = e.target;
                        setFormValues((prev) => ({ ...prev, phone: value }));
                        handleInputChange(e);
                      }}
                      aria-invalid={!!errors?.phone}
                      aria-describedby={
                        errors?.phone ? "phone-error" : undefined
                      }
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Botón submit */}
            <div className="flex justify-end pt-6 border-t border-border gap-3">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={
                  isSubmitting ||
                  invites?.status === RegistrationStatus.CHECKED_IN
                }
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando
                  </>
                ) : invites && invites.status === RegistrationStatus.PENDING ? (
                  "Registrar invitado"
                ) : invites &&
                  invites.status === RegistrationStatus.REGISTERED ? (
                  "Hacer check-in"
                ) : !canFillDetails ? (
                  "Selecciona evento y correo"
                ) : (
                  "Guardar"
                )}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
