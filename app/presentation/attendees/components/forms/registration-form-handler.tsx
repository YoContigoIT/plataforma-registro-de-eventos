import { EventFormRenderer } from "@/shared/components/forms/event-form-renderer";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLoaderData } from "react-router";
import { createFormResponseSchema } from "~/domain/dtos/form-response.dto";
import { createUserSchema } from "~/domain/dtos/user.dto";
import { Stepper } from "~/shared/components/common/stepper";
import { Button } from "~/shared/components/ui/button";
import { useFetcherForm } from "~/shared/hooks/use-fetcher-form.hook";
import type { LoaderData } from "~/shared/types";
import type { InvitationData } from "../../api/loaders/get-invitation-data.loader";
import { EventDetailsPanel } from "./event-details-panel";
import { RegistrationForm } from "./registration-form";

const STEPS = [
  {
    id: "event-form",
    title: "Formulario del evento",
    description: "Completa la información específica del evento",
  },
  {
    id: "registration",
    title: "Registro",
    description: "Completa los detalles de tu registro",
  },
];

export function RegistrationFormHandler() {
  const loaderData = useLoaderData<LoaderData<InvitationData>>();
  const {
    event,
    user,
    registrationId,
    eventForm,
    hasResponse,
    formResponse: formAnswers,
    token,
  } = loaderData.data || {};
  const [showEventDetails, setShowEventDetails] = useState(true);
  const [currentStep, setCurrentStep] = useState(hasResponse ? 2 : 1);
  const [formResponseCompleted, setFormResponseCompleted] = useState(
    hasResponse || false
  );

  const hasEventForm =
    !!eventForm &&
    eventForm.isActive === true &&
    (eventForm.fields?.length ?? 0) > 0;

  const {
    fetcher: formResponseFetcher,
    isSubmitting: isFormResponseSubmitting,
    handleInputChange: handleFormResponseInput,
    isSuccess: formResponseSuccess,
    data: formResponseData,
  } = useFetcherForm({ zodSchema: createFormResponseSchema });

  const {
    fetcher: registrationFetcher,
    isSubmitting: isRegistrationSubmitting,
    handleInputChange: handleRegistrationInput,
  } = useFetcherForm({ zodSchema: createUserSchema });

  // biome-ignore lint/correctness/useExhaustiveDependencies: <not needed>
  useEffect(() => {
    if (formResponseSuccess) {
      setFormResponseCompleted(true);
      handleNextStep();
    }
  }, [formResponseSuccess, formResponseData]);

  const handleNextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!event) {
    return <div>Error: No se pudo cargar la información del evento</div>;
  }

  if (!hasEventForm) {
    return (
      <div className="max-w-7xl mx-auto bg-background rounded-2xl shadow-2xl overflow-hidden relative">
        <div className="flex flex-col md:flex-row relative">
          <EventDetailsPanel
            event={event}
            isVisible={showEventDetails}
            onToggle={() => setShowEventDetails(!showEventDetails)}
          />
          <div className="flex-1">
            <RegistrationForm
              event={event}
              user={user || null}
              fetcher={registrationFetcher}
              isSubmitting={isRegistrationSubmitting}
              inviteToken={token}
              handleInputChange={handleRegistrationInput}
            />
          </div>
        </div>
      </div>
    );
  }

  const action = hasResponse
    ? "/api/update-form-response"
    : "/api/form-response";

  return (
    <div className="max-w-7xl mx-auto bg-background rounded-2xl shadow-2xl overflow-hidden relative">
      <div className="flex flex-col md:flex-row relative">
        <EventDetailsPanel
          event={event}
          isVisible={showEventDetails}
          onToggle={() => setShowEventDetails(!showEventDetails)}
        />

        <div className="flex-1 p-6 flex flex-col">
          <div className="mb-8">
            <Stepper steps={STEPS} currentStep={currentStep} className="mb-6" />
          </div>

          <div className="flex-1 min-h-[400px]">
            {currentStep === 1 && (
              <div>
                {eventForm && (
                  <formResponseFetcher.Form method="post" action={action}>
                    <EventFormRenderer
                      eventForm={eventForm}
                      handleInputChange={handleFormResponseInput}
                      registrationId={registrationId || undefined}
                      defaultValues={formAnswers ?? undefined}
                      formResponseId={formAnswers?.id}
                      isUpdateForm={hasResponse}
                      isSubmitting={isFormResponseSubmitting}
                    />
                  </formResponseFetcher.Form>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <RegistrationForm
                  event={event}
                  user={user || null}
                  fetcher={registrationFetcher}
                  isSubmitting={isRegistrationSubmitting}
                  inviteToken={token}
                  handleInputChange={handleRegistrationInput}
                />
              </div>
            )}
          </div>

          {formResponseCompleted && (
            <div className="flex justify-between mt-6 pt-6 border-t">
              {currentStep > 1 && (
                <Button
                  onClick={handlePreviousStep}
                  disabled={isRegistrationSubmitting}
                  type="button"
                  variant="outline"
                  size="lg"
                >
                  Anterior
                </Button>
              )}

              {currentStep < STEPS.length && (
                <Button
                  onClick={handleNextStep}
                  disabled={
                    isFormResponseSubmitting ||
                    (currentStep === 1 && !formResponseCompleted)
                  }
                  type="button"
                  size="lg"
                >
                  {isFormResponseSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Siguiente"
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
