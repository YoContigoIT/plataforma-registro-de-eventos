# user.repository.ts — Repositorio de usuarios

## Resumen
CRUD y listado paginado de usuarios con exclusión de roles y soft delete; provee búsquedas y relaciones básicas.

## Ubicación
`app/infrastructure/repositories/prisma/user.repository.ts`

## Responsabilidades
- Crear, actualizar y eliminar (archivar) usuarios.
- Listar usuarios paginados con filtros y exclusión de roles.
- Consultas específicas por id y email.

## API pública
- `create(data): UserEntity` — recibe datos del usuario; crea y regresa el usuario.
- `findMany({ page, limit }, filters?): PaginatedResponse<UserEntity>` — recibe paginación y filtros; excluye roles (por defecto `ADMIN`), busca por nombre y regresa datos + `pagination`.
- `findUnique(id): UserEntity | null` — recibe id; busca usuario y regresa con `registrations` y `createdEvents`.
- `findByEmail(email): UserEntity | null` — recibe email; regresa usuario o `null`.
- `update(userId, data): UserEntity` — recibe id y datos; actualiza y regresa el usuario.
- `updatePassword(userId, newPassword): void` — recibe id y contraseña nueva; actualiza sin retorno.
- `delete(id): void` — recibe id; realiza soft delete (`archived=true`).

## Consideraciones y errores
- `findMany` excluye `ADMIN` por defecto; ajusta `filters.excludeRoles` según necesidades.
- `delete` no elimina físicamente; usa archivado para preservar referencias.

## Mantenimiento
- Extiende `searchFields` y `customFilters` si se habilitan más criterios.
- Mantén coherencia con DTOs/entidades en dominio.

## Navegación
- `app/infrastructure/db/prisma.ts` (instancia)
- `documentation/infrastructure/config/dependencies.md` (DI)