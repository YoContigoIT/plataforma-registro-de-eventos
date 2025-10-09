# Listado y filtros de eventos

## Objetivo
Presentar el listado de eventos con capacidad de filtrado y cambio de vista (lista o grid).

## Alcance
- Carga del listado de eventos.
- Aplicación de filtros y búsqueda.
- Cambio entre vistas list y grid.

## Componentes involucrados
- Presentación (UI)
  - Ruta: `app/presentation/events/routes/events.tsx`
  - Componentes: `event-list-view.tsx`, `event-grid-view.tsx`
  - Filtros: `event-filters.tsx`, `event-filters-content.tsx`, `email-tags-input.tsx`
  - Hook: `event-filters.hook.ts`
- SSR (Loaders/Actions)
  - Loader: `app/presentation/events/api/loaders/get-events.loader.ts`
- Dominio/Infraestructura
  - `app/domain/*`, `app/infrastructure/*`, `prisma/schema.prisma`

## Escenarios (BDD)

```gherkin
Escenario: Ver listado de eventos
  Dado que accedo a "events.tsx"
  Cuando "get-events.loader.ts" trae los eventos
  Entonces veo la lista con la información básica de cada evento

Escenario: Filtrar eventos por criterios
  Dado que estoy en la lista
  Cuando aplico filtros en "event-filters.tsx"
  Entonces la vista muestra solo los eventos que cumplen los criterios

Escenario: Cambiar a vista grid
  Dado que estoy en la lista
  Cuando cambio a vista "grid"
  Entonces veo los eventos en tarjetas con diseño responsivo
```

## Flujos alternativos y errores

```gherkin
Escenario: Sin resultados
  Dado que aplico filtros muy restrictivos
  Cuando el loader no devuelve elementos
  Entonces veo un mensaje "No hay eventos que coincidan"

Escenario: Error de carga
  Dado que el servidor falla al traer eventos
  Cuando el loader se ejecuta
  Entonces se muestra "No fue posible cargar los eventos"
```