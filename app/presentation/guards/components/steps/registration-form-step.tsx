import {
  MoreHorizontal,
  RefreshCcwDotIcon,
  Save,
  UserPlus,
  UserSearch,
} from "lucide-react";
import type { FetcherWithComponents } from "react-router";
import type { EventEntityWithEventForm } from "~/domain/entities/event.entity";
import type { RegistrationWithFullRelations } from "~/domain/entities/registration.entity";
import { PageHeader } from "~/shared/components/common/page-header";
import { EventFormRenderer } from "~/shared/components/forms/event-form-renderer";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/shared/components/ui/dropdown-menu";
import type { ValidationErrors } from "~/shared/hooks/use-form-validation.hook";
import { RegisterAttendeeForm } from "../register-attendee-form";

interface RegistrationFormStepProps {
  selectedEvent: EventEntityWithEventForm;
  selectedEmail: string;
  fetcher: FetcherWithComponents<any>;
  isSubmitting: boolean;
  errors: ValidationErrors;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onClearEmail: () => void;
  onClearEvent: () => void;
  actionUrl: string;
  title?: string;
  description?: string;
  defaultValues?: RegistrationWithFullRelations;
}

export function RegistrationFormStep({
  selectedEvent,
  selectedEmail,
  fetcher,
  isSubmitting,
  errors,
  handleInputChange,
  onClearEmail,
  onClearEvent,
  actionUrl,
  title,
  description,
  defaultValues,
}: RegistrationFormStepProps) {
  const defaultTitle =
    title || `Registrar asistente para ${selectedEvent.name}`;
  const defaultDescription =
    description || `Completando registro para: ${selectedEmail}`;

  const isUpdateMode = !!defaultValues;

  return (
    <div>
      <fetcher.Form method="post" action={actionUrl} className="space-y-6">
        <PageHeader
          title={defaultTitle}
          description={defaultDescription}
          actions={
            <div className="flex gap-2">
              <div className="hidden md:flex gap-2">
                <Button variant="outline" size="sm" onClick={onClearEmail}>
                  <UserSearch className="h-4 w-4 mr-2" />
                  Cambiar email
                </Button>
                <Button variant="outline" size="sm" onClick={onClearEvent}>
                  <RefreshCcwDotIcon className="h-4 w-4 mr-2" />
                  Cambiar evento
                </Button>
              </div>

              <div className="md:hidden">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Abrir menú de acciones</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onClearEmail}>
                      <UserSearch className="h-4 w-4 mr-2" />
                      Cambiar email
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onClearEvent}>
                      <RefreshCcwDotIcon className="h-4 w-4 mr-2" />
                      Cambiar evento
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isUpdateMode ? (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Actualizando..." : "Actualizar registro"}
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Creando..." : "Crear registro"}
                  </>
                )}
              </Button>
            </div>
          }
        />

        <input type="hidden" name="email" value={selectedEmail} />

        <Card>
          <CardHeader>
            <CardTitle>Información del asistente</CardTitle>
          </CardHeader>
          <CardContent>
            <RegisterAttendeeForm
              handleInputChange={handleInputChange}
              errors={errors}
              defaultValues={{
                name: defaultValues?.user?.name || "",
                phone: defaultValues?.user?.phone || "",
                quantity: defaultValues?.purchasedTickets?.toString() || "",
              }}
              isSubmitting={isSubmitting}
              selectedEvent={selectedEvent}
              prefilledEmail={selectedEmail}
            />
          </CardContent>
        </Card>

        {selectedEvent?.EventForm?.isActive && (
          <Card>
            <CardHeader>
              <CardTitle>Formulario del evento</CardTitle>
            </CardHeader>
            <CardContent>
              <EventFormRenderer
                handleInputChange={handleInputChange}
                isSubmitting={isSubmitting}
                eventForm={selectedEvent.EventForm}
                defaultValues={defaultValues?.FormResponse || undefined}
                submitButtonText={isUpdateMode ? "Actualizar" : "Crear"}
              />
            </CardContent>
          </Card>
        )}
      </fetcher.Form>
    </div>
  );
}
