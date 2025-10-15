import { Loader2 } from "lucide-react";
import { FormField } from "~/shared/components/common/form-field";
import { PasswordInput } from "~/shared/components/common/password-input";
import { Button } from "~/shared/components/ui/button";
import { useResetPasswordForm } from "../../hooks/use-reset-password.form";

export function ResetPasswordForm() {
  const { fetcher, isSubmitting, errors, handleInputChange, isLoading } =
    useResetPasswordForm();
  return (
    <fetcher.Form
      method="post"
      className="mt-6 space-y-6"
      action={`/cambiar-contrasenia`}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <FormField id="currentPassword" error={errors?.currentPassword}>
            <PasswordInput
              id="currentPassword"
              name="currentPassword"
              label="Contraseña actual"
              type="password"
              placeholder="Ingresa tu contraseña actual"
              required
              disabled={isSubmitting}
              onChange={handleInputChange}
              aria-invalid={Boolean(errors?.currentPassword)}
              aria-describedby={
                errors?.currentPassword ? "currentPassword-error" : undefined
              }
            />
          </FormField>
        </div>

        <div className="space-y-2">
          <FormField id="newPassword" error={errors?.newPassword}>
            <PasswordInput
              id="newPassword"
              name="newPassword"
              label="Nueva contraseña"
              type="password"
              placeholder="Ingresa tu nueva contraseña"
              required
              disabled={isSubmitting}
              onChange={handleInputChange}
              aria-invalid={Boolean(errors?.newPassword)}
              aria-describedby={
                errors?.newPassword ? "newPassword-error" : undefined
              }
            />
          </FormField>
        </div>

        <div className="space-y-2">
          <FormField id="confirmPassword" error={errors?.confirmPassword}>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              label="Confirmar contraseña"
              type="password"
              placeholder="Repite tu nueva contraseña"
              required
              disabled={isSubmitting}
              onChange={handleInputChange}
              aria-invalid={Boolean(errors?.confirmPassword)}
              aria-describedby={
                errors?.confirmPassword ? "confirmPassword-error" : undefined
              }
            />
          </FormField>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-border gap-3">
        <Button
          type="submit"
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar nueva contraseña"
          )}
        </Button>
      </div>
    </fetcher.Form>
  );
}
