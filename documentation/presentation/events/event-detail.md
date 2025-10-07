# Detalle de Evento

## Objetivo
Visualizar la información detallada de un evento.

## Alcance
- Carga de detalle del evento.
- Presentación en panel/hoja con metadatos.

## Componentes involucrados
- Presentación (UI)
  - Ruta: `app/presentation/events/routes/detail.tsx`
  - Componente: `event-details-sheet.tsx`
- SSR (Loaders/Actions)
  - Loader: `app/presentation/events/api/loaders/get-event-by-id.loader.ts`
- Dominio/Infraestructura
  - `app/domain/*`, `app/infrastructure/*`, `prisma/schema.prisma`

## Escenarios (BDD)

```gherkin
Escenario: Ver detalle de evento
  Dado que selecciono un evento desde el listado
  Cuando "get-event-by-id.loader.ts" trae la información
  Entonces "event-details-sheet.tsx" muestra el detalle

Escenario: Evento no encontrado
  Dado que el ID proporcionado no existe
  Cuando el loader consulta
  Entonces se muestra "Evento no encontrado" y navegación segura
```
