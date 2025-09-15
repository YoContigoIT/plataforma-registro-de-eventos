import { useState, useEffect } from "react";
import { z } from "zod";

export interface ValidationErrors {
  [key: string]: string[] | undefined;
}

interface UseFormValidationProps<T extends z.ZodObject<z.ZodRawShape>> {
  schema: T;
  initialErrors?: ValidationErrors;
}

export function useFormValidation<T extends z.ZodObject<z.ZodRawShape>>({
  schema,
  initialErrors = {},
}: UseFormValidationProps<T>) {
  const [errors, setErrors] = useState<ValidationErrors>(initialErrors);

  // Actualizar errores cuando vengan nuevos del servidor
  useEffect(() => {
    if (initialErrors && Object.keys(initialErrors).length > 0) {
      setErrors(initialErrors);
    }
  }, [initialErrors]);

  const getFieldSchema = (schema: z.ZodTypeAny, path: string): z.ZodTypeAny | null => {
    const keys = path.split(".");
    let current: z.ZodTypeAny = schema;

    for (const key of keys) {
      if (current instanceof z.ZodObject) {
        current = current.shape[key];
      } else {
        return null;
      }
    }

    return current;
  };

  const validateField = (name: string, value: string | File) => {
    // Solo intentamos validar si hay un error previo para ese campo
    if (!errors[name]) return;

    const fieldSchema = getFieldSchema(schema, name);
    if (!fieldSchema) return;

    try {
      // Validar solo el campo específico
      fieldSchema.parse(value);
      // Si pasa la validación, limpiar el error
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    } catch {
      // * IMPORTANT: No establecemos nuevos errores, eso lo hace el servidor
    }
  };

  return {
    errors,
    validateField,
    setErrors,
  };
}
