import { PasswordInput } from "@/components/common/password-input";
import { TextInput } from "@/components/common/text-input";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/shared/components/ui/alert";
import { Button } from "@/ui/button";
import { Info, Loader2, X } from "lucide-react";
import { useId, useState } from "react";
import { Form } from "react-router";
import { loginSchema } from "~/domain/dtos/auth.dto";
import { useFormAction } from "~/shared/hooks/use-form-action.hook";

export function LoginForm() {
  const { handleInputChange, errors, isLoading, isSubmitting } = useFormAction({
    zodSchema: loginSchema,
  });
  const [showCredentials, setShowCredentials] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold">Inicia sesión</h1>
      </div>

      <Form method="POST" className="flex flex-col gap-6" replace>
        <div className="grid gap-3">
          <TextInput
            id={useId()}
            label="Correo electrónico"
            name="email"
            type="email"
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            required
            disabled={isSubmitting || isLoading}
            onChange={handleInputChange}
            aria-invalid={Boolean(errors?.email)}
            aria-describedby={errors?.email ? "email-error" : undefined}
          />
          {errors?.email && (
            <p id={errors?.email?.toString()} className="text-sm text-red-500">
              {errors.email}
            </p>
          )}
        </div>
        <div className="grid gap-3">
          <PasswordInput
            id={useId()}
            type="password"
            name="password"
            label="Contraseña"
            placeholder="******"
            autoComplete="current-password"
            disabled={isSubmitting || isLoading}
            required
            onChange={handleInputChange}
            aria-invalid={Boolean(errors?.password)}
            aria-describedby={errors?.password ? "password-error" : undefined}
          />
          {errors?.password && (
            <p
              id={errors?.password?.toString()}
              className="text-sm text-red-500"
            >
              {errors.password}
            </p>
          )}
        </div>
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isSubmitting || isLoading}
          aria-busy={isSubmitting || isLoading}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            "Iniciar sesión"
          )}
        </Button>
      </Form>

      {process.env.NODE_ENV !== "production" && showCredentials && (
        <Alert className="border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/50 relative">
          <button
            onClick={() => setShowCredentials(false)}
            className="absolute top-2 right-2 text-sky-600 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300"
            aria-label="Cerrar"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
          <Info className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          <AlertTitle className="text-sky-800 dark:text-sky-300">
            Credenciales de prueba
          </AlertTitle>
          <AlertDescription className="text-sky-700 dark:text-sky-400">
            <div className="space-y-1">
              <p>
                <strong>Correo:</strong> admin@eventos.com
              </p>
              <p>
                <strong>Contraseña:</strong> AdminPass123!
              </p>
            </div>
            <div className="space-y-1">
              <p>
                <strong>Correo:</strong> guardia@eventos.com
              </p>
              <p>
                <strong>Contraseña:</strong> GuardiaPass123!
              </p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
