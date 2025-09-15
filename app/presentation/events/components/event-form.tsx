import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { EventStatus } from "@prisma/client";
import { Calendar, MapPin, Users } from "lucide-react";
import { useId } from "react";
import { Form, Link } from "react-router";
import { createEventSchema, updateEventSchema } from "~/domain/dtos/event.dto";
import type { EventEntity } from "~/domain/entities/event.entity";
import { DateInput } from "~/shared/components/common/date-input";
import { NumberInput } from "~/shared/components/common/number-input";
import { SelectInput } from "~/shared/components/common/select-input";
import { TextInput } from "~/shared/components/common/text-input";
import { useFormAction } from "~/shared/hooks/use-form-action.hook";

const statusOptions = [
  { value: EventStatus.DRAFT, label: "Borrador" },
  { value: EventStatus.UPCOMING, label: "Próximo" },
  { value: EventStatus.ONGOING, label: "En curso" },
  { value: EventStatus.ENDED, label: "Finalizado" },
  { value: EventStatus.CANCELLED, label: "Cancelado" },
];

interface EventFormProps {
  eventData?: EventEntity;
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

  return (
    <Form method="POST" replace className="space-y-6">
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Información del evento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          {/* All form fields in a single grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name and Location */}
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

            {/* Dates */}
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
                eventData?.end_date ? new Date(eventData?.end_date) : undefined
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

            {/* Capacity and Tickets */}
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

            {/* Status */}
            <SelectInput
              label="Estado"
              name="status"
              options={statusOptions}
              defaultValue={eventData?.status || EventStatus.DRAFT}
              placeholder="Selecciona el estado del evento"
              error={errors.status?.[0]}
              onValueChange={(value) => {
                handleInputChange({
                  target: { name: "status", value },
                } as React.ChangeEvent<HTMLInputElement>);
              }}
            />
          </div>

          {/* Description and Agenda (full width) */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1.5">
              <label htmlFor="description" className="text-sm font-medium">
                Descripción
              </label>
              <textarea
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
              <label htmlFor="agenda" className="text-sm font-medium">
                Agenda
              </label>
              <textarea
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
        <CardFooter className="flex justify-end space-x-4 border-t p-6">
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
        </CardFooter>
      </Card>
    </Form>
  );
}
