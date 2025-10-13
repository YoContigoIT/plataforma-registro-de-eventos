# Documentación: Seed de Prisma

## Objetivo
Poblar la base de datos con datos de ejemplo de forma segura y en orden, para facilitar pruebas y desarrollo.

## Estructura del Seed
- Orquestador: `prisma\seed.ts`
- Scripts:
  - `prisma\seed\user.ts`
  - `prisma\seed\event.ts`
  - `prisma\seed\registration.ts`
  - `prisma\seed\form.ts`

## Orquestación (seed.ts)
- Limpieza previa en orden inverso de dependencias:
  - `formFieldResponse` → `formResponse` → `formField` → `eventForm` → `registration` → `event` → `session` → `user`
- Siembra en orden de dependencias:
  1. `seedUsers(prisma)`
  2. `seedEvents(prisma)`
  3. `seedRegistrations(prisma)`
  4. `seedEventForms(prisma)` (incluye respuestas)
- Manejo de ciclo de vida: desconexión de Prisma y manejo de errores con salida no cero.

## Usuarios (seed/user.ts)
- Crea:
  - 1 Admin (`UserRole.ADMIN`)
  - 2 Organizadores (`UserRole.ORGANIZER`)
  - 5 Asistentes (`UserRole.ATTENDEE`)
- Contraseñas: hash con `bcrypt` y cost factor 10.
- Metadatos: `company`, `title`, `phone` con valores simulados.
- Resultado: retorna entidades creadas para trazabilidad si se requiere.

## Eventos (seed/event.ts)
- Requiere organizadores existentes.
- Crea eventos en distintos estados:
  - `UPCOMING` (ej. conferencia y workshop)
  - `ONGOING` (hackathon en curso)
  - `ENDED` (summit finalizado)
  - `DRAFT` (borrador, no se usa para registros ni formularios)
- Campos: `capacity`, `remainingCapacity`, `maxTickets`, `agenda`, `description`, y `organizerId`.

## Registros (seed/registration.ts)
- Requiere asistentes y eventos existentes.
- Genera `qrCode` único con `crypto (sha256)` combinando `userId`, `eventId` y timestamp.
- Estados variados por evento:
  - `UPCOMING`: mezcla de `PENDING`, `DECLINED`, `WAITLISTED`, `REGISTERED`.
  - `ONGOING`: mezcla de `REGISTERED` y `CHECKED_IN` (algunos con `checkedInAt`).
  - `ENDED`: mayoría `CHECKED_IN`, algunos `CANCELLED`.
- Campos de gestión de invitación: `invitedAt`, `respondedAt`, `registeredAt`.
- `purchasedTickets` simulado (1–2 si `REGISTERED`).

## Formularios y respuestas (seed/form.ts)
- Crea `EventForm` solo para eventos `status != DRAFT` (primeros dos eventos).
- Define `FormField`:
  - Contacto: nombre, email, teléfono
  - Empresa y cargo/posición (SELECT con opciones)
  - Nivel de experiencia (RADIO)
  - Intereses (CHECKBOX) si el evento es técnico/desarrolladores
  - Restricciones alimentarias (TEXTAREA)
  - Talla de playera (SELECT)
  - Comentarios (TEXTAREA)
- Genera `FormResponse` para algunas `Registration` con `REGISTERED` o `CHECKED_IN`.
- Genera `FormFieldResponse` con valores derivados del usuario y selección simulada.

## Flujo completo de siembra
1. Usuarios → 2. Eventos → 3. Registros → 4. Formularios → 5. Respuestas
- Asegura que cada paso tenga sus dependencias disponibles.

## Consideraciones de uso
- Idempotencia limitada: se realiza `deleteMany()` previo; ejecutar en entornos de desarrollo.
- Multi-schema: los modelos residen en `auth`; ver permisos del esquema en la BD.
- Datos simulados: valores como `company`, `title`, `purchasedTickets` y selección de campos son sample.
- Rendimiento: seeds usan operaciones secuenciales; ajustar a transacciones/batch si fuera necesario en escenarios grandes.

## Ejemplo de ejecución
```bash
node .\prisma\seed.ts
```

## Ver también
- `prisma\seed.ts` (orquestador)
- `prisma\seed\user.ts`
- `prisma\seed\event.ts`
- `prisma\seed\registration.ts`
- `prisma\seed\form.ts`