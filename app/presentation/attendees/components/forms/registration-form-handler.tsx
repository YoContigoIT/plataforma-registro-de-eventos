import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { toast } from "sonner";
import { Stepper } from "~/shared/components/common/stepper";
import { Button } from "~/shared/components/ui/button";
import type { LoaderData } from "~/shared/types";
import type { InvitationData } from "../../api/get-invitation-data.loader";
import { EventDetailsPanel } from "./event-details-panel";
import { EventFormRenderer } from "./event-form-renderer";
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
    inviteToken,
  } = loaderData.data || {};
  const [showEventDetails, setShowEventDetails] = useState(true);
  const [currentStep, setCurrentStep] = useState(hasResponse ? 2 : 1);
  const [formResponseCompleted, setFormResponseCompleted] = useState(
    hasResponse || false
  );

  const formResponseFetcher = useFetcher();
  const registrationFetcher = useFetcher();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <not needed>
  useEffect(() => {
    if (formResponseFetcher.state === "idle" && formResponseFetcher.data) {
      if (formResponseFetcher.data.success) {
        setFormResponseCompleted(true);
        handleNextStep();
      } else if (formResponseFetcher.data.error) {
        toast.error(formResponseFetcher.data.error);
      }
    }
  }, [formResponseFetcher.state, formResponseFetcher.data]);

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

  const isFormResponseSubmitting = formResponseFetcher.state === "submitting";
  const isRegistrationSubmitting = registrationFetcher.state === "submitting";

  if (!event || !user || !registrationId || !eventForm) {
    return <div>Error: No se pudo cargar la información del evento</div>;
  }

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
                  <EventFormRenderer
                    eventForm={eventForm}
                    registrationId={registrationId}
                    fetcher={formResponseFetcher}
                    defaultValues={formAnswers ?? undefined}
                    isUpdateForm={hasResponse}
                    formResponseId={formAnswers?.id}
                  />
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <RegistrationForm
                  event={event}
                  user={user}
                  fetcher={registrationFetcher}
                  inviteToken={inviteToken}
                />
              </div>
            )}
          </div>

          {formResponseCompleted && (
            <div className="flex justify-between mt-6 pt-6 border-t">
              {currentStep > 1 ? (
                <Button
                  onClick={handlePreviousStep}
                  disabled={isRegistrationSubmitting}
                  type="button"
                  variant="outline"
                  size="lg"
                >
                  Anterior
                </Button>
              ) : (
                <div />
              )}

              {currentStep < STEPS.length ? (
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
              ) : (
                <div />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
