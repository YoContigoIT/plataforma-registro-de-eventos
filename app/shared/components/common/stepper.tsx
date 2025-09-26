import { Check } from "lucide-react";
import { cn } from "~/shared/lib/utils";

interface Step {
  id: string;
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      <nav aria-label="Progress">
        <ol className="flex items-center justify-center space-x-4 md:space-x-8">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;
            const isUpcoming = stepNumber > currentStep;

            return (
              <li key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                      {
                        "border-primary bg-primary text-white": isCompleted,
                        "border-primary bg-white text-primary ring-4 ring-primary/20": isCurrent,
                        "border-gray-300 bg-white text-gray-500": isUpcoming,
                      }
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span>{stepNumber}</span>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="mt-2 text-center">
                    <div
                      className={cn(
                        "text-sm font-medium transition-colors",
                        {
                          "text-primary": isCompleted || isCurrent,
                          "text-gray-500": isUpcoming,
                        }
                      )}
                    >
                      {step.title}
                    </div>
                    {step.description && (
                      <div
                        className={cn(
                          "text-xs transition-colors",
                          {
                            "text-gray-600": isCompleted || isCurrent,
                            "text-gray-400": isUpcoming,
                          }
                        )}
                      >
                        {step.description}
                      </div>
                    )}
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "ml-4 h-0.5 w-12 transition-colors md:w-20",
                      {
                        "bg-primary": stepNumber < currentStep,
                        "bg-gray-300": stepNumber >= currentStep,
                      }
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}