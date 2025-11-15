import { useCallback } from "react";
import { useLoaderData } from "react-router";
import { createGuestSchema } from "~/domain/dtos/user.dto";
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

export default function CreateRegistrationHandler() {
  const { events, selectedEvent, existingRegistration } =
    useLoaderData<typeof loader>();

  const { updateMultipleParams, getParamValue, resetAllParams } =
    useSearchParamsManager();
  const { fetcher, isSubmitting, errors, handleInputChange } = useFetcherForm({
    zodSchema: createGuestSchema,
  });

  const eventId = getParamValue("eventId");
  const selectedEmail = getParamValue("email");

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
          title="Registrar asistente"
          description="Selecciona un evento para registrar un asistente"
        />
      ) : !selectedEmail ? (
        <EmailInputStep
          selectedEvent={selectedEvent}
          selectedEmail={selectedEmail || undefined}
          onEmailSelect={handleEmailSelect}
          onClearEmail={handleClearEmail}
          onClearEvent={handleClearEvent}
          isSubmitting={isSubmitting}
          title={`Registrar asistente para ${selectedEvent.name}`}
          description="Ingresa el correo electrónico del asistente para continuar"
        />
      ) : existingRegistration ? (
        <div>
          <div className="mb-8">
            <RegistrationActions
              registration={existingRegistration}
              onClearEmail={handleClearEmail}
              onClearEvent={handleClearEvent}
              actionType="update"
            />
          </div>
          <RegistrationInfoCard
            selectedEvent={selectedEvent}
            selectedEmail={selectedEmail}
            registration={existingRegistration}
            actionType="update"
          />
        </div>
      ) : (
        <RegistrationFormStep
          selectedEvent={selectedEvent}
          selectedEmail={selectedEmail}
          fetcher={fetcher}
          isSubmitting={isSubmitting}
          errors={errors}
          handleInputChange={handleInputChange}
          onClearEmail={handleClearEmail}
          onClearEvent={handleClearEvent}
          actionUrl="/api/create-registration"
        />
      )}
    </RegistrationLayout>
  );
}
