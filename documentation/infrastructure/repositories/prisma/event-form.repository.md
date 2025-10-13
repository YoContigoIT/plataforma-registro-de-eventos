# event-form.repository.ts — Repositorio de formulario de evento

## Resumen
Gestiona el formulario asociado a un evento y sus campos, con operaciones atómicas para creación y reordenamiento.

## Ubicación
`app/infrastructure/repositories/prisma/event-form.repository.ts`

## Responsabilidades
- CRUD del formulario de evento.
- Gestión de campos individuales y reordenamiento.
- Consultas auxiliares (existencia, obtener campos).

## API pública
- `findByEventId(eventId): EventFormWithFields | null` — recibe eventId; regresa formulario con `fields` ordenados.
- `create(data: CreateEventFormDTO): void` — recibe DTO; crea formulario y campos en transacción; no regresa datos.
- `update(data: UpdateEventFormDTO): EventFormEntity` — recibe DTO; actualiza formulario y regresa con `fields`.
- `delete(id): void` — recibe id; elimina el formulario.
- `updateField(data: UpdateFormFieldDTO): FormFieldEntity` — recibe DTO; actualiza campo y regresa entidad.
- `deleteField(id): void` — recibe id; elimina campo.
- `addField(formId, data: CreateFormFieldDTO): FormFieldEntity` — recibe formId y DTO; crea campo y regresa entidad.
- `reorderFields(data: ReorderFieldsDTO): void` — recibe DTO con ordenes; actualiza órdenes en transacción; no regresa datos.
- `formExists(eventId): boolean` — recibe eventId; regresa si hay formulario.
- `getFieldsByFormId(formId): FormFieldEntity[]` — recibe formId; regresa campos ordenados.

## Consideraciones y errores
- `create` y `reorderFields` usan transacciones (`runInTransaction`) para consistencia.
- Usa `order` para visualizar/guardar el orden de campos.

## Mantenimiento
- Mantén DTOs alineados con `schema.prisma`.
- Valida `options` y `validation` según tipos configurados.