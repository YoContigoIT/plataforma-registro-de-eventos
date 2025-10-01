import { useEffect } from "react";
import { useFetcher, useNavigate } from "react-router";
import { toast } from "sonner";
import type { z } from "zod";
import type { ActionData } from "../types";
import { useFormValidation } from "./use-form-validation.hook";

export function useFetcherForm({
  zodSchema,
}: {
  zodSchema: z.ZodObject<z.ZodRawShape>;
}) {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  
  const isSubmitting = fetcher.state === "submitting";
  const isLoading = fetcher.state === "loading";
  const fetcherData = fetcher.data as ActionData | undefined;

  const { errors, validateField } = useFormValidation({
    schema: zodSchema,
    initialErrors: fetcherData?.errors,
  });

  useEffect(() => {
    // Only process data when fetcher is idle and has data
    if (fetcher.state === "idle" && fetcherData) {
      // Handle error messages
      if (!fetcherData.success && (fetcherData.error || fetcherData.message)) {
        toast.error(fetcherData.error || fetcherData.message);
      }

      // Handle validation errors
      if (!fetcherData.success && fetcherData.errors) {
        Object.entries(fetcherData.errors).forEach(([field, messages]) => {
          if (messages && messages.length > 0) {
            messages.forEach(message => {
              toast.error(`${field}: ${message}`);
            });
          }
        });
      }

      // Handle success
      if (fetcherData.success && fetcherData.message) {
        toast.success(fetcherData.message);
      }

      // Handle redirection
      if (fetcherData.redirectTo) {
        navigate(fetcherData.redirectTo);
      }
    }
  }, [fetcher.state, fetcherData, navigate]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  return {
    fetcher,
    isSubmitting,
    isLoading,
    errors,
    handleInputChange,
    isSuccess: fetcherData?.success === true,
    data: fetcherData,
  };
}