import { Briefcase, Loader2, Mail, UserCircle } from "lucide-react";
import { useState } from "react";
import { Form, useLoaderData } from "react-router";
import { createGuestSchema } from "~/domain/dtos/user.dto";
import type { EventEntity } from "~/domain/entities/event.entity";
import { FormField } from "~/shared/components/common/form-field";
import { PageHeader } from "~/shared/components/common/page-header";
import { SelectInput } from "~/shared/components/common/select-input";
import { TextInput } from "~/shared/components/common/text-input";
import { Button } from "~/shared/components/ui/button";
import { Card, CardContent } from "~/shared/components/ui/card";
import { useFormAction } from "~/shared/hooks/use-form-action.hook";

export function RegisterGuestForm() {
  const { isSubmitting, errors, handleInputChange } = useFormAction({
    zodSchema: createGuestSchema,
  });
  const { events } = useLoaderData();

  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const selectedEvent = events.find(
    (e: EventEntity) => e.id === selectedEventId
  );

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
                      placeholder="Elige un evento..."
                      options={events.map((event: EventEntity) => ({
                        value: event.id,
                        label: event.name,
                      }))}
                      onValueChange={(value) => {
                        setSelectedEventId(value);
                        handleInputChange({
                          target: { name: "eventId", value },
                        } as React.ChangeEvent<HTMLInputElement>);
                      }}
                      aria-invalid={!!errors.eventId}
                      aria-errormessage={
                        errors.eventId ? "eventId-error" : undefined
                      }
                      className="w-full"
                      required
                    />
                  </FormField>

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
                            selectedEvent?.maxTickets || 0,
                            selectedEvent?.capacity || 0
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
            <div className="flex items-start gap-4">
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
                      // defaultValue={defaultValues.name || ""}
                      label="Nombre completo"
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Ej: María González"
                      required
                      icon={
                        <UserCircle
                          size={20}
                          className="text-muted-foreground"
                        />
                      }
                      disabled={isSubmitting}
                      onChange={handleInputChange}
                      aria-invalid={Boolean(errors?.name)}
                      aria-describedby={errors?.name ? "name-error" : undefined}
                    />
                  </FormField>

                  <FormField id="email" error={errors?.email}>
                    <TextInput
                      label="Correo electrónico"
                      icon={
                        <Mail size={20} className="text-muted-foreground" />
                      }
                      id="email"
                      name="email"
                      type="email"
                      placeholder="ejemplo@correo.com"
                      required
                      disabled={isSubmitting}
                      onChange={handleInputChange}
                      aria-invalid={Boolean(errors?.email)}
                      aria-describedby={
                        errors?.email ? "email-error" : undefined
                      }
                    />
                  </FormField>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-lg">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-4">
                  Información laboral
                </h3>
                <div className="grid gap-5 md:grid-cols-2">
                  <FormField id="phone" error={errors?.phone}>
                    <TextInput
                      label="Teléfono"
                      id="phone"
                      name="phone"
                      type="tel"
                      inputMode="tel"
                      placeholder="+52 123 456 7890"
                      disabled={isSubmitting}
                      onChange={handleInputChange}
                      aria-invalid={Boolean(errors?.phone)}
                      aria-describedby={
                        errors?.phone ? "phone-error" : undefined
                      }
                    />
                  </FormField>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-border gap-3">
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando
                  </>
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
