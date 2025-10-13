# use-fetcher-form.hook.ts — Formularios con `useFetcher` (React Router)

## Resumen
Facilita el manejo de formularios que usan `useFetcher` de React Router, controlando estados, validación con Zod, toasts y redirecciones basadas en la respuesta del servidor.

## Ubicación
`app/shared/hooks/use-fetcher-form.hook.ts`

## Responsabilidades
- Exponer el objeto `fetcher` y estados (`submitting`, `loading`, `idle`).
- Validar inputs con `useFormValidation` y esquema Zod.
- Gestionar toasts de éxito/error e iterar mensajes de validación por campo.
- Redirigir al terminar (cuando `redirectTo` esté presente).

## API pública
- `useFetcherForm({ zodSchema })`
  - `zodSchema: z.ZodObject<z.ZodRawShape>`
  - Retorno:
    - `fetcher`
    - `isSubmitting: boolean`
    - `isLoading: boolean`
    - `errors`
    - `handleInputChange(e)`
    - `isSuccess: boolean`
    - `data: ActionData | undefined`

## Componentes involucrados
- React Router: `useFetcher`, `useNavigate`.
- Zod y validación: `useFormValidation`.
- Notificaciones: `sonner`.

## Ejemplo de uso
```tsx
import { useFetcherForm } from "~/shared/hooks/use-fetcher-form.hook";
import { z } from "zod";

const schema = z.object({ title: z.string().min(3) });

export function EventCreateWithFetcher() {
  const { fetcher, handleInputChange, isSubmitting, errors } =
    useFetcherForm({ zodSchema: schema });

  return (
    <fetcher.Form method="post" action="/events/create">
      <input name="title" onChange={handleInputChange} />
      {errors?.title?.map((e) => <p key={e}>{e}</p>)}
      <button type="submit" disabled={isSubmitting}>Crear</button>
    </fetcher.Form>
  );
}
```

## Consideraciones y errores
- Los toasts se procesan cuando `fetcher.state === "idle"` y hay datos.
- Mantén el contrato de `ActionData` consistente entre servidor y cliente.
- `handleInputChange` valida de forma incremental y no envía el formulario.

## Mantenimiento
- Reusa este hook en pantallas que necesiten `useFetcher` para optimizar UX.
- Documenta claves estándar de `ActionData` (success, message, errors, redirectTo).