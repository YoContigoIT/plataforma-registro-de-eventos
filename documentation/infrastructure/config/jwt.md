# jwt.ts — Configuración JWT

## Resumen
Define expiraciones por defecto para tokens y construye los secretos de acceso y refresh como `Uint8Array`, listos para librerías como `jose`.

## Ubicación
`app/infrastructure/config/jwt.ts`

## Responsabilidades
- Fijar expiración de `accessToken` y `refreshToken`.
- Codificar secretos de entorno en `Uint8Array` para firma/verificación.

## API pública
- `JWT_CONFIG = { accessTokenExpiration: "15m", refreshTokenExpiration: "30d" }`
- `secretAccessToken: Uint8Array` (derivado de `process.env.JWT_ACCESS_SECRET`)
- `secretRefreshToken: Uint8Array` (derivado de `process.env.JWT_REFRESH_SECRET`)

## Consideraciones y errores
- Variables de entorno requeridas: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.
- Alinea los nombres con `env.ts` y tu `.env`. Si usas `JWT_SECRET` en otros módulos, unifica (p.ej. `JWT_ACCESS_SECRET` vs `JWT_SECRET`) para evitar confusiones.
- Ajusta expiraciones según requisitos de seguridad y UX.

## Mantenimiento
- Mantén consistencia con la implementación de `JWTRepository` (algoritmo, expiraciones).
- Evita exponer directamente los secretos; usa este módulo como punto único.

## Navegación
- `app/infrastructure/auth/jwt.repository.ts` (generación/verificación de JWT)
- `documentation/infrastructure/auth/jwt.repository.md` (documentación detallada)