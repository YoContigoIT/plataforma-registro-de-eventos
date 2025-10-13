# auth.middleware.ts — Middleware de autenticación y autorización

## Resumen
Protege rutas privadas verificando sesión y tokens, valida acceso por rol y renueva tokens cuando el `accessToken` expira. También revoca sesiones al detectar cambios relevantes de dispositivo.

## Ubicación
`app/infrastructure/middleware/auth.middleware.ts`

## Responsabilidades
- Permitir acceso a rutas públicas sin validación.
- Validar sesión (`sessionId`) y `accessToken`/`refreshToken`.
- Verificar que la sesión exista en BD y esté vigente.
- Validar huella de dispositivo básica (navegador y sistema) contra el `user_agent`.
- Resolver usuario desde el `accessToken` y verificar acceso a la ruta por rol.
- Intentar renovación vía `refreshToken` si el `accessToken` es inválido/expiró.
- Invalidar y destruir sesión si hay inconsistencias.

## API pública
- `authMiddleware(args: Route.LoaderArgs): Promise<Response | { user } | null>`
  - Retorna `null` en rutas públicas.
  - Retorna `{ user }` si pasa autenticación y autorización.
  - Retorna `redirect(...)` en casos de denegación, renovación o invalidación.

## Rutas públicas
- `PUBLIC_ROUTES`: `["/iniciar-sesion", "/registro", "/", "/inicio"]`.

## Autorización por roles
- `ROLE_PROTECTED_ROUTES: Record<UserRole, string[]>`
  - ADMIN: acceso total (además de listado explícito).
  - ORGANIZER: listado propio y también acceso a rutas de ADMIN.
  - ATTENDEE: rutas de registro, mis-eventos y perfil.
  - GUARD: panel y operaciones relacionadas al perfil y registros.
- Coincidencia de rutas con parámetros vía `createRouteRegex("/ruta/:id")`.

## Flujo principal
1. Si la ruta es pública → `return null`.
2. Leer `accessToken`, `refreshToken`, `sessionId` de la sesión cookie.
3. Si falta `accessToken` o `sessionId` → redirigir a `/iniciar-sesion`.
4. Buscar sesión en BD con `repositories.sessionRepository.findUnique(sessionId)`.
5. Si no existe → invalidar sesión (destruir cookie) y redirigir login.
6. Validar huella de dispositivo si hay `device_fingerprint` y `user_agent`.
   - Si cambia navegador/sistema → revocar sesión y redirigir login.
7. Verificar `accessToken` con `repositories.jwtRepository.verifyAccessToken`.
8. Cargar usuario (`repositories.userRepository.findUnique(payload.id)`).
9. Si no existe usuario → invalidar sesión y redirigir login.
10. Verificar acceso a la ruta por rol (`hasRouteAccess`).
    - Si no tiene acceso → redirigir a `/panel`.
11. Si todo OK → retornar `{ user }`.

## Renovación de tokens
- Si la verificación del `accessToken` falla:
  - Requiere `refreshToken`.
  - `renewTokens(refreshToken)` devuelve nuevos `accessToken`/`refreshToken`.
  - Actualiza la sesión (`session.set(...)`) y redirige a la misma URL con cookie comprometida (`commitSession(session)`).
- Si falla la renovación → invalidar sesión y redirigir login.

## Helpers
- `createRouteRegex(route: string): RegExp`: soporta rutas con `:param`.
- `hasRouteAccess(userRole, pathname): boolean`: verifica permisos por rol.
- `invalidateSession(session)`: destruye cookie y redirige a `/iniciar-sesion`.
- `validateDeviceFingerprint(storedUA, currentUA)`: compara navegador y OS.

## Consideraciones y errores
- Asegura que el `session.service` esté configurado con `accessToken`, `refreshToken`, `sessionId` y datos de `user` en la cookie.
- Mantén sincronizados los secretos y expiraciones de JWT con `auth/jwt.repository` y `config/jwt.ts`.
- Las rutas autorizadas deben reflejar las de `presentation/routes`; agrega o ajusta patrones según nuevas vistas.
- El fingerprint es básico; si requieres seguridad avanzada, considera hashes más fuertes y atributos adicionales.

## Extensión y mantenimiento
- Añade nuevas rutas protegidas por rol actualizando `ROLE_PROTECTED_ROUTES`.
- Extrae `PUBLIC_ROUTES` y `ROLE_PROTECTED_ROUTES` a config si deseas reutilización.
- Loguea eventos de revocación/renovación para auditoría.
- Añade pruebas de integración para flujos de expiración y renovación.

## Navegación
- `app/infrastructure/auth/session.service.ts` (gestión de sesión y cookies)
- `app/infrastructure/auth/jwt.repository.ts` (verificación/renovación de tokens)
- `documentation/infrastructure/auth/session.service.md` (documentación de sesión)
- `documentation/infrastructure/auth/jwt.repository.md` (documentación JWT)