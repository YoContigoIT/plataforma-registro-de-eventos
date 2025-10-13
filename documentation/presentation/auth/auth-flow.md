# Documentación de autenticación (BDD)

## Objetivo
Permitir a los usuarios autenticarse de forma segura mediante correo y contraseña para acceder a funcionalidades protegidas, y poder cerrar sesión limpiamente para proteger su cuenta.

## Componentes involucrados por capas

- UI y Presentación
  - Formularios y pantallas de autenticación: `app/presentation/auth/`
  - Redirecciones protegidas y guards: `app/presentation/guards/`
  - Layout y rutas de panel: `app/presentation/panel/`, `app/presentation/layout.tsx`
- Dominio
  - Entidades y DTOs relacionados con usuarios: `app/domain/entities/`, `app/domain/dtos/`
  - Repositorios de dominio (abstracciones): `app/domain/repositories/`
  - Servicios de dominio: `app/domain/services/`
- Infraestructura
  - Servicios de autenticación e integración: `app/infrastructure/auth/`
  - Acceso a datos y cliente ORM: `app/infrastructure/db/`, `prisma/` (esquema y seeds)
  - Middleware (protección de rutas, extracción de sesión): `app/infrastructure/middleware/`
  - Configuración de entorno y utilidades: `app/infrastructure/config/`
- Compartidos
  - Hooks reutilizables (formularios, estado, etc.): `app/shared/hooks/`
  - Componentes UI comunes (inputs, toasts, modales): `app/shared/components/`
  - Librerías y utilidades (validación, storage, helpers): `app/shared/lib/`
  - Tipos comunes: `app/shared/types/`
- Servidor y enrutamiento
  - App server (Express + React Router SSR): `server/app.ts`, `server.js`
  - Configuración de rutas: `react-router.config.ts`, `app/routes.ts`

## Variables de entorno necesarias para la autenticación
- `DATABASE_URL`: conexión a PostgreSQL (Prisma).
- `JWT_SECRET`, `JWT_REFRESH_SECRET`: firma/verificación de tokens.
- `SESSION_SECRET`: cifrado de sesión del lado del servidor.
- `APP_URL`: URL base para callbacks/redirecciones.
- Entorno y puerto: `NODE_ENV`, `PORT`

### Gestión de sesión y autenticación

- Verificación de credenciales
  - Se obtiene el usuario mediante el ORM (`Prisma`) usando el esquema definido en `prisma/schema.prisma`.
  - Se verifica la contraseña con `bcrypt` comparando el hash persistido con la credencial provista.

- Emisión de sesión y/o tokens
  - Si el sistema usa JWT, se emiten:
    - Access Token firmado con `JWT_SECRET` (vida corta).
    - Refresh Token firmado con `JWT_REFRESH_SECRET` (vida más larga).
  - Si el sistema usa sesión basada en cookie, se firma/cifra con `SESSION_SECRET`.
  - La sesión/tokens se retornan por `Set-Cookie` con flags seguros: `HttpOnly`, `Secure` (en producción), `SameSite` (p. ej., `Lax`), y tiempo de expiración configurado.

- Persistencia y alcance de sesión
  - La sesión vive en cookies; el cliente no debe almacenar tokens en `localStorage` para evitar riesgos XSS.
  - En SSR, cada solicitud incluye cookies; el servidor valida la sesión en cada request.

- Validación por solicitud y contexto de usuario
  - Middleware en `app/infrastructure/middleware/` extrae la cookie/token, valida firma/expiración, y construye el contexto de usuario (id, roles, permisos).
  - Las `loaders`/`actions` de React Router consumen el contexto para ejecutar lógica protegida del lado servidor.

- Protección de rutas y redirecciones
  - Los guards en `app/presentation/guards/` bloquean acceso cuando no hay sesión válida y redirigen a la pantalla de autenticación.
  - En rutas con permisos, se evalúan roles/permisos del contexto y se responde con `403` cuando no hay autorización.

- Renovación de tokens (si aplica JWT)
  - Al expirar el Access Token, el cliente/SSR solicita un nuevo Access Token usando el Refresh Token.
  - Se realiza rotación segura: se emite un nuevo Refresh Token y se invalida el anterior para mitigar reutilización.
  - Si el Refresh Token es inválido o está vencido, se fuerza la terminación de sesión.

- Invalidación de sesión
  - La sesión se invalida en servidor (revocación de Refresh Token o anulación de sesión).
  - Se limpian cookies de sesión en la respuesta y se purga cualquier estado cliente dependiente.

- Errores y estados
  - `401 Unauthorized`: no autenticado o sesión inválida/expirada.
  - `403 Forbidden`: autenticado pero sin permisos suficientes para la acción/recurso.
  - En SSR/SPA se muestran mensajes genéricos y seguros, evitando revelar detalles sensibles.

- Consideraciones de seguridad
  - Usar `Secure` y `SameSite` apropiado en cookies; no exponer secretos (`JWT_SECRET`, `SESSION_SECRET`) en cliente.
  - Controlar el coste de `bcrypt` acorde a entorno; proteger endpoints con rate limiting/registro controlado (p. ej., `morgan`) sin datos sensibles.
  - Evitar almacenar tokens en claro y asegurar limpieza de sesión en cierre/expiración.

## Mapa de responsabilidades (alto nivel)

- Presentación (UI): captura de credenciales, feedback de errores, redirecciones.
- Validación (Zod / utilidades): reglas de formato y requerimientos previos al submit.
- Acciones/Handlers (React Router): orquestan validación, llamadas a servicios y navegación.
- Servicios de autenticación (Infraestructura): verificación de credenciales, emisión/validación de tokens, gestión de sesión.
- Persistencia (Prisma): operaciones relacionadas con usuarios/sesiones.
- Middleware/Guards: protección de rutas, verificación de sesión en SSR.
- Compartidos (hooks/utils/components): reutilizables para formularios, toasts y almacenamiento.

## Notas técnicas y buenas prácticas

- Manejo de errores consistente: mensajes específicos por tipo (validación vs credenciales).
- Seguridad:
  - Nunca exponer secretos en cliente.
  - Almacenar tokens/identificadores de sesión de forma segura.
  - Invalidar sesión en logout, limpiar storage y cookies.
- Observabilidad: registrar eventos de login/logout y errores (p. ej., con `morgan`), sin filtrar datos sensibles.
- Pruebas: usar estos escenarios BDD como criterios de aceptación para E2E y unitarias.