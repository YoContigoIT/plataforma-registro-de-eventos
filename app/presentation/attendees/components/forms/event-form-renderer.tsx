import { Button } from "@/ui/button";
import { Checkbox } from "@/ui/checkbox";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
// Remove Form import from react-router
// import { Form } from "react-router";
import { createFormResponseSchema } from "~/domain/dtos/form-response.dto";
import type {
  EventFormWithFields,
  FormFieldEntity,
} from "~/domain/entities/event-form.entity";
import { DateInput } from "~/shared/components/common/date-input";
import { NumberInput } from "~/shared/components/common/number-input";
import { PhoneInput } from "~/shared/components/common/phone-input";
import { RadioGroupInput } from "~/shared/components/common/radio-group-input";
import { SelectInput } from "~/shared/components/common/select-input";
import { TextInput } from "~/shared/components/common/text-input";
import { useFormAction } from "~/shared/hooks/use-form-action.hook";

interface EventFormRendererProps {
  eventForm: EventFormWithFields;
  registrationId: string;
  submitButtonText?: string;
  className?: string;
  onFormSubmit?: (formData: Record<string, any>) => void;
}

export function EventFormRenderer({
  eventForm,
  registrationId,
  submitButtonText = "Enviar",
  className,
  onFormSubmit,
}: EventFormRendererProps) {
  const { isSubmitting, handleInputChange } = useFormAction({
    zodSchema: createFormResponseSchema,
  });

  const renderField = (field: FormFieldEntity) => {
    const fieldValidation = getFieldValidation(field);
    const fieldOptions = getFieldOptions(field);

    switch (field.type) {
      case "TEXT":
        return (
          <TextInput
            id={field.id}
            name={`field_${field.id}`}
            label={field.label}
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

      case "CHECKBOX":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field.id}
              name={`field_${field.id}`}
              onCheckedChange={(checked) => {
                handleInputChange({
                  target: {
                    name: `field_${field.id}`,
                    value: checked ? "true" : "false",
                  },
                } as React.ChangeEvent<HTMLInputElement>);
              }}
            />
            <Label htmlFor={field.id}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        );

      case "DATE":
        return (
          <DateInput
            id={field.id}
            name={`field_${field.id}`}
            label={field.label}
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
            required={field.required}
            placeholder={field.placeholder || undefined}
            onChange={handleInputChange}
          />
        );
    }
  };

  const sortedFields = [...eventForm.fields].sort((a, b) => a.order - b.order);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onFormSubmit) {
      onFormSubmit(formData);
    }
  };

  return (
    <div className={className}>
      <form onSubmit={handleFormSubmit}>
        <div className="space-y-6">
          <div className="space-y-4">
            {sortedFields.map((field) => (
              <div key={field.id}>{renderField(field)}</div>
            ))}
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Enviando..." : submitButtonText}
          </Button>
        </div>
      </form>
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
