import { useState, useEffect } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import { Stepper } from "~/shared/components/common/stepper";
import { Button } from "~/shared/components/ui/button";
import { useRegistrationForm } from "../../hooks/useRegistrationForm";
import { EventDetailsPanel } from "./event-details-panel";
import { EventFormRenderer } from "./event-form-renderer";
import { RegistrationConfirm } from "./registration-confirm";
import { RegistrationForm } from "./registration-form";

export function RegistrationFormHandler() {
  const {
    isSubmitting,
    errors,
    handleInputChange,
    isLoading,
    event,
    user,
    showSuccess,
    eventForm,
    registrationId,
  } = useRegistrationForm();

  const [showEventDetails, setShowEventDetails] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [formResponseCompleted, setFormResponseCompleted] = useState(false);
  
  // Fetcher for form response submission
  const formResponseFetcher = useFetcher();
  const registrationFetcher = useFetcher();

  // Define the steps for the stepper
  const steps = [
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

  // Handle form response submission result
  useEffect(() => {
    if (formResponseFetcher.state === "idle" && formResponseFetcher.data) {
      if (formResponseFetcher.data.success) {
        toast.success(
          formResponseFetcher.data.message || "Formulario enviado exitosamente"
        );
        setFormResponseCompleted(true);
        handleNextStep();
      } else {
        toast.error(
          formResponseFetcher.data.error || "Error al enviar el formulario"
        );
      }
    }
  }, [formResponseFetcher.state, formResponseFetcher.data]);

  // Handle registration submission result
  useEffect(() => {
    if (registrationFetcher.state === "idle" && registrationFetcher.data) {
      if (registrationFetcher.data.success) {
        toast.success(
          registrationFetcher.data.message || "Registro completado exitosamente"
        );
      } else {
        toast.error(
          registrationFetcher.data.error || "Error al completar el registro"
        );
      }
    }
  }, [registrationFetcher.state, registrationFetcher.data]);

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form response submission
  const handleFormResponseSubmit = (formData: Record<string, any>) => {
    const submitData = new FormData();
    submitData.append("registrationId", registrationId);
    
    // Add field responses
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(`field_${key}`, value as string);
    });

    formResponseFetcher.submit(submitData, {
      method: "post",
      action: "/api/form-response",
    });
  };

  if (showSuccess) {
    return <RegistrationConfirm />;
  }

  const isFormResponseSubmitting = formResponseFetcher.state === "submitting";
  const isRegistrationSubmitting = registrationFetcher.state === "submitting";

  return (
    <div className="max-w-7xl mx-auto bg-card rounded-2xl shadow-2xl overflow-hidden relative">
      <div className="flex flex-col md:flex-row relative">
        <EventDetailsPanel
          event={event}
          isVisible={showEventDetails}
          onToggle={() => setShowEventDetails(!showEventDetails)}
        />

        <div className="flex-1 p-6">
          {/* Stepper Component */}
          <div className="mb-8">
            <Stepper steps={steps} currentStep={currentStep} className="mb-6" />
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {currentStep === 1 && (
              <div>
                <EventFormRenderer
                  eventForm={eventForm}
                  registrationId={registrationId}
                  onFormSubmit={handleFormResponseSubmit}
                />
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={handleNextStep}
                    disabled={isLoading || !formResponseCompleted}
                    type="button"
                    size="lg"
                  >
                    {isFormResponseSubmitting ? "Enviando..." : "Siguiente"}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <RegistrationForm
                  event={event}
                  user={user}
                  isSubmitting={isRegistrationSubmitting}
                  isLoading={isLoading}
                  errors={errors}
                  handleInputChange={handleInputChange}
                  showEventDetails={showEventDetails}
                />
                <div className="flex justify-between mt-6">
                  <Button
                    onClick={handlePreviousStep}
                    disabled={isLoading}
                    type="button"
                    variant="outline"
                    size="lg"
                  >
                    Anterior
                  </Button>
                  {/* The submit button should be handled within RegistrationForm component */}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
