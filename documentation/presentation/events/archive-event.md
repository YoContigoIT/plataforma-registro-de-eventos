# Archivar evento

## Objetivo
Cambiar el estado de un evento a “archivado” para excluirlo de listados activos.

## Alcance
- Acción de archivado.
- Impacto en listados y permisos.

## Componentes involucrados
- Presentación (UI)
  - Ruta: `app/presentation/events/routes/archive.ts`
- SSR (Loaders/Actions)
  - Action: `app/presentation/events/api/actions/archive-event.api-action.ts`
- Dominio/Infraestructura
  - `app/domain/*`, `app/infrastructure/*`, `prisma/schema.prisma`

## Escenarios (BDD)

```gherkin
Escenario: Archivar evento exitosamente
  Dado que tengo permisos de administrador
  Cuando ejecuto "archive-event.api-action.ts" para un evento activo
  Entonces el evento queda en estado "archivado"
  Y no aparece en listados activos

Escenario: Evento ya archivado
  Dado que el evento está archivado
  Cuando intento archivar nuevamente
  Entonces recibo confirmación de estado sin cambios

Escenario: Error de persistencia
  Dado que el servidor devuelve error
  Cuando ejecuto la acción de archivado
  Entonces veo "No fue posible archivar el evento, intenta de nuevo"
```