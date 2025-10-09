# Creación de registro

## Objetivo
Crear un registro de asistente mediante un flujo por pasos con validación y persistencia de datos.

## Alcance
- Pasos: email → selección de evento → formulario.
- Persistencia y confirmación.

## Componentes involucrados
- Presentación (UI)
  - Ruta: `app/presentation/guards/routes/create-registration.tsx`
  - Form: `components/register-attendee-form.tsx`
  - Pasos: `components/steps/email-input-step.tsx`, `components/steps/event-selection-step.tsx`, `components/steps/registration-form-step.tsx`
  - UI: `components/ui/registration-layout.tsx`, `components/ui/registration-actions.tsx`
- SSR (Loaders/Actions)
  - Action: `app/presentation/guards/routes/actions/create-registration.action.tsx`
  - API: `app/presentation/guards/api/create-registration.api.ts`
  - Loader: `app/presentation/guards/api/loaders.ts` (apoyos de datos)
- Dominio/Infraestructura
  - `app/domain/*`, `app/infrastructure/*`, `prisma/schema.prisma`

## Escenarios (BDD)

```gherkin
Escenario: Crear registro exitosamente
  Dado que completo los pasos con datos válidos
  Cuando envío el formulario desde "create-registration.tsx"
  Entonces "create-registration.action.tsx" persiste el registro
  Y veo confirmación en "registration-info-card.tsx"
```

## Flujos alternativos y errores

```gherkin
Escenario: Selección de evento requerida
  Dado que no he seleccionado un evento
  Cuando intento continuar
  Entonces veo error y no avanzo al formulario de registro

Escenario: Validación fallida
  Dado que faltan campos requeridos o son inválidos
  Cuando envío el formulario
  Entonces veo errores y no se crea el registro

Escenario: Error de persistencia
  Dado que el servidor devuelve error
  Cuando ejecuto la acción de creación
  Entonces se muestra "No fue posible crear el registro, intenta de nuevo"
```
