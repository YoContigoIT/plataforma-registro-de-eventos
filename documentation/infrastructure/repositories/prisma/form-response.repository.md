# form-response.repository.ts — Repositorio de respuestas de formulario

## Resumen
Crea, actualiza y consulta respuestas de formulario ligadas a registros, incluyendo operaciones por campo y actualizaciones en lote.

## Ubicación
`app/infrastructure/repositories/prisma/form-response.repository.ts`

## Responsabilidades
- CRUD de respuestas y gestión de respuestas por campo.
- Listado paginado con filtros (evento, usuario, fechas, existencia de respuestas).
- Operaciones atómicas de creación y actualización masiva.

## API pública
- `findByRegistrationId(registrationId): FormResponseAnswers | null` — recibe registrationId; regresa respuestas con `fieldResponses` (select básico).
- `findByRegistrationIdWithFields(registrationId): FormResponseEntityWithFields | null` — recibe registrationId; regresa respuestas con `field` incluido.
- `findById(id): FormResponseEntity | null` — recibe id; regresa respuesta con `fieldResponses` y `registration` (user, event).
- `create(data: CreateFormResponseDTO): FormResponseEntity` — recibe DTO; crea respuesta y `fieldResponses` en transacción; regresa respuesta con relaciones.
- `update(data: UpdateFormResponseDTO): FormResponseEntity` — recibe DTO; actualiza `submittedAt` y regresa respuesta con relaciones.
- `delete(id): void` — recibe id; elimina respuesta (cascade maneja campos).
- `updateFieldResponse(data: UpdateFormFieldResponseDTO): FormFieldResponseEntity` — recibe DTO; actualiza valor y regresa entidad con `field` y `response`.
- `bulkUpdateFieldResponses(data: BulkUpdateFieldResponsesDTO): FormResponseEntity` — recibe DTO; actualiza o crea campos en transacción y regresa respuesta con relaciones.
- `deleteFieldResponse(id): void` — recibe id; elimina respuesta de campo.
- `findMany(params, filters?): PaginatedResponse<FormResponseEntity>` — recibe paginación y filtros; lista respuestas con relaciones y regresa datos + `pagination`.
- `findByEventId(eventId): FormResponseEntity[]` — recibe eventId; lista respuestas vinculadas al evento.
- `responseExists(registrationId): boolean` — recibe registrationId; dice si ya existe respuesta.
- `getFieldResponsesByResponseId(responseId): FormFieldResponseEntity[]` — recibe responseId; lista respuestas por campo con relaciones.
- `countResponsesByEvent(eventId): number` — recibe eventId; regresa total de respuestas del evento.

## Consideraciones y errores
- Varias operaciones usan transacciones para consistencia entre respuesta y campos.
- Revisa la construcción de `pagination`: asegúrate de usar `calculatePaginationInfo(page, limit, total)` consistentemente en toda la app.

## Mantenimiento
- Ajusta filtros y relaciones según el crecimiento del modelo.
- Añade índices en Prisma si hay consultas frecuentes por `registrationId` o `eventId`.

## Navegación
- `app/infrastructure/db/prisma.ts` (transacciones)