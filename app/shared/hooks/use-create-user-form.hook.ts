import { useEffect } from "react";
import type { z } from "zod";
import { useActionData, useNavigate, useNavigation } from "react-router";
import { toast } from "sonner";
import { useFormValidation } from "./use-form-validation.hook";
import type { ActionData } from "../types";

export function useCreateActionForm({ zodSchema }: { zodSchema: z.ZodObject<z.ZodRawShape> }) {
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
    if (actionData?.error) {
      toast.error(actionData.message || actionData.error);
    }
    if (actionData?.message) {
      toast.success(actionData.message);
    }
    if (actionData?.redirectTo) {
      navigate(actionData.redirectTo);
    }
  }, [actionData, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
