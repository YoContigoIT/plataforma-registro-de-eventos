# Event Manager

## Índice

- [Event Manager](#event-manager)
  - [Índice](#índice)
  - [Descripción](#descripción)
  - [Tecnologías principales utilizadas](#tecnologías-principales-utilizadas)

## Descripción

**Event Manager** es una aplicación web full‑stack para la gestión de eventos, asistentes y registros, con renderizado del lado del servidor usando **React Router** y **Express**. El proyecto emplea **TypeScript**, **Vite** y **TailwindCSS** para una experiencia de desarrollo moderna, mientras que **Prisma** facilita el acceso a la base de datos. Incluye herramientas para validación, autenticación, tareas programadas, envío de correos, generación de QR y componentes de UI accesibles.

## Tecnologías principales utilizadas

- **[React Router](https://reactrouter.com/)** (SSR, `@react-router/express`, `@react-router/node`)
- **[React](https://react.dev/)** y **[React DOM](https://react.dev/)**: librería de UI
- **[Express](https://expressjs.com/)**: servidor HTTP
- **[Vite](https://vitejs.dev/)**: bundler y HMR
- **[TypeScript](https://www.typescriptlang.org/)**: tipado estático
- **[TailwindCSS](https://tailwindcss.com/)** y `@tailwindcss/vite`: estilos utilitarios
- **[Prisma](https://www.prisma.io/)** y `@prisma/client`: ORM
- **[Zod](https://zod.dev/)**: validación de esquemas
- **[bcrypt](https://www.npmjs.com/package/bcrypt)**: hash de contraseñas
- **[jose](https://github.com/panva/jose)**: utilidades de JWT/criptografía
- **[nodemailer](https://nodemailer.com/)**: envío de correos
- **[node-cron](https://github.com/kelektiv/node-cron)**: tareas programadas
- **[date-fns](https://date-fns.org/)** y **[react-day-picker](https://react-day-picker.js.org/)**: manejo de fechas
- **[lucide-react](https://lucide.dev/guide/packages/lucide-react)**: iconos
- **Radix UI** (`@radix-ui/react-*`): componentes accesibles
- **[dnd-kit](https://dndkit.com/)** (`@dnd-kit/core`, `@dnd-kit/sortable`): drag & drop
- **[cmdk](https://cmdk.paco.me/)**, **[vaul](https://vaul.emilkowal.ski/)**, **[sonner](https://sonner.emilkowal.ski/)**: componentes de UI
- **[qrcode](https://github.com/soldair/node-qrcode)**: generación de códigos QR
- **[use-debounce](https://www.npmjs.com/package/use-debounce)**: debounce de hooks
- **[@js-temporal/polyfill](https://github.com/tc39/proposal-temporal)**: API Temporal polyfill para fechas

## Requisitos

- Node.js v20 o superior.
- Base de datos PostgreSQL en la nube o local accesible mediante `DATABASE_URL`.
- Variables de entorno configuradas (ver “Configuración”).
- Opcional: servidor SMTP de desarrollo para pruebas de correo (p. ej., Mailgun).
- Opcional: Docker Desktop si prefieres levantar servicios localmente.

## Configuración
1. Variables de entorno  
   Crea un archivo `.env` en la raíz del proyecto tomando como referencia `.env.exmaple`:

   ```plaintext
   DATABASE_URL="postgresql://postgres:password@localhost:5432/crm_dev"

   JWT_SECRET="your-jwt-secret"
   JWT_REFRESH_SECRET="your-refresh-token-secret"
   SESSION_SECRET="your-session-secret"
   APP_URL="http://localhost:3000"
   INVITATION_SECRET="default-invitation-secret"

   EMAIL_HOST="localhost"
   EMAIL_PORT=1025
   EMAIL_USER=""
   EMAIL_PASSWORD=""
   EMAIL_SECURE=false
   EMAIL_FROM="noreply@crm-dev.local"

   NODE_ENV="development"
   PORT=3000
   ```

**Nota importante: Asegúrate de no subir `.env` a ningún repositorio público.**

2. Base de datos  
   Aplica el esquema con Prisma:

   ```bash
   npm run prisma:push
   ```

   (Opcional) Si necesitas datos iniciales:

   ```bash
   npm run prisma:seed
   ```

   (Opcional) Abre Prisma Studio para inspección:

   ```bash
   npm run prisma:studio
   ```

3. Generar el cliente de Prisma

   ```bash
   npm run prisma:generate
   ```

## Comandos

- Desarrollo (SSR con React Router y Express)

  ```bash
  npm run dev
  ```

- Compilar para producción

  ```bash
  npm run build
  ```

- Iniciar en producción

  ```bash
  npm run start
  ```

- Tipado y generación de tipos de rutas

  ```bash
  npm run typecheck
  ```

- Linter (Biome) sobre `./app`

  ```bash
  npm run lint
  ```

- Formateo (Biome) sobre `./app`

  ```bash
  npm run format
  ```

- Revisión (Biome) sobre `./app`

  ```bash
  npm run check
  ```

## Estructura del proyecto

```
event-manager/
├── app/
│   ├── app.css
│   ├── domain/
│   │   ├── dtos/
│   │   ├── entities/
│   │   ├── repositories/
│   │   └── services/
│   ├── infrastructure/
│   │   ├── auth/
│   │   ├── config/
│   │   ├── db/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   └── services/
│   ├── presentation/
│   │   ├── attendees/
│   │   ├── auth/
│   │   ├── events/
│   │   ├── guards/
│   │   ├── layout.tsx
│   │   ├── panel/
│   │   ├── registrations/
│   │   ├── root-redirect.tsx
│   │   ├── templates/
│   │   └── usuarios/
│   ├── root.tsx
│   ├── routes.ts
│   └── shared/
│       ├── components/
│       ├── hooks/
│       ├── lib/
│       └── types/
├── documentation/
│   └── registration-flow.md
├── prisma/
│   ├── errors.ts
│   ├── schema.prisma
│   ├── seed/
│   │   ├── event.ts
│   │   ├── form.ts
│   │   ├── registration.ts
│   │   └── user.ts
│   └── seed.ts
├── public/
│   └── favicon.ico
├── server/
│   └── app.ts
├── .vscode/
│   └── settings.json
├── Dockerfile
├── server.js
├── react-router.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.vite.json
├── vite.config.ts
├── package.json
├── biome.json
├── components.json
├── .env.exmaple
├── .dockerignore
├── .gitignore
```

- `app/`: código de UI y lógica de presentación, dominio e infraestructura del frontend.
- `app/domain/`: DTOs, entidades y repositorios de dominio.
- `app/infrastructure/`: autenticación, configuración, base de datos, middleware, repositorios y servicios.
- `app/presentation/`: pantallas y páginas (eventos, asistentes, registros, usuarios, etc.).
- `app/shared/`: componentes, hooks, librerías y tipos compartidos.
- `documentation/`: documentación del flujo de registro y otras guías.
- `prisma/`: esquema, errores, semillas y utilidades de la base de datos.
- `public/`: recursos estáticos públicos.
- `server/`: código del servidor de la aplicación (Express + React Router).
- `.vscode/`: configuración del editor.
- Archivos de configuración y build: `Dockerfile`, `server.js`, `react-router.config.ts`, `tsconfig*.json`, `vite.config.ts`, `package.json`, `biome.json`, `components.json`.
- Control de entorno y repositorio: `.env.exmaple`, `.dockerignore`, `.gitignore`.

## Despliegue

- **Importante**: Asegúrate de tener configurado el archivo `.env` con las variables necesarias para la conexión a la base de datos y otras configuraciones sensibles.

- **Build de producción automatico**: El build de producción se genera automáticamente cuando se hace un push a la rama `main`.

- **Preparar build de producción manualmente**: Si necesitas compilar el proyecto manualmente, puedes usar los siguientes comandos:

  ```bash
  npm run build
  ```

- Ejecutar en producción (requiere `.env` correctamente configurado)

  ```bash
  npm run start
  ```

- Despliegue con Docker: construir imagen

  ```bash
  docker build -t event-manager .
  ```

- Despliegue con Docker: ejecutar contenedor (puerto 3000)

  ```bash
  docker run -p 3000:3000 --env-file .env -e NODE_ENV=production event-manager
  ```
La aplicación puede ser desplegada en cualquier plataforma que soporte Node.js y Express. Algunas opciones populares incluyen:
- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

Built with ❤️ using React Router.

