import { useEffect } from "react";
import {
  useActionData,
  useLoaderData,
  useNavigate,
  useNavigation,
} from "react-router";
import { toast } from "sonner";
import { updateUserSchema, type UpdateUserDTO } from "~/domain/dtos/user.dto";
import type { UserEntity } from "~/domain/entities/user.entity";
import { useFormValidation } from "~/shared/hooks/use-form-validation.hook";

interface UpdateUserActionData {
  error?: string;
  message?: string;
  redirectTo?: string;
  errors?: {
    nombre?: string[];
    apellido_paterno?: string[];
    apellido_materno?: string[];
    correo?: string[];
    contrasenia?: string[];
    telefono?: string[];
    rol?: string[];
    puesto?: string[];
    dependencia_id?: string[];
  };
}

export function useUpdateUserForm() {
  const navigation = useNavigation();
  const actionData = useActionData() as UpdateUserActionData | undefined;
  const { user } = useLoaderData() as {
    user: UserEntity;
  };
  const navigate = useNavigate();
  const isSubmitting = navigation.state === "submitting";
  const isLoading = navigation.state === "loading";

  const { errors, validateField } = useFormValidation({
    schema: updateUserSchema,
    initialErrors: actionData?.errors,
  });

  const defaultValues: UpdateUserDTO = {
    email: user.email,
    name: user.name,
    company: user.company || undefined,
    title: user.title || undefined,
    phone: user.phone || undefined,
    role: user.role || undefined,
  };

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  return {
    isSubmitting,
    isLoading,
    errors,
    handleInputChange,
    defaultValues,
    userId: user.id,
  };
}
