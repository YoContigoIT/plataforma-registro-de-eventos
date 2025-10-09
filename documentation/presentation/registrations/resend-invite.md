# Reenviar invitación

## Objetivo
Reenviar invitaciones a registros seleccionados cuando sea necesario (recordatorios o correcciones).

## Alcance
- Selección de registros objetivo.
- Ejecución de reenvío y feedback.

## Componentes involucrados
- Presentación (UI)
  - Ruta: `app/presentation/registrations/routes/resend-invite.tsx`
  - Apoyo: `mass-actions.tsx` (acciones múltiples desde listado)
- SSR (Loaders/Actions)
  - Action: `app/presentation/registrations/api/actions.ts`
  - Loader: `app/presentation/registrations/api/loaders.ts` (apoyos)
- Dominio/Infraestructura
  - `app/domain/*`, `app/infrastructure/*`, `prisma/schema.prisma`

## Escenarios (BDD)

```gherkin
Escenario: Reenviar invitación exitosamente
  Dado que selecciono uno o más registros en la UI
  Cuando ejecuto reenvío desde "resend-invite.tsx" o "mass-actions.tsx"
  Entonces "api/actions.ts" procesa el reenvío
  Y veo confirmación en la UI

Escenario: Sin selección
  Dado que no hay registros seleccionados
  Cuando intento reenviar
  Entonces la UI indica que debo seleccionar registros
```

## Flujos alternativos y errores

```gherkin
Escenario: Error de persistencia
  Dado que el servidor devuelve error
  Cuando ejecuto la acción de reenvío
  Entonces se muestra "No fue posible reenviar la invitación, intenta de nuevo"
```