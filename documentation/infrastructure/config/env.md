# env.ts — Variables de entorno

## Resumen
Provee un objeto `env` con todas las variables de entorno necesarias para base de datos, autenticación, aplicación y correo.

## Ubicación
`app/infrastructure/config/env.ts`

## Responsabilidades
- Centralizar acceso a `process.env`.
- Proveer valores por defecto seguros cuando aplica.
- Tipar/convertir adecuadamente (`Number(...)`, booleanos).

## API pública
- `env: { DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, SESSION_SECRET, INVITATION_SECRET, APP_URL, NODE_ENV, PORT, EMAIL_HOST, EMAIL_USER, EMAIL_PASSWORD, EMAIL_PORT, EMAIL_SECURE, EMAIL_FROM }`

## Detalle de claves
- Base de datos: `DATABASE_URL`
- Auth/JWT: `JWT_SECRET`, `JWT_REFRESH_SECRET`, `SESSION_SECRET`, `INVITATION_SECRET`
- App: `APP_URL`, `NODE_ENV`, `PORT`
- Email: `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD`, `EMAIL_PORT`, `EMAIL_SECURE`, `EMAIL_FROM`

## Consideraciones y errores
- Asegura que secretos críticos no estén vacíos en producción.
- Nota: `app/infrastructure/config/jwt.ts` usa `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET`. Verifica coherencia con `env.ts` y tu `.env` (puede requerir alinear nombres).

## Mantenimiento
- Añadir nuevas variables aquí para evitar lecturas directas de `process.env` fuera de este módulo.
- Documentar valores por defecto y sus implicaciones.

## Navegación
- `app/infrastructure/config/jwt.ts` (config de expiración y secretos)
- `app/infrastructure/config/nodemailer.ts` (transportador de email)