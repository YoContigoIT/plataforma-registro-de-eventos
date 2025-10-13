# Check-in de asistente

## Objetivo
Marcar el estado de un asistente como presente en el evento al momento de su llegada.

## Alcance
- Ejecución de check-in y actualización del estado.
- Feedback en la UI y consistencia con listados.

## Componentes involucrados
- Presentación (UI)
  - Acción de ruta: `app/presentation/guards/routes/actions/check-in.action.tsx`
  - UI: `components/ui/registration-info-card.tsx`, `components/ui/registration-actions.tsx`
- SSR (Loaders/Actions)
  - API: `app/presentation/guards/api/check-in.api.ts`
  - Loader: `app/presentation/guards/api/loaders.ts` (apoyo de datos)
- Dominio/Infraestructura
  - `app/domain/*`, `app/infrastructure/*`, `prisma/schema.prisma`

## Escenarios (BDD)

```gherkin
Escenario: Check-in exitoso
  Dado que el asistente se presenta con email/código válido
  Cuando ejecuto "check-in.action.tsx"
  Entonces "check-in.api.ts" marca el registro como check-in
  Y la UI refleja el estado actualizado

Escenario: Doble check-in
  Dado que el registro ya está en estado check-in
  Cuando intento hacer check-in nuevamente
  Entonces recibo confirmación de estado sin cambios
```

## Flujos alternativos y errores

```gherkin
Escenario: Registro no encontrado
  Dado que el email/código no corresponde
  Cuando intento check-in
  Entonces se muestra "Registro no encontrado"

Escenario: Error de persistencia
  Dado que el servidor devuelve error
  Cuando ejecuto la acción de check-in
  Entonces veo "No fue posible realizar el check-in, intenta de nuevo"
```