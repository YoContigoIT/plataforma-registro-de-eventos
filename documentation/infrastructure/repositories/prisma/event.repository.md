# event.repository.ts — Repositorio de eventos

## Resumen
Operaciones de lectura, escritura y métricas sobre eventos, con filtros avanzados y paginación. Incluye el formulario del evento y sus campos cuando es relevante.

## Ubicación
`app/infrastructure/repositories/prisma/event.repository.ts`

## Responsabilidades
- Listar eventos con búsqueda, filtros y paginación.
- CRUD de eventos y borrado lógico.
- Métricas por estado y consultas por rango/ventana temporal.

## API pública
- `findMany(params, filters): PaginatedResponse<EventEntityWithEventForm)` — recibe parámetros de paginación y filtros; construye `where` y devuelve datos + `pagination`.
- `findUnique(id): EventEntityWithEventForm | null` — recibe id; busca un evento con relaciones (organizer, registrations, EventForm y fields); regresa el evento o `null`.
- `findByOrganizerId(organizerId): EventEntity[]` — recibe organizerId; lista eventos del organizador, ordenados por `start_date` desc.
- `create(data): EventEntity` — recibe datos del evento; crea y regresa el evento.
- `update(data): EventEntity` — recibe datos con `id`; actualiza y regresa el evento.
- `delete(id): void` — recibe id; elimina el evento permanentemente.
- `softDelete(id): void` — recibe id; marca `status=CANCELLED` y `archived=true`.
- `countByStatus(status, dateFilter?): number` — recibe estado y filtro de fechas opcional; regresa la cantidad de eventos con ese estado.
- `countAllStatuses(dateFilter?): Record<EventStatus, number>` — recibe filtro de fechas; regresa conteo por cada estado.
- `findByStatusAndDateRange(status, dateRange, limit=10): EventEntityWithEventForm[]` — recibe estado y rango de fechas; regresa lista limitada de eventos con formulario y campos.
- `findUpcomingEvents(daysAhead, statuses=["UPCOMING","DRAFT"], limit=10): EventEntityWithEventForm[]` — recibe ventana en días y estados; regresa próximos eventos dentro de la ventana.

## Consideraciones y errores
- Usa `buildWhereClause` para búsqueda/filtros; mantén consistencia con tipos y nombres de atributos.
- Los includes de `EventForm.fields` ordenan por `order asc`.
- Borrado lógico (`softDelete`) evita pérdida definitiva en producción.

## Mantenimiento
- Agrega nuevos filtros en `customFilters` y refleja cambios en tipos de dominio.
- Sincroniza cambios de schema Prisma (`schema.prisma`) con los includes y filtros.

## Navegación
- `app/infrastructure/db/prisma.ts` (instancia y transacciones)
- `documentation/infrastructure/config/dependencies.md` (DI)