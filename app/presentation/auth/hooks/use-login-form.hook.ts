import { loginSchema } from "@/domain/dtos/auth.dto";
import { useFormValidation } from "@/hooks/use-form-validation.hook";
import type { ActionData } from "@/shared/types";
import { useEffect } from "react";
import { useActionData, useNavigation } from "react-router";
import { toast } from "sonner";

export function useLoginForm() {
  const navigation = useNavigation();
  const actionData = useActionData() as ActionData | undefined;
  const isSubmitting = navigation.state === "submitting";
  const isLoading = navigation.state === "loading";

  const { errors, validateField } = useFormValidation({
    schema: loginSchema,
    initialErrors: actionData?.errors,
  });

  useEffect(() => {
    toast.info("Inicia sesión para acceder a la aplicación");

    if (actionData?.error) {
      toast.error(actionData.message || actionData.error);
    }
  }, [actionData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  return {
    isSubmitting,
    isLoading,
    errors,
    handleInputChange,
  };
}
