# Actualización de registro

## Objetivo
Actualizar campos del registro de un asistente ya existente, con precarga y validación.

## Alcance
- Precarga de datos del registro.
- Persistencia de cambios y feedback.

## Componentes involucrados
- Presentación (UI)
  - Ruta: `app/presentation/guards/routes/update-registration.tsx`
  - Form: `components/register-attendee-form.tsx`
  - UI: `components/ui/registration-layout.tsx`, `components/ui/registration-actions.tsx`
- SSR (Loaders/Actions)
  - Loader: `app/presentation/guards/api/loaders.ts` (precarga)
  - Action: `app/presentation/guards/routes/actions/update-registration.action.tsx`
  - API: `app/presentation/guards/api/update-registration.api.ts`
- Dominio/Infraestructura
  - `app/domain/*`, `app/infrastructure/*`, `prisma/schema.prisma`

## Escenarios (BDD)

```gherkin
Escenario: Actualizar registro exitosamente
  Dado que el formulario se precarga con "api/loaders.ts"
  Cuando envío cambios válidos desde "update-registration.tsx"
  Entonces "update-registration.action.tsx" actualiza el registro
  Y la UI confirma la actualización

Escenario: Registro no encontrado
  Dado que el ID/email no existe
  Cuando el loader consulta
  Entonces veo "Registro no encontrado" y navegación segura
```

## Flujos alternativos y errores

```gherkin
Escenario: Validación fallida
  Dado que hay campos inválidos
  Cuando envío la actualización
  Entonces veo errores y no se guardan cambios

Escenario: Error de persistencia
  Dado que el servidor falla
  Cuando ejecuto la acción de actualización
  Entonces se muestra "No fue posible actualizar el registro, intenta de nuevo"
```
