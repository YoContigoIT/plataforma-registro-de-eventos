import { RegistrationStatus } from "@prisma/client";
import { Loader2, UserPlus } from "lucide-react";
import { useCallback } from "react";
import { Link, useLoaderData, useNavigation } from "react-router";
import { createGuestSchema } from "~/domain/dtos/user.dto";
import { PageHeader } from "~/shared/components/common/page-header";
import { EventFormRenderer } from "~/shared/components/forms/event-form-renderer";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { useFetcherForm } from "~/shared/hooks/use-fetcher-form.hook";
import { useSearchParamsManager } from "~/shared/hooks/use-search-params-manager";
import { EventCombobox } from "../../registrations/components/event-combobox";
import { registerAttendeeLoader } from "../api/loaders";
import { EmailLookup } from "../components/email-lookup";
import { RegisterAttendeeForm } from "../components/register-attendee-form";

export const loader = registerAttendeeLoader;

export default function RegisterAttendeeHandler() {
  const { events, selectedEvent, existingRegistration } =
    useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const { updateMultipleParams, getParamValue, resetAllParams } =
    useSearchParamsManager();

  const { fetcher, isSubmitting, errors, handleInputChange } = useFetcherForm({
    zodSchema: createGuestSchema,
  });

  // Check if the loader is fetching data
  const isLoading = navigation.state === "loading";

  const eventId = getParamValue("eventId");
  const selectedEmail = getParamValue("email");

  const handleEventSelect = useCallback(
    (eventId: string) => {
      updateMultipleParams({
        eventId,
        email: "",
      });
    },
    [updateMultipleParams]
  );

  const handleEmailSelect = useCallback(
    (email: string) => {
      updateMultipleParams({ email });
    },
    [updateMultipleParams]
  );

  const handleClearEvent = useCallback(() => {
    resetAllParams();
  }, [resetAllParams]);

  const handleClearEmail = useCallback(() => {
    updateMultipleParams({ email: "" });
  }, [updateMultipleParams]);

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-lg font-medium">Cargando...</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={isLoading ? "blur-sm pointer-events-none" : ""}>
        {!eventId || !selectedEvent ? (
          <div>
            <PageHeader
              title="Registrar asistente"
              description="Selecciona un evento para registrar un asistente"
            />

            <div className="mt-8">
              <EventCombobox
                events={events ?? []}
                selectedEventId={eventId || undefined}
                onEventSelect={handleEventSelect}
                searchKey="eventSearch"
              />
            </div>

            {events?.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">
                  No hay eventos disponibles
                </h3>
                <p className="text-muted-foreground mt-2">
                  Crea un nuevo evento para comenzar a registrar asistentes.
                </p>
                <Link to="/eventos/crear" className="mt-4 inline-block">
                  <Button>
                    <UserPlus className="size-4 mr-2" />
                    Crear evento
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : !selectedEmail ? (
          <div>
            <PageHeader
              title={`Registrar asistente para ${selectedEvent.name}`}
              description="Ingresa el correo electrónico del asistente para continuar"
              actions={
                <Button variant="outline" size="sm" onClick={handleClearEvent}>
                  Cambiar evento
                </Button>
              }
            />

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>
                  Ingresa el correo electrónico del asistente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EmailLookup
                  onEmailSelect={handleEmailSelect}
                  onClear={handleClearEmail}
                  selectedEmail={selectedEmail || undefined}
                  isSubmitting={isSubmitting}
                  label="Correo electrónico"
                />
              </CardContent>
            </Card>
          </div>
        ) : existingRegistration ? (
          <div>
            <PageHeader
              title={`Registro existente encontrado`}
              description={`El usuario ${selectedEmail} ya cuenta con invitación para ${selectedEvent.name}`}
              actions={
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearEmail}
                  >
                    Buscar otro email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearEvent}
                  >
                    Cambiar evento
                  </Button>
                </div>
              }
            />

            <Card className="mt-8">
              <CardHeader>
                <CardTitle>Información del registro existente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Usuario
                    </p>
                    <p className="text-sm">{existingRegistration.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Email
                    </p>
                    <p className="text-sm">{existingRegistration.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Estado
                    </p>
                    <p className="text-sm">{existingRegistration.status}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Fecha de registro
                    </p>
                    <p className="text-sm">
                      {existingRegistration.registeredAt
                        ? new Date(
                            existingRegistration.registeredAt
                          ).toLocaleDateString()
                        : "Pendiente"}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Este usuario ya tiene un registro para este evento. Si
                    necesitas actualizar la información, utiliza la función de
                    actualización de registros.
                  </p>

                  {(existingRegistration.status ===
                    RegistrationStatus.PENDING ||
                    existingRegistration.status ===
                      RegistrationStatus.REGISTERED) && (
                    <div className="mt-4">
                      <Button asChild className="w-full">
                        <Link
                          to={`/registrar-asistente?eventId=${selectedEvent.id}&email=${selectedEmail}&action=update`}
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Actualizar registro
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div>
            <PageHeader
              title={`Registrar asistente para ${selectedEvent.name}`}
              description={`Completando registro para: ${selectedEmail}`}
              actions={
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearEmail}
                  >
                    Cambiar email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearEvent}
                  >
                    Cambiar evento
                  </Button>
                </div>
              }
            />

            <fetcher.Form
              method="post"
              action={"/api/create-guest"}
              className="space-y-6"
            >
              {/* Hidden input for the selected email */}
              <input type="hidden" name="email" value={selectedEmail} />

              <Card>
                <CardHeader>
                  <CardTitle>Información del asistente</CardTitle>
                </CardHeader>
                <CardContent>
                  <RegisterAttendeeForm
                    handleInputChange={handleInputChange}
                    errors={errors}
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
                    />
                  </CardContent>
                </Card>
              )}
            </fetcher.Form>
          </div>
        )}
      </div>
    </div>
  );
}
