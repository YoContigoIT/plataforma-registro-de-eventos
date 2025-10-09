# dependencies.ts — Contenedor de dependencias

## Resumen
Centraliza la creación e inyección de repositorios y servicios de la capa de infraestructura, exponiendo contenedores para usar en el resto de la app.

## Ubicación
`app/infrastructure/config/dependencies.ts`

## Responsabilidades
- Construir el contenedor de repositorios (Prisma + utilidades como bcrypt/JWT).
- Construir el contenedor de servicios (por ahora, servicio de email).
- Exponer un contenedor principal combinado para fácil consumo.

## API pública
- `createRepositoriesContainer(prisma: PrismaClient): IRepositoriesContainer`
- `createServicesContainer(repositories: IRepositoriesContainer): IServicesContainer`
- `createDependenciesContainer(prisma: PrismaClient): IDependenciesContainer`

## Componentes involucrados
- Repositorios Prisma: `User`, `Session`, `Event`, `Registration`, `EventForm`, `FormResponse`.
- Utilidades: `bcryptRepository` (hash/compare), `JWTRepository` (tokens).
- Servicios: `EmailService`.

## Ejemplo de uso
```ts
import prisma from "~/app/infrastructure/db/prisma";
import { createDependenciesContainer } from "~/app/infrastructure/config/dependencies";

const di = createDependenciesContainer(prisma);

// Ejemplos:
await di.repositories.userRepository.findByEmail(email);
await di.repositories.sessionRepository.createSession(userId);
await di.services.emailService.sendEmail({ to, subject, html });
```

## Consideraciones y errores
- Requiere un `PrismaClient` válido.
- Si agregas nuevos repositorios/servicios, actualiza los contenedores para incluirlos.
- Mantén la construcción libre de efectos colaterales (sin I/O directo aquí).

## Mantenimiento
- Añadir nuevos repositorios/servicios siguiendo el patrón ya usado.
- Alinear tipados de interfaces (`I…Repository`, `I…Service`) con la capa de dominio.

## Navegación
- `app/infrastructure/db/prisma.ts` (instancia Prisma y transacciones)
- `documentation/infrastructure/auth/README.md` (utilidades de autenticación)