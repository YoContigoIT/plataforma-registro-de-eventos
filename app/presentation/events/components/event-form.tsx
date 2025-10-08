import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Label } from "@/ui/label";
import { Switch } from "@/ui/switch";
import { EventStatus } from "@prisma/client";
import { Calendar, MapPin, Users } from "lucide-react";
import { useCallback, useId, useState } from "react";
import { Form, Link } from "react-router";
import { createEventSchema, updateEventSchema } from "~/domain/dtos/event.dto";
import type { FormFieldEntity } from "~/domain/entities/event-form.entity";
import type { EventEntityWithEventForm } from "~/domain/entities/event.entity";
import { ConfirmationDialog } from "~/shared/components/common/confirmation-dialog";
import { DateInput } from "~/shared/components/common/date-input";
import { NumberInput } from "~/shared/components/common/number-input";
import { SelectInput } from "~/shared/components/common/select-input";
import { TextInput } from "~/shared/components/common/text-input";
import { Textarea } from "~/shared/components/ui/textarea";
import { useFormAction } from "~/shared/hooks/use-form-action.hook";
import { FormBuilder } from "./form-builder";

const statusOptions = [
  { value: EventStatus.DRAFT, label: "Borrador" },
  { value: EventStatus.UPCOMING, label: "Próximo" },
  { value: EventStatus.ONGOING, label: "En curso" },
  { value: EventStatus.ENDED, label: "Finalizado" },
  { value: EventStatus.CANCELLED, label: "Cancelado" },
];

interface EventFormProps {
  eventData?: EventEntityWithEventForm;
  isEditing?: boolean;
}

export function EventForm({
  eventData = undefined,
  isEditing = false,
}: EventFormProps) {
  const { isSubmitting, errors, handleInputChange } = useFormAction({
    zodSchema: isEditing ? updateEventSchema : createEventSchema,
  });
  const descriptionId = useId();
  const agendaId = useId();
  const formStatusSwitchId = useId();
  const requiresSignatureSwitchId = useId();
  const publicSwitchId = useId();

  const [isFormActive, setIsFormActive] = useState(
    eventData?.EventForm?.isActive ?? true
  );
  const [requiresSignature, setRequiresSignature] = useState(
    eventData?.requiresSignature ?? false
  );
  const [isPublic, setIsPublic] = useState(eventData?.isPublic ?? false);

  const initialFormFields: FormFieldEntity[] = (() => {
    return isEditing && eventData?.EventForm?.fields
      ? eventData.EventForm.fields.map((field, index) => ({
          id: field.id || `field-${index}`,
          label: field.label,
          formId: field.formId || "",
          type: field.type,
          required: field.required,
          placeholder: field.placeholder || null,
          options: Array.isArray(field.options)
            ? field.options
            : field.options || null,
          validation: field.validation || null,
          order: field.order,
        }))
      : [];
  })();
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);

  const getAllowedStatusOptions = useCallback(() => {
    if (!isEditing) {
      return statusOptions.filter(
        (opt) =>
          opt.value === EventStatus.DRAFT ||
          opt.value === EventStatus.UPCOMING ||
          opt.value === EventStatus.ONGOING
      );
    }

    if (eventData?.status === EventStatus.ONGOING) {
      return statusOptions.filter(
        (opt) =>
          opt.value === EventStatus.ENDED || opt.value === EventStatus.ONGOING
      );
    }

    if (eventData?.status === EventStatus.ENDED) {
      return statusOptions.filter((opt) => opt.value === EventStatus.ENDED);
    }
    return statusOptions;
  }, [isEditing, eventData?.status]);

  return (
    <>
      <Form method="POST" replace className="space-y-6">
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Información del evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEditing && eventData?.id && (
              <input type="hidden" name="id" defaultValue={eventData?.id} />
            )}
            {eventData?.organizerId && (
              <input
                type="hidden"
                name="organizerId"
                defaultValue={eventData?.organizerId}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput
                label="Nombre del evento"
                name="name"
                placeholder="Ingresa el nombre del evento"
                required
                error={errors.name?.[0]}
                onChange={handleInputChange}
                defaultValue={eventData?.name}
              />
              <TextInput
                label="Ubicación"
                name="location"
                placeholder="Ingresa la ubicación del evento"
                icon={<MapPin className="h-4 w-4 text-muted-foreground" />}
                required
                error={errors.location?.[0]}
                onChange={handleInputChange}
                defaultValue={eventData?.location || ""}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DateInput
                label="Fecha y hora de inicio"
                name="start_date"
                placeholder="Selecciona la fecha de inicio"
                required
                includeTime
                timeFormat="24h"
                error={errors.start_date?.[0]}
                value={
                  eventData?.start_date
                    ? new Date(eventData?.start_date)
                    : undefined
                }
                onChange={(date) => {
                  handleInputChange({
                    target: {
                      name: "start_date",
                      value: date?.toISOString() || "",
                    },
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
              />
              <DateInput
                label="Fecha y hora de fin"
                name="end_date"
                placeholder="Selecciona la fecha de fin"
                required
                includeTime
                timeFormat="24h"
                error={errors.end_date?.[0]}
                value={
                  eventData?.end_date
                    ? new Date(eventData?.end_date)
                    : undefined
                }
                onChange={(date) => {
                  handleInputChange({
                    target: {
                      name: "end_date",
                      value: date?.toISOString() || "",
                    },
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NumberInput
                label="Capacidad"
                name="capacity"
                placeholder="Ingresa la capacidad del evento"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
                min={1}
                required
                allowNegative={false}
                allowDecimals={false}
                error={errors.capacity?.[0]}
                value={eventData?.capacity}
                onChange={(value) => {
                  handleInputChange({
                    target: {
                      name: "capacity",
                      value: value?.toString() || "",
                    },
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
              />
              <NumberInput
                label="Máximo de tickets por persona"
                name="maxTickets"
                placeholder="Ingresa el máximo de tickets"
                min={1}
                required
                allowNegative={false}
                allowDecimals={false}
                error={errors.maxTickets?.[0]}
                value={eventData?.maxTickets?.toString()}
                onChange={(value) => {
                  handleInputChange({
                    target: {
                      name: "maxTickets",
                      value: value?.toString() || "",
                    },
                  } as React.ChangeEvent<HTMLInputElement>);
                }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectInput
                label="Estado"
                name="status"
                options={getAllowedStatusOptions()}
                defaultValue={eventData?.status || EventStatus.DRAFT}
                placeholder="Selecciona el estado del evento"
                error={errors.status?.[0]}
                onValueChange={(value) => {
                  handleInputChange({
                    target: { name: "status", value },
                  } as React.ChangeEvent<HTMLInputElement>);

                  if (value === EventStatus.CANCELLED) {
                    setShowConfirmationDialog(true);
                  }
                }}
              />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-2">
                <Label
                  htmlFor={requiresSignatureSwitchId}
                  className="text-sm font-medium"
                >
                  Requiere firma
                </Label>
                <Switch
                  id={requiresSignatureSwitchId}
                  checked={requiresSignature}
                  onCheckedChange={setRequiresSignature}
                />
                <input
                  type="hidden"
                  name="requiresSignature"
                  value={requiresSignature.toString()}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Label htmlFor={publicSwitchId} className="text-sm font-medium">
                  Invitación pública
                </Label>
                <Switch
                  id={publicSwitchId}
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <input
                  type="hidden"
                  name="isPublic"
                  value={isPublic.toString()}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Descripción y agenda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-sm font-medium">
                  Descripción
                </Label>
                <Textarea
                  id={descriptionId}
                  name="description"
                  className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ingresa una descripción del evento"
                  onChange={handleInputChange}
                  defaultValue={eventData?.description || ""}
                />
                {errors.description && (
                  <p className="text-sm font-medium text-destructive mt-1">
                    {errors.description[0]}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="agenda" className="text-sm font-medium">
                  Agenda
                </Label>
                <Textarea
                  id={agendaId}
                  name="agenda"
                  className="flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Ingresa la agenda del evento"
                  onChange={handleInputChange}
                  defaultValue={eventData?.agenda || ""}
                />
                {errors.agenda && (
                  <p className="text-sm font-medium text-destructive mt-1">
                    {errors.agenda[0]}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Builder Section with Title and Toggle */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <CardTitle>Formulario del evento</CardTitle>
                <CardDescription>
                  Configura los campos del formulario para el evento.
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Label
                  htmlFor="form-status-switch"
                  className="text-sm font-medium"
                >
                  {isFormActive ? "Habilitado" : "Deshabilitado"}
                </Label>
                <Switch
                  id={formStatusSwitchId}
                  checked={isFormActive}
                  onCheckedChange={setIsFormActive}
                />
                <input
                  type="hidden"
                  name="isActive"
                  value={isFormActive.toString()}
                />
              </div>
            </div>
          </CardHeader>
          {isFormActive && (
            <CardContent>
              <FormBuilder
                initialFields={initialFormFields}
                handleInputChange={handleInputChange}
                isActive={isFormActive}
              />
            </CardContent>
          )}
          {/* when form is disabled, still include existing fields as hidden inputs to preserve them */}
          {!isFormActive && isEditing && initialFormFields.length > 0 && (
            <input
              type="hidden"
              name="formFields"
              value={JSON.stringify(initialFormFields)}
            />
          )}
        </Card>

        <div className="flex w-full justify-end gap-4">
          <Button variant="outline" asChild>
            <Link to="/eventos">Cancelar</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              isEditing ? (
                "Actualizando..."
              ) : (
                "Creando..."
              )
            ) : (
              <>
                <Calendar className="w-4 h-4 mr-2" />
                {isEditing ? "Actualizar evento" : "Crear evento"}
              </>
            )}
          </Button>
        </div>
      </Form>

      <ConfirmationDialog
        isOpen={showConfirmationDialog && isEditing}
        onClose={() => {
          setShowConfirmationDialog(false);
        }}
        onConfirm={() => {
          setShowConfirmationDialog(false);
        }}
        title="Cancelar evento"
        description={`¿Estás seguro de que quieres cancelar el evento "${eventData?.name}"?. Esta acción enviará un email de cancelación a todos los invitados.`}
        confirmText="Confirmar"
        cancelText="Cancelar"
        variant="destructive"
        showTextarea={false}
      />
    </>
  );
}
