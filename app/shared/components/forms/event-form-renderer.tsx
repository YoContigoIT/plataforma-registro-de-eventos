import { Checkbox } from "@/ui/checkbox";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
// Remove Form import from react-router
// import { Form } from "react-router";
import type {
  EventFormWithFields,
  FormFieldEntity,
} from "~/domain/entities/event-form.entity";
import type { FormResponseAnswers } from "~/domain/entities/form-response.entity";
import { DateInput } from "~/shared/components/common/date-input";
import { NumberInput } from "~/shared/components/common/number-input";
import { PhoneInput } from "~/shared/components/common/phone-input";
import { RadioGroupInput } from "~/shared/components/common/radio-group-input";
import { SelectInput } from "~/shared/components/common/select-input";
import { TextInput } from "~/shared/components/common/text-input";
import { Button } from "~/shared/components/ui/button";

interface EventFormRendererProps {
  eventForm: EventFormWithFields;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  registrationId?: string;
  submitButtonText?: string;
  className?: string;
  defaultValues?: FormResponseAnswers;
  isUpdateForm?: boolean;
  formResponseId?: string; // Add this for update operations
  isSubmitting?: boolean;
}

export function EventFormRenderer({
  eventForm,
  handleInputChange,
  registrationId,
  submitButtonText = "Enviar",
  className,
  defaultValues,
  isUpdateForm = false,
  formResponseId,
  isSubmitting = false,
}: EventFormRendererProps) {
  const [checkboxSelections, setCheckboxSelections] = useState<
    Record<string, string[]>
  >({});

  // biome-ignore lint/correctness/useExhaustiveDependencies: <>
  useEffect(() => {
    const initialSelections: Record<string, string[]> = {};

    eventForm.fields.forEach((field) => {
      if (field.type === "CHECKBOX") {
        const defaultValue = getDefaultValue(field.id);
        if (defaultValue) {
          try {
            const parsed = JSON.parse(defaultValue);
            initialSelections[field.id] = Array.isArray(parsed)
              ? parsed
              : [defaultValue];
          } catch {
            initialSelections[field.id] = [defaultValue];
          }
        } else {
          initialSelections[field.id] = [];
        }
      }
    });

    setCheckboxSelections(initialSelections);
  }, [eventForm.fields, defaultValues]);

  const getDefaultValue = (fieldId: string): string => {
    if (!defaultValues?.fieldResponses) return "";

    const fieldResponse = defaultValues.fieldResponses.find(
      (response) => response.fieldId === fieldId
    );

    return fieldResponse?.value ? String(fieldResponse.value) : "";
  };

  const renderField = (field: FormFieldEntity) => {
    const fieldValidation = getFieldValidation(field);
    const fieldOptions = getFieldOptions(field);
    const defaultValue = getDefaultValue(field.id);

    switch (field.type) {
      case "TEXT":
        return (
          <TextInput
            id={field.id}
            name={`field_${field.id}`}
            label={field.label}
            defaultValue={defaultValue}
            required={field.required}
            placeholder={field.placeholder || undefined}
            onChange={handleInputChange}
            minLength={fieldValidation.minLength}
            maxLength={fieldValidation.maxLength}
          />
        );

      case "EMAIL":
        return (
          <TextInput
            id={field.id}
            name={`field_${field.id}`}
            label={field.label}
            defaultValue={defaultValue}
            required={field.required}
            placeholder={field.placeholder || undefined}
            type="email"
            onChange={handleInputChange}
          />
        );

      case "PHONE":
        return (
          <PhoneInput
            id={field.id}
            name={`field_${field.id}`}
            label={field.label}
            defaultValue={defaultValue}
            required={field.required}
            placeholder={field.placeholder || undefined}
            onChange={handleInputChange}
          />
        );

      case "NUMBER":
        return (
          <NumberInput
            id={field.id}
            name={`field_${field.id}`}
            label={field.label}
            value={defaultValue ? Number(defaultValue) : undefined}
            required={field.required}
            placeholder={field.placeholder || undefined}
            onChange={(value) => {
              handleInputChange({
                target: {
                  name: `field_${field.id}`,
                  value: value?.toString() || "",
                },
              } as React.ChangeEvent<HTMLInputElement>);
            }}
            min={fieldValidation.min}
            max={fieldValidation.max}
          />
        );

      case "TEXTAREA":
        return (
          <div className="space-y-2">
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.id}
              name={`field_${field.id}`}
              defaultValue={defaultValue}
              placeholder={field.placeholder || undefined}
              required={field.required}
              onChange={handleInputChange}
              minLength={fieldValidation.minLength}
              maxLength={fieldValidation.maxLength}
            />
          </div>
        );

      case "SELECT":
        return (
          <SelectInput
            id={field.id}
            name={`field_${field.id}`}
            label={field.label}
            defaultValue={defaultValue}
            required={field.required}
            placeholder={field.placeholder || undefined}
            options={fieldOptions.map((option) => ({
              value: option,
              label: option,
            }))}
            onValueChange={(value) => {
              handleInputChange({
                target: { name: `field_${field.id}`, value },
              } as React.ChangeEvent<HTMLInputElement>);
            }}
          />
        );

      case "RADIO":
        return (
          <RadioGroupInput
            id={field.id}
            name={`field_${field.id}`}
            label={field.label}
            defaultValue={defaultValue}
            required={field.required}
            options={fieldOptions.map((option) => ({
              value: option,
              label: option,
            }))}
            onValueChange={(value) => {
              handleInputChange({
                target: { name: `field_${field.id}`, value },
              } as React.ChangeEvent<HTMLInputElement>);
            }}
          />
        );

      case "CHECKBOX": {
        const selectedOptions = checkboxSelections[field.id] || [];

        return (
          <div className="space-y-2">
            <Label>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {field.placeholder && (
              <p className="text-sm text-muted-foreground">
                {field.placeholder}
              </p>
            )}
            <div className="space-y-3">
              {fieldOptions.map((option, index) => (
                <div
                  key={`${field.id}-${index}`}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`${field.id}-${index}`}
                    value={option}
                    checked={selectedOptions.includes(option)}
                    onCheckedChange={(checked) => {
                      const newSelections = checked
                        ? [...selectedOptions, option]
                        : selectedOptions.filter((item) => item !== option);

                      setCheckboxSelections((prev) => ({
                        ...prev,
                        [field.id]: newSelections,
                      }));

                      handleInputChange({
                        target: {
                          name: `field_${field.id}`,
                          value: JSON.stringify(newSelections),
                        },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                  />
                  <Label
                    htmlFor={`${field.id}-${index}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
            <input
              type="hidden"
              name={`field_${field.id}`}
              value={JSON.stringify(selectedOptions)}
            />
          </div>
        );
      }

      case "DATE":
        return (
          <DateInput
            id={field.id}
            name={`field_${field.id}`}
            label={field.label}
            value={defaultValue ? new Date(defaultValue) : undefined}
            required={field.required}
            placeholder={field.placeholder || undefined}
            onChange={(date) => {
              handleInputChange({
                target: {
                  name: `field_${field.id}`,
                  value: date?.toISOString() || "",
                },
              } as React.ChangeEvent<HTMLInputElement>);
            }}
          />
        );

      default:
        return (
          <TextInput
            id={field.id}
            name={`field_${field.id}`}
            label={field.label}
            defaultValue={defaultValue}
            required={field.required}
            placeholder={field.placeholder || undefined}
            onChange={handleInputChange}
          />
        );
    }
  };

  const sortedFields = [...eventForm.fields].sort((a, b) => a.order - b.order);

  return (
    <div className={className}>
      <div className="space-y-6">
        <div className="space-y-4">
          {sortedFields.map((field) => (
            <div key={field.id}>{renderField(field)}</div>
          ))}
        </div>

        <input type="hidden" name="registrationId" value={registrationId} />
        {isUpdateForm && formResponseId && (
          <input type="hidden" name="formResponseId" value={formResponseId} />
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isUpdateForm ? "Actualizando..." : "Enviando..."}
            </>
          ) : isUpdateForm ? (
            "Actualizar"
          ) : (
            submitButtonText
          )}
        </Button>
      </div>
    </div>
  );
}

// Helper functions
function getFieldValidation(field: FormFieldEntity): Record<string, any> {
  return field.validation &&
    typeof field.validation === "object" &&
    !Array.isArray(field.validation)
    ? (field.validation as Record<string, any>)
    : {};
}

function getFieldOptions(field: FormFieldEntity): string[] {
  return Array.isArray(field.options) ? field.options.map(String) : [];
}
