import { useEffect } from "react";
import { useActionData, useNavigate, useNavigation } from "react-router";
import { toast } from "sonner";
import type { z } from "zod";
import type { ActionData } from "../types";
import { useFormValidation } from "./use-form-validation.hook";

export function useFormAction({
  zodSchema,
}: {
  zodSchema: z.ZodObject<z.ZodRawShape>;
}) {
  const navigation = useNavigation();
  const actionData = useActionData() as ActionData | undefined;
  const navigate = useNavigate();
  const isSubmitting = navigation.state === "submitting";
  const isLoading = navigation.state === "loading";

  const { errors, validateField } = useFormValidation({
    schema: zodSchema,
    initialErrors: actionData?.errors,    
  });

  useEffect(() => {
    if (actionData?.errors) {
      Object.entries(actionData.errors).forEach(([field, messages]) => {
        if (messages && messages.length > 0) {
          messages.forEach(message => {
            toast.error(`${field}: ${message}`);
          });
        }
      });
    }
    if (actionData?.message) {
      toast.success(actionData.message);
    }
    if (actionData?.redirectTo) {
      navigate(actionData.redirectTo);
    }
  }, [actionData, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  return {
    isSubmitting,
    isLoading,
    errors,
    handleInputChange,
    isSuccess: actionData?.success === true,
  };
}
