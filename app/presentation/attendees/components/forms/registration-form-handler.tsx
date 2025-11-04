import { EventFormRenderer } from "@/shared/components/forms/event-form-renderer";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLoaderData } from "react-router";
import { toast } from "sonner";
import { createFormResponseSchema } from "~/domain/dtos/form-response.dto";
import { createUserSchema } from "~/domain/dtos/user.dto";
import { Stepper } from "~/shared/components/common/stepper";
import { Button } from "~/shared/components/ui/button";
import { useFetcherForm } from "~/shared/hooks/use-fetcher-form.hook";
import type { LoaderData } from "~/shared/types";
import type { InvitationData } from "../../api/loaders/get-invitation-data.loader";
import { EventDetailsPanel } from "./event-details-panel";
import { RegistrationForm } from "./registration-form";

// Top-level: reordenar STEPS para que Registro sea primero
const STEPS = [
  {
    id: "registration",
    title: "Registro",
    description: "Completa los detalles de tu registro",
  },
  {
    id: "event-form",
    title: "Formulario del evento",
    description: "Completa la información específica del evento",
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
  const [currentStep, setCurrentStep] = useState(1);
  const [_formResponseCompleted, setFormResponseCompleted] = useState(
    hasResponse || false,
  );
  const [_registrationCompleted, setRegistrationCompleted] = useState(false);

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
    isSuccess: registrationSuccess,
    data: registrationData,
  } = useFetcherForm({ zodSchema: createUserSchema });

  const [resolvedRegistrationId, setResolvedRegistrationId] = useState<
    string | null
  >(registrationId ?? null);

  // useRef para el formulario del evento
  const eventFormRef = useRef<HTMLFormElement>(null);

  // Estado de orquestación
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [pendingEventFormData, setPendingEventFormData] =
    useState<FormData | null>(null);

  // Fases de orquestación para UX
  type OrchestrationPhase =
    | "idle"
    | "creating-attendee"
    | "saving-form-response"
    | "completed"
    | "error";
  const [orchestrationPhase, setOrchestrationPhase] =
    useState<OrchestrationPhase>("idle");

  // Estado local del formulario de registro
  type RegistrationFormState = {
    name: string;
    email: string;
    phone?: string;
    quantity: number;
  };

  const [registrationFormData, setRegistrationFormData] =
    useState<RegistrationFormState>({
      name: user?.name ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? undefined, // permite undefined
      quantity: (event?.maxTickets ?? 1) === 1 ? 1 : 0,
    });

  // Errores de validación local
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({});

  // Feedback visual en validación local
  const [isValidating, setIsValidating] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <not needed>
  useEffect(() => {
    if (formResponseSuccess) {
      setFormResponseCompleted(true);
      handleNextStep();
    }
  }, [formResponseSuccess, formResponseData]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <not needed>
  useEffect(() => {
    if (!registrationSuccess && isOrchestrating) {
      // Verificar si hubo error en create-attendee cuando estamos orquestando
      if ((registrationData as any)?.success === false) {
        setOrchestrationPhase("error");
        setIsOrchestrating(false);
        setPendingEventFormData(null);
        toast.error(
          "Error al crear el registro. Por favor, intenta nuevamente.",
        );
        return;
      }
    }

    if (registrationSuccess) {
      const newId =
        (registrationData?.data as { registrationId?: string })
          ?.registrationId ??
        registrationId ??
        null;
      setResolvedRegistrationId(newId);
      setRegistrationCompleted(true);

      // Lógica de orquestación: si estamos orquestando y en paso 2
      if (isOrchestrating && currentStep === 2) {
        // Capturar el registrationId
        const registrationId = newId;
        if (registrationId && pendingEventFormData) {
          // Agregar el registrationId al FormData del evento
          pendingEventFormData.set("registrationId", registrationId);

          // Actualizar fase y mostrar feedback
          setOrchestrationPhase("saving-form-response");
          toast.info("Guardando formulario del evento...");

          // Ejecutar la acción de form-response
          const action = hasResponse
            ? "/api/update-form-response"
            : "/api/form-response";
          formResponseFetcher.submit(pendingEventFormData, {
            method: "post",
            action,
          });

          // Limpiar estados de orquestación
          setIsOrchestrating(false);
          setPendingEventFormData(null);
        }
        // NO llamar handleNextStep() aquí porque ya estamos en el último paso
        return;
      }

      // Lógica existente para el caso sin formulario de evento
      const isNoEventForm = !hasEventForm;
      const isOnStep2 = currentStep === 2;

      // Evitar avanzar automáticamente en paso 1 cuando hay formulario de evento
      if (!isNoEventForm && !isOnStep2) {
        return;
      }

      handleNextStep();
    }
  }, [
    registrationSuccess,
    registrationData,
    isOrchestrating,
    currentStep,
    pendingEventFormData,
    hasResponse,
    formResponseFetcher,
    hasEventForm,
  ]);

  // Detectar errores o éxito en formResponseFetcher durante la orquestación
  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  useEffect(() => {
    if (orchestrationPhase === "saving-form-response") {
      if (formResponseFetcher.state === "idle") {
        if (formResponseData?.success === false) {
          setOrchestrationPhase("error");
          setIsOrchestrating(false);
          toast.error(
            "Error al guardar el formulario del evento. Por favor, contacta al organizador.",
          );
        } else if (formResponseData?.success === true) {
          setOrchestrationPhase("completed");
        }
      }
    }
  }, [
    formResponseFetcher.state,
    formResponseData,
    isOrchestrating,
    orchestrationPhase,
  ]);

  useEffect(() => {
    if (orchestrationPhase === "creating-attendee" && isOrchestrating) {
      // Cuando el fetcher termina, verificamos si hubo error
      if (registrationFetcher.state === "idle") {
        const wasSuccess = Boolean(registrationSuccess);
        const apiSaysSuccess = (registrationData as any)?.success === true;

        if (!wasSuccess || !apiSaysSuccess) {
          setOrchestrationPhase("error");
          setIsOrchestrating(false);
          setPendingEventFormData(null);
          toast.error(
            "Error al crear el registro. Por favor, intenta nuevamente.",
          );
        }
      }
    }
  }, [
    registrationFetcher.state,
    registrationSuccess,
    registrationData,
    orchestrationPhase,
    isOrchestrating,
  ]);

  // Toast de éxito al completar la orquestación
  useEffect(() => {
    if (orchestrationPhase === "completed") {
      toast.success("¡Registro completado exitosamente!");
    }
  }, [orchestrationPhase]);

  // Timeout de seguridad si la orquestación se queda colgada
  useEffect(() => {
    if (!isOrchestrating) return;
    const timeout = setTimeout(() => {
      setIsOrchestrating(false);
      setOrchestrationPhase("error");
      setPendingEventFormData(null);
      toast.error(
        "El proceso está tardando más de lo esperado. Por favor, intenta nuevamente.",
      );
    }, 30_000);
    return () => clearTimeout(timeout);
  }, [isOrchestrating]);

  const validateRegistrationFormLocally = (): {
    isValid: boolean;
    errors: Record<string, string[]>;
  } => {
    const errors: Record<string, string[]> = {};

    const result = createUserSchema.safeParse({
      email: registrationFormData.email,
      name: registrationFormData.name,
      phone: registrationFormData.phone,
    });

    if (!result.success) {
      const flattened = result.error.flatten();
      Object.entries(flattened.fieldErrors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          errors[field] = messages;
        }
      });
    }

    const maxTickets = event?.maxTickets ?? 1;
    const qtyErrors: string[] = [];
    if (registrationFormData.quantity < 1) {
      qtyErrors.push("Debes seleccionar al menos 1 pase.");
    }
    if (maxTickets > 0 && registrationFormData.quantity > maxTickets) {
      qtyErrors.push(`No puedes seleccionar más de ${maxTickets} pase(s).`);
    }
    if (qtyErrors.length > 0) {
      errors.quantity = qtyErrors;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  };

  // Validación local del formulario de evento para campos obligatorios
  const validateEventFormRequiredFields = (): {
    isValid: boolean;
    missingFields: string[];
  } => {
    if (!eventFormRef.current || !eventForm)
      return { isValid: true, missingFields: [] };
    const fd = new FormData(eventFormRef.current);
    const missing: string[] = [];

    eventForm.fields.forEach((field) => {
      if (!field.required) return;
      const name = `field_${field.id}`;
      const raw = fd.get(name);

      if (field.type === "CHECKBOX") {
        try {
          const arr = JSON.parse(String(raw ?? "[]"));
          if (!Array.isArray(arr) || arr.length === 0) {
            missing.push(field.label || name);
          }
        } catch {
          missing.push(field.label || name);
        }
      } else {
        const value = String(raw ?? "");
        if (!value || value.trim() === "") {
          missing.push(field.label || name);
        }
      }
    });

    return { isValid: missing.length === 0, missingFields: missing };
  };

  const handleNextStep = useCallback(() => {
    setCurrentStep((prev) => (prev < STEPS.length ? prev + 1 : prev));
  }, []);

  const handlePreviousStep = useCallback(() => {
    setCurrentStep((prev) => (prev > 1 ? prev - 1 : prev));
    setValidationErrors({});
    // Reset de orquestación al retroceder
    setOrchestrationPhase("idle");
    setIsOrchestrating(false);
    setPendingEventFormData(null);
  }, []);

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
              showSubmitButton={true}
              formId="registration-form"
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
                <RegistrationForm
                  event={event}
                  user={user || null}
                  fetcher={registrationFetcher}
                  isSubmitting={isRegistrationSubmitting}
                  inviteToken={token}
                  handleInputChange={handleRegistrationInput}
                  showSubmitButton={false}
                  formId="registration-form"
                  preservedData={registrationFormData}
                  validationErrors={validationErrors}
                  onDataChange={(data) => setRegistrationFormData(data)}
                />
              </div>
            )}
            {currentStep === 2 && (
              <div>
                {/* Indicador visual de progreso durante la orquestación */}
                {/* {isOrchestrating && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm text-blue-700">
                      {orchestrationPhase === "creating-attendee"
                        ? "📝 Creando tu registro..."
                        : orchestrationPhase === "saving-form-response"
                          ? "💾 Guardando formulario del evento..."
                          : "Procesando..."}
                    </span>
                  </div>
                )} */}

                {eventForm && (
                  // biome-ignore lint/correctness/useUniqueElementIds: <>
                  <formResponseFetcher.Form
                    method="post"
                    action={action}
                    ref={eventFormRef}
                    id="event-form-response-form"
                  >
                    <EventFormRenderer
                      eventForm={eventForm}
                      handleInputChange={handleFormResponseInput}
                      registrationId={resolvedRegistrationId ?? undefined}
                      defaultValues={formAnswers ?? undefined}
                      formResponseId={formAnswers?.id}
                      isUpdateForm={hasResponse}
                      isSubmitting={isFormResponseSubmitting}
                      renderSubmitButton={false}
                      submitButtonText="Registrarme"
                    />
                  </formResponseFetcher.Form>
                )}
              </div>
            )}
          </div>
          <div className="flex justify-between mt-6 pt-6 border-t">
            {currentStep > 1 && (
              <Button
                onClick={handlePreviousStep}
                disabled={
                  isRegistrationSubmitting ||
                  isFormResponseSubmitting ||
                  isOrchestrating
                }
                type="button"
                variant="outline"
                size="lg"
              >
                Anterior
              </Button>
            )}
            <Button
              onClick={() => {
                if (currentStep === 1) {
                  if (hasEventForm) {
                    setIsValidating(true);
                    const { isValid, errors } =
                      validateRegistrationFormLocally();
                    setIsValidating(false);

                    if (isValid) {
                      setValidationErrors({});
                      handleNextStep();
                    } else {
                      setValidationErrors(errors);
                      toast.error(
                        "Por favor, corrige los errores antes de continuar.",
                      );
                    }
                  } else {
                    const formEl = document.getElementById(
                      "registration-form",
                    ) as HTMLFormElement | null;
                    formEl?.requestSubmit();
                  }
                } else {
                  // Paso 2: Validar campos obligatorios del formulario del evento antes de orquestar
                  if (eventFormRef.current) {
                    // Validación nativa del navegador (requeridos, etc.)
                    if (!eventFormRef.current.checkValidity()) {
                      // Muestra mensajes de validación nativos
                      eventFormRef.current.reportValidity();
                      toast.error(
                        "Completa los campos obligatorios del formulario del evento.",
                      );
                      return;
                    }

                    // Validación local para controles personalizados y CHECKBOX
                    const { isValid /*, missingFields*/ } =
                      validateEventFormRequiredFields();
                    if (!isValid) {
                      toast.error(
                        "Completa los campos obligatorios del formulario del evento.",
                      );
                      return;
                    }

                    // Crear FormData desde el form del evento
                    const eventFormData = new FormData(eventFormRef.current);

                    // Actualizar fase e informar al usuario
                    setOrchestrationPhase("creating-attendee");
                    toast.info("Creando tu registro...");

                    // Guardar FormData del evento en el estado
                    setPendingEventFormData(eventFormData);

                    // Activar modo orquestación
                    setIsOrchestrating(true);

                    // Crear FormData para el registro con los datos locales
                    const registrationData = new FormData();
                    registrationData.set("name", registrationFormData.name);
                    registrationData.set("email", registrationFormData.email);
                    registrationData.set(
                      "phone",
                      registrationFormData.phone ?? "",
                    );
                    registrationData.set(
                      "quantity",
                      registrationFormData.quantity.toString(),
                    );

                    // Ejecutar create-attendee primero
                    registrationFetcher.submit(registrationData, {
                      method: "post",
                      action: `/api/create-attendee/${token}`,
                    });
                  }
                }
              }}
              disabled={
                (currentStep === 1 &&
                  (isRegistrationSubmitting || isValidating)) ||
                (currentStep === 2 &&
                  (isFormResponseSubmitting ||
                    isOrchestrating ||
                    orchestrationPhase === "creating-attendee" ||
                    orchestrationPhase === "saving-form-response"))
              }
              type="button"
              size="lg"
            >
              {(currentStep === 1 &&
                (isRegistrationSubmitting || isValidating)) ||
              (currentStep === 2 &&
                (isFormResponseSubmitting ||
                  isOrchestrating ||
                  orchestrationPhase === "creating-attendee" ||
                  orchestrationPhase === "saving-form-response")) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {currentStep === 1
                    ? isValidating
                      ? "Validando..."
                      : "Confirmando registro..."
                    : orchestrationPhase === "creating-attendee"
                      ? "Creando registro..."
                      : orchestrationPhase === "saving-form-response"
                        ? "Guardando formulario..."
                        : "Enviando..."}
                </>
              ) : currentStep === 1 ? (
                "Siguiente"
              ) : (
                "Registrarme"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
