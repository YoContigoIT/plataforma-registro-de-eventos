# registration.repository.ts — Repositorio de registros

## Resumen
Listados y operaciones sobre registros (invitaciones, estados, check-in), con filtros avanzados por fechas/estado, y relaciones completas a usuario/evento y respuestas de formulario.

## Ubicación
`app/infrastructure/repositories/prisma/registration.repository.ts`

## Responsabilidades
- Listar registros con filtros detallados y paginación.
- CRUD y consultas combinadas con usuario y evento.
- Métricas por estado y utilidades (QR, existencia).

## API pública
- `findMany(params, filters?): PaginatedResponse<RegistrationWithFullRelations>` — recibe paginación, orden y filtros; arma `where/orderBy`; regresa datos + `pagination` con relaciones completas.
- `findExactInvitation(eventId, userId): RegistrationWithRelations | null` — recibe eventId y userId; regresa la invitación exacta con relaciones.
- `registrationExists(eventId, userId): boolean` — recibe eventId y userId; indica si ya existe registro.
- `findOne(id): RegistrationWithFullRelations | null` — recibe id; regresa registro con usuario, evento y respuestas de formulario anidadas.
- `findByUserId(userId): RegistrationEntity[]` — recibe userId; lista registros del usuario.
- `findByEventId(eventId): RegistrationWithRelations[]` — recibe eventId; lista registros del evento con relaciones.
- `findByEmailAndEventId(email, eventId): RegistrationWithFullRelations | null` — recibe email y eventId; regresa registro con relaciones.
- `update(data: UpdateRegistrationDto): RegistrationEntity` — recibe DTO con `id`; actualiza y regresa el registro.
- `delete(id): void` — recibe id; elimina el registro.
- `create(data): RegistrationEntity` — recibe datos del registro y lo crea.
- `countByStatus(eventId, status): number` — recibe eventId y estado; regresa total por estado.
- `countAllStatusesByEvent(eventId): Record<RegistrationStatus, number>` — recibe eventId; regresa conteo por estado usando `groupBy`.
- `findByQrCode(qrCode): RegistrationWithRelations | null` — recibe QR; regresa registro con usuario y evento.
- `findTickesPurchased(eventId, userId): RegistrationEntity | null` — recibe eventId y userId; regresa el registro si existe compra de tickets.

## Consideraciones y errores
- Usa `buildWhereClause` para filtros de búsqueda; mantén la coherencia de tipos y nombres.
- Los includes de `FormResponse.fieldResponses.field` proveen contexto completo para visualización/servicios.

## Mantenimiento
- Extiende filtros y orden si se añaden nuevos campos (p.ej., estados adicionales).
- Revisa índices en Prisma para campos consultados frecuentemente (`userId`, `eventId`, `status`, `qrCode`).

## Navegación
- `app/infrastructure/db/prisma.ts` (instancia y transacciones)
- `documentation/infrastructure/config/dependencies.md` (DI)