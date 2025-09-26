import { useEffect, useState } from "react";
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "react-router";
import { toast } from "sonner";
import { createUserSchema } from "~/domain/dtos/user.dto";
import { useFormValidation } from "~/shared/hooks/use-form-validation.hook";

export function useRegistrationForm() {
  const navigation = useNavigation();
  const actionData = useActionData();
  const navigate = useNavigate();
  const loaderData = useLoaderData();

  const { event, user, registrationId, eventForm } = loaderData?.data || {};
  const [showSuccess, setShowSuccess] = useState(false);

  const isSubmitting = navigation.state === "submitting";
  const isLoading = navigation.state === "loading";

  const { errors, validateField } = useFormValidation({
    schema: createUserSchema,
    initialErrors: actionData?.errors,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: <not needed>
  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.message || actionData.error);
    }
    if (actionData?.message) {
      setShowSuccess(true);
      toast.success(actionData.message);
    }
    if (actionData?.redirectTo) {
      navigate(actionData.redirectTo);
    }
  }, [actionData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    validateField(name, value);
  };
  return {
    isSubmitting,
    isLoading,
    errors,
    handleInputChange,
    showSuccess,
    registrationId,
    eventForm,
    event,
    user,
  };
}
