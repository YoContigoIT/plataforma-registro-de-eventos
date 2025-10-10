import { UserPlus } from "lucide-react";
import { useCallback } from "react";
import { Link, useLoaderData } from "react-router";
import { createGuestSchema } from "~/domain/dtos/user.dto";
import { Button } from "~/shared/components/ui/button";
import { useFetcherForm } from "~/shared/hooks/use-fetcher-form.hook";
import { useSearchParamsManager } from "~/shared/hooks/use-search-params-manager";
import { registerAttendeeLoader } from "../api/loaders/register-attendee.loader";
import { EmailInputStep } from "../components/steps/email-input-step";
import { EventSelectionStep } from "../components/steps/event-selection-step";
import { RegistrationFormStep } from "../components/steps/registration-form-step";
import { RegistrationActions } from "../components/ui/registration-actions";
import { RegistrationInfoCard } from "../components/ui/registration-info-card";
import { RegistrationLayout } from "../components/ui/registration-layout";

export const loader = registerAttendeeLoader;

export default function UpdateRegistrationHandler() {
  const { events, selectedEvent, existingRegistration } =
    useLoaderData<typeof loader>();
  const { updateMultipleParams, getParamValue, resetAllParams } =
    useSearchParamsManager();
  const { fetcher, isSubmitting, errors, handleInputChange } = useFetcherForm({
    zodSchema: createGuestSchema,
  });

  const eventId = getParamValue("eventId");
  const selectedEmail = getParamValue("email");
  const action = getParamValue("action");

  const handleEventSelect = useCallback(
    (eventId: string) => {
      updateMultipleParams({ eventId, email: "" });
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
    <RegistrationLayout>
      {!eventId || !selectedEvent ? (
        <EventSelectionStep
          events={events ?? []}
          selectedEventId={eventId || undefined}
          onEventSelect={handleEventSelect}
          title="Actualizar registro"
          description="Selecciona un evento para actualizar un registro"
        />
      ) : !selectedEmail ? (
        <EmailInputStep
          selectedEvent={selectedEvent}
          selectedEmail={selectedEmail || undefined}
          onEmailSelect={handleEmailSelect}
          onClearEmail={handleClearEmail}
          onClearEvent={handleClearEvent}
          isSubmitting={isSubmitting}
          title={`Actualizar registro para ${selectedEvent.name}`}
          description="Ingresa el correo electrónico del registro a actualizar"
        />
      ) : existingRegistration ? (
        action === "update" ? (
          <RegistrationFormStep
            defaultValues={existingRegistration}
            selectedEvent={selectedEvent}
            selectedEmail={selectedEmail}
            fetcher={fetcher}
            isSubmitting={isSubmitting}
            errors={errors}
            handleInputChange={handleInputChange}
            onClearEmail={handleClearEmail}
            onClearEvent={handleClearEvent}
            actionUrl="/api/update-registration"
            title={`Actualizar registro para ${selectedEvent.name}`}
            description={`Actualizando registro de: ${selectedEmail}`}
          />
        ) : (
          <div>
            <div className="mb-8">
              <RegistrationActions
                onClearEmail={handleClearEmail}
                onClearEvent={handleClearEvent}
                actionType="update"
              />
            </div>
            <RegistrationInfoCard
              registration={existingRegistration}
              selectedEvent={selectedEvent}
              selectedEmail={selectedEmail}
              alertMessage="Registro encontrado. Puedes continuar con la actualización de la información."
              actionType="update"
            />
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">No se encontró registro</h3>
          <p className="text-muted-foreground mt-2">
            No existe un registro para este email en el evento seleccionado.
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-8">
            <RegistrationActions
              onClearEmail={handleClearEmail}
              onClearEvent={handleClearEvent}
              actionType="update"
            />

            <div className="mt-4">
              <p className="text-muted-foreground mb-2">
                Tambien puedes crear un registro para este email.
              </p>
              <Button variant="default" asChild>
                <Link
                  to={`/crear-registro?eventId=${eventId}&email=${selectedEmail}`}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Crear registro
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </RegistrationLayout>
  );
}
