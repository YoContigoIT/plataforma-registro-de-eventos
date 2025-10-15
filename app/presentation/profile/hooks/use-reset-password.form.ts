import { useEffect, useState } from "react";
import { useFetcher, useNavigate } from "react-router";
import { toast } from "sonner";
import { changePasswordSchema } from "~/domain/dtos/user.dto";
import { useFormValidation } from "~/shared/hooks/use-form-validation.hook";

export function useResetPasswordForm() {
  const fetcher = useFetcher();
  const navigate = useNavigate();

  const isSubmitting = fetcher.state === "submitting";
  const isLoading = fetcher.state === "loading";

  const [isValidating, setIsValidating] = useState(false);

  const { errors, validateField } = useFormValidation({
    schema: changePasswordSchema,
    initialErrors: fetcher.data?.errors,
  });

  useEffect(() => {
    const data = fetcher.data;

    if (!data) return;

    if (data?.error) {
      toast.error(data.message || data.error);
    }

    if (data?.message && !data.error) {
      setIsValidating(true);
      toast.success(data.message);
    }

    if (data?.redirectTo) {
      // Redirect to the login page after successful reset
      navigate(data.redirectTo);
    }
  }, [fetcher.data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  return {
    fetcher,
    isSubmitting,
    isLoading,
    errors,
    validateField,
    handleInputChange,
    isValidating,
  };
}
