import { EventFormRenderer } from "@/shared/components/forms/event-form-renderer";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { toast } from "sonner";
import { createFormResponseSchema } from "~/domain/dtos/form-response.dto";
import { Stepper } from "~/shared/components/common/stepper";
import { Button } from "~/shared/components/ui/button";
import { useFormAction } from "~/shared/hooks/use-form-action.hook";
import type { LoaderData } from "~/shared/types";
import type { InvitationData } from "../../api/get-invitation-data.loader";
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
    inviteToken,
  } = loaderData.data || {};
  const [showEventDetails, setShowEventDetails] = useState(true);
  const [currentStep, setCurrentStep] = useState(hasResponse ? 2 : 1);
  const [formResponseCompleted, setFormResponseCompleted] = useState(
    hasResponse || false
  );

  const formResponseFetcher = useFetcher();
  const registrationFetcher = useFetcher();

  const { handleInputChange } = useFormAction({
    zodSchema: createFormResponseSchema,
  });

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
                      handleInputChange={handleInputChange}
                      registrationId={registrationId}
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
