import { useEffect } from "react";
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "react-router";
import { toast } from "sonner";
import { createUserSchema } from "~/domain/dtos/user.dto";
import { useFormValidation } from "~/shared/hooks/use-form-validation.hook";

interface UserFormActionData {
  error?: string;
  message?: string;
  redirectTo?: string;
  errors?: {
    name?: string[];
    email?: string[];
    password?: string[];
    company?: string[];
    title?: string[];
    phone?: string[];
    role?: string[];
  };
}

export function useUserForm(isEditing = false) {
  const navigation = useNavigation();
  const actionData = useActionData() as UserFormActionData | undefined;
  const loaderData = useLoaderData();
  const navigate = useNavigate();

  const isSubmitting = navigation.state === "submitting";
  const isLoading = navigation.state === "loading";

  const { errors, validateField } = useFormValidation({
    schema: createUserSchema,
    initialErrors: actionData?.errors,
  });

  // Valores por defecto
  const defaultValues = isEditing ? loaderData?.user || {} : {};

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
  }, [actionData]);
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    console.log(e.target.name, e.target.value);

    const { name, value } = e.target;
    validateField(name, value);
  };

  return { isSubmitting, isLoading, errors, handleInputChange, defaultValues };
}
