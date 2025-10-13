# use-form-action.hook.ts — Hook genérico de acción de formulario

## Resumen
Centraliza estados de envío/carga, validación con Zod, toasts detallados por campo y redirecciones para formularios basados en acción de React Router.

## Ubicación
`app/shared/hooks/use-form-action.hook.ts`

## Responsabilidades
- Control de `useNavigation` y lectura de `useActionData`.
- Validación Zod con `useFormValidation` y `initialErrors`.
- Mostrar toasts globales y por campo cuando hay errores.
- Redirección según `redirectTo`.

## API pública
- `useFormAction({ zodSchema })`
  - `zodSchema: z.ZodObject<z.ZodRawShape>`
  - Retorno: `isSubmitting`, `isLoading`, `errors`, `handleInputChange`, `isSuccess`

## Componentes involucrados
- React Router: `useActionData`, `useNavigate`, `useNavigation`.
- Zod: `useFormValidation`.
- Notificaciones: `sonner`.

## Ejemplo de uso
```tsx
import { useFormAction } from "~/shared/hooks/use-form-action.hook";
import { z } from "zod";

const schema = z.object({ name: z.string().min(2) });

export function GenericForm() {
  const { isSubmitting, errors, handleInputChange } =
    useFormAction({ zodSchema: schema });

  return (
    <form method="post">
      <input name="name" onChange={handleInputChange} />
      {errors?.name?.map((e) => <p key={e}>{e}</p>)}
      <button type="submit" disabled={isSubmitting}>Enviar</button>
    </form>
  );
}
```

## Consideraciones y errores
- Emite toasts por cada error de campo recibido desde el servidor.
- Diferencia entre `success`, `message` y `error` para feedback correcto.
- `initialErrors` mantiene errores hasta que se corrigen en cliente.

## Mantenimiento
- Unifica criterios de mensajes y estructura de `ActionData` en la capa de servidor.
- Comparte estilos de errores entre formularios para consistencia.