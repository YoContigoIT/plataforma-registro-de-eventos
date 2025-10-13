# Listado y filtros de registros

## Objetivo
Visualizar el listado de registros, aplicar filtros y consultar métricas/resúmenes por estado.

## Alcance
- Carga del listado y métricas.
- Aplicación de filtros y búsqueda.
- Panel de detalle del registro.

## Componentes involucrados
- Presentación (UI)
  - Ruta: `app/presentation/registrations/routes/registrations.tsx`
  - Componentes: `registration-table.tsx`, `status-cards.tsx`, `status-cards-skeleton.tsx`
  - Filtros: `registration-filters.tsx`, `registration-filters-content.tsx`
  - Detalle: `registration-details-sheet.tsx`
  - Hook: `registration-filters.hook.ts`
- SSR (Loaders/Actions)
  - Loader: `app/presentation/registrations/api/loaders.ts`
- Dominio/Infraestructura
  - `app/domain/*`, `app/infrastructure/*`, `prisma/schema.prisma`

## Escenarios (BDD)

```gherkin
Escenario: Ver listado de registros
  Dado que accedo a "registrations.tsx"
  Cuando "api/loaders.ts" trae los registros
  Entonces veo la tabla y métricas en la UI

Escenario: Filtrar registros por criterios
  Dado que estoy en la lista
  Cuando ajusto filtros en "registration-filters.tsx"
  Entonces la vista refleja los resultados que cumplen esos criterios

Escenario: Ver detalle de un registro
  Dado que selecciono un registro
  Cuando se abre "registration-details-sheet.tsx"
  Entonces veo la información completa de ese registro
```

## Flujos alternativos y errores

```gherkin
Escenario: Sin resultados
  Dado que aplico filtros muy restrictivos
  Cuando el loader retorna vacío
  Entonces veo "No hay registros que coincidan"

Escenario: Error de carga
  Dado que el servidor falla al traer registros
  Cuando el loader se ejecuta
  Entonces se muestra "No fue posible cargar los registros"
```