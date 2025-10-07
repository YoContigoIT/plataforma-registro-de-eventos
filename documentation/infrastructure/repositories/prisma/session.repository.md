# session.repository.ts — Repositorio de sesiones

## Resumen
Gestión de sesiones de usuario y tokens JWT: creación, renovación y revocación, con metadatos de dispositivo.

## Ubicación
`app/infrastructure/repositories/prisma/session.repository.ts`

## Responsabilidades
- Crear sesión con `accessToken` y `refreshToken`.
- Renovar tokens validando la sesión y vencimiento.
- Revocar una o múltiples sesiones.

## API pública
- `findMany(filters): SessionEntity[]` — recibe filtros (`userId`); lista sesiones del usuario ordenadas por `created_at` desc.
- `findUnique(id): SessionEntity | null` — recibe id; regresa la sesión o `null`.
- `create(userId, deviceInfo?): { session, accessToken, refreshToken }` — recibe usuario y datos de dispositivo; crea sesión y regresa sesión y tokens.
- `renewTokens(refreshToken): { accessToken, refreshToken }` — recibe refreshToken; verifica y regenera tokens, actualizando la sesión; regresa nuevos tokens.
- `revoke(id): SessionEntity` — recibe id; elimina la sesión y regresa la entidad eliminada.
- `revokeAll(id): void` — recibe id; elimina todas las sesiones excepto la indicada.

## Consideraciones y errores
- Valida tipo y propietario del `refreshToken`; expira sesiones vencidas.
- Guarda `refresh_token_hash` como el valor del refresh en BD; considera hashing si se requiere mayor seguridad.

## Mantenimiento
- Ajusta expiraciones y comportamiento en `JWTRepository`/`config/jwt.ts`.
- Anexa auditoría/logs para revocaciones y renovaciones.

## Navegación
- `app/infrastructure/auth/jwt.repository.ts` (generar/verificar tokens)
- `documentation/infrastructure/auth/jwt.repository.md` (doc JWT)