import { Loader2, Mail, UserCircle } from "lucide-react";
import { useId } from "react";
import type { EventEntityWithEventForm } from "~/domain/entities/event.entity";
import { FormField } from "~/shared/components/common/form-field";
import { NumberInput } from "~/shared/components/common/number-input";
import { SelectInput } from "~/shared/components/common/select-input";
import { TextInput } from "~/shared/components/common/text-input";
import { Button } from "~/shared/components/ui/button";
import type { ValidationErrors } from "~/shared/hooks/use-form-validation.hook";
import { useSearchParamsManager } from "~/shared/hooks/use-search-params-manager";

interface RegisterAttendeeProps {
  selectedEvent: EventEntityWithEventForm;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  isSubmitting?: boolean;
  errors: ValidationErrors;
  prefilledEmail?: string;
  defaultValues?: {
    eventId: string;
    quantity: string;
    name: string;
    email: string;
    phone: string;
  };
}

export function RegisterAttendeeForm({
  selectedEvent,
  defaultValues,
  handleInputChange,
  isSubmitting,
  errors,
  prefilledEmail,
}: RegisterAttendeeProps) {
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const quantityId = useId();

  const { handleSearchParams } = useSearchParamsManager();

  return (
    <div className="space-y-6">
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="hidden" name="eventId" value={selectedEvent.id} />

          {/* Email field - now read-only when prefilled */}
          <FormField id={emailId} error={errors?.email}>
            <TextInput
              label="Correo electrónico"
              name="email"
              id={emailId}
              type="email"
              defaultValue={prefilledEmail || defaultValues?.email || ""}
              placeholder="ejemplo@correo.com"
              required
              readOnly={!!prefilledEmail}
              icon={<Mail size={20} className="text-muted-foreground" />}
              disabled={isSubmitting || !!prefilledEmail}
              onChange={handleInputChange}
              onBlur={(e) => !prefilledEmail && handleSearchParams("email", e.target.value)}
              aria-invalid={!!errors?.email}
              aria-describedby={errors?.email ? "email-error" : undefined}
              className={prefilledEmail ? "bg-muted/50" : ""}
            />
            {prefilledEmail && (
              <p className="text-xs text-muted-foreground mt-1">
                Email seleccionado en el paso anterior
              </p>
            )}
          </FormField>

          <FormField id={quantityId} error={errors.quantity}>
            <SelectInput
              label="Número de invitaciones"
              name="quantity"
              id={quantityId}
              defaultValue={defaultValues?.quantity || ""}
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
              disabled={isSubmitting}
              onValueChange={(value) => {
                handleInputChange({
                  target: { name: "quantity", value },
                } as React.ChangeEvent<HTMLInputElement>);
              }}
              aria-invalid={!!errors.quantity}
              aria-errormessage={errors.quantity ? "quantity-error" : undefined}
            />
          </FormField>
        </div>
      </div>

      {/* Información personal */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField id={nameId} error={errors?.name}>
            <TextInput
              label="Nombre completo"
              name="name"
              id={nameId}
              type="text"
              placeholder="Ej: María González"
              required
              icon={<UserCircle size={20} className="text-muted-foreground" />}
              disabled={isSubmitting}
              onChange={handleInputChange}
              defaultValue={defaultValues?.name || ""}
              aria-invalid={!!errors?.name}
              aria-describedby={errors?.name ? "name-error" : undefined}
            />
          </FormField>

          <FormField id={phoneId} error={errors?.phone}>
            <TextInput
              label="Teléfono"
              name="phone"
              id={phoneId}
              type="tel"
              placeholder="Ej: +52 33 1234 5678"
              icon={<UserCircle size={20} className="text-muted-foreground" />}
              disabled={isSubmitting}
              onChange={handleInputChange}
              defaultValue={defaultValues?.phone || ""}
              aria-invalid={!!errors?.phone}
              aria-describedby={errors?.phone ? "phone-error" : undefined}
            />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Registrar asistente
        </Button>
      </div>
    </div>
  );
}
