import { Checkbox } from "@/ui/checkbox";
import { Label } from "@/ui/label";
import { Textarea } from "@/ui/textarea";
import type { FetcherWithComponents } from "react-router";
// Remove Form import from react-router
// import { Form } from "react-router";
import { createFormResponseSchema } from "~/domain/dtos/form-response.dto";
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
import { useFormAction } from "~/shared/hooks/use-form-action.hook";

interface EventFormRendererProps {
  eventForm: EventFormWithFields;
  registrationId: string;
  submitButtonText?: string;
  fetcher: FetcherWithComponents<FormData>;
  className?: string;
  defaultValues?: FormResponseAnswers;
  isUpdateForm?: boolean;
  formResponseId?: string; // Add this for update operations
}

export function EventFormRenderer({
  eventForm,
  registrationId,
  submitButtonText = "Enviar",
  fetcher,
  className,
  defaultValues,
  isUpdateForm = false,
  formResponseId,
}: EventFormRendererProps) {
  const { isSubmitting, handleInputChange } = useFormAction({
    zodSchema: createFormResponseSchema,
  });

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

      case "CHECKBOX":
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
                    name={`field_${field.id}`}
                    value={option}
                    checked={defaultValue === option}
                    onCheckedChange={(checked) => {
                      handleInputChange({
                        target: {
                          name: `field_${field.id}`,
                          value: checked ? option : "",
                        },
                      } as React.ChangeEvent<HTMLInputElement>);
                    }}
                  />
                  <Label
                    htmlFor={`${field.id}-${index}`}
                    className="text-sm font-normal"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

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

  const action = isUpdateForm
    ? "/api/update-form-response"
    : "/api/form-response";

  return (
    <div className={className}>
      <fetcher.Form method="post" action={action}>
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
            {isSubmitting ? "Enviando..." : submitButtonText}
          </Button>
        </div>
      </fetcher.Form>
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
