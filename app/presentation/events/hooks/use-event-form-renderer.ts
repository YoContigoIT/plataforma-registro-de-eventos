import { useState } from "react";
import { createFormResponseSchema } from "~/domain/dtos/form-response.dto";
import type { FormFieldEntity } from "~/domain/entities/event-form.entity";
import { useFormAction } from "~/shared/hooks/use-form-action.hook";

interface UseEventFormRendererProps {
  fields: FormFieldEntity[];
  registrationId: string;
}

export function useEventFormRenderer({
  fields,
  registrationId,
}: UseEventFormRendererProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  // Use the form action hook with our schema
  const {
    isSubmitting,
    isLoading,
    errors: actionErrors,
    handleInputChange: formActionInputChange,
    isSuccess,
  } = useFormAction({
    zodSchema: createFormResponseSchema,
  });

  // Local validation errors (for immediate feedback)
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }));

    // Clear local error when user starts typing
    if (localErrors[fieldId]) {
      setLocalErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }

    // Also trigger form action validation for the field
    const syntheticEvent = {
      target: {
        name: fieldId,
        value: value,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    
    formActionInputChange(syntheticEvent);
  };

  const validateField = (fieldId: string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (!field) return;

    const value = formData[fieldId];
    const fieldValidation = getFieldValidation(field);
    let error = "";

    // Required validation
    if (field.required) {
      if (
        value === undefined ||
        value === null ||
        value === "" ||
        (Array.isArray(value) && value.length === 0)
      ) {
        error = `${field.label} es requerido`;
      }
    }

    // Type-specific validations
    if (value && !error) {
      switch (field.type) {
        case "EMAIL": {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            error = "Ingresa un correo electrónico válido";
          }
          break;
        }

        case "PHONE":
          if (value.length !== 10 || !/^\d{10}$/.test(value)) {
            error = "Ingresa un número de teléfono válido (10 dígitos)";
          }
          break;

        case "TEXT":
        case "TEXTAREA":
          if (
            fieldValidation.minLength &&
            value.length < fieldValidation.minLength
          ) {
            error = `Mínimo ${fieldValidation.minLength} caracteres`;
          }
          if (
            fieldValidation.maxLength &&
            value.length > fieldValidation.maxLength
          ) {
            error = `Máximo ${fieldValidation.maxLength} caracteres`;
          }
          break;

        case "NUMBER": {
          const numValue = Number(value);
          if (isNaN(numValue)) {
            error = "Ingresa un número válido";
          } else {
            if (
              fieldValidation.min !== undefined &&
              numValue < fieldValidation.min
            ) {
              error = `El valor mínimo es ${fieldValidation.min}`;
            }
            if (
              fieldValidation.max !== undefined &&
              numValue > fieldValidation.max
            ) {
              error = `El valor máximo es ${fieldValidation.max}`;
            }
          }
          break;
        }
      }
    }

    if (error) {
      setLocalErrors((prev) => ({
        ...prev,
        [fieldId]: error,
      }));
    } else {
      setLocalErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }

    return !error;
  };

  const validateForm = () => {
    let isValid = true;

    fields.forEach((field) => {
      const fieldIsValid = validateField(field.id);
      if (!fieldIsValid) {
        isValid = false;
      }
    });

    return isValid;
  };

  // Helper function to get the form data in the correct format for submission
  const getFormDataForSubmission = () => {
    return {
      registrationId,
      fieldResponses: Object.entries(formData)
        .filter(([fieldId, value]) => {
          // Only include fields that have values
          return value !== undefined && value !== null && value !== "";
        })
        .map(([fieldId, value]) => ({
          fieldId,
          value,
        })),
    };
  };

  // Combine local errors with action errors
  const combinedErrors = {
    ...localErrors,
    ...actionErrors,
  };

  return {
    formData,
    errors: combinedErrors,
    handleInputChange,
    validateField,
    validateForm,
    isSubmitting,
    isLoading,
    isSuccess,
    getFormDataForSubmission,
  };
}

// Helper function
function getFieldValidation(field: FormFieldEntity): Record<string, any> {
  return field.validation &&
    typeof field.validation === "object" &&
    !Array.isArray(field.validation)
    ? (field.validation as Record<string, any>)
    : {};
}
