# Actualización de Evento

## Objetivo
Editar un evento existente precargando sus datos en el formulario.

## Alcance
- Precarga de datos.
- Actualización y feedback UX.

## Componentes involucrados
- Presentación (UI)
  - Ruta: `app/presentation/events/routes/update.tsx`
  - Form: `event-form.tsx`, `form-builder.tsx`, `sortable-form-field.tsx`
  - Hook: `use-event-form-renderer.ts`
- SSR (Loaders/Actions)
  - Loader: `app/presentation/events/api/loaders/get-event-by-id.loader.ts`
  - Action: `app/presentation/events/api/actions/update-event.api-action.ts`
- Dominio/Infraestructura
  - `app/domain/*`, `app/infrastructure/*`, `prisma/schema.prisma`

## Escenarios (BDD)

```gherkin
Escenario: Actualizar evento exitosamente
  Dado que el formulario se precarga con "get-event-by-id.loader.ts"
  Cuando envío cambios válidos
  Entonces "update-event.api-action.ts" guarda los cambios
  Y veo confirmación de actualización

Escenario: Evento no encontrado
  Dado que el ID no existe
  Cuando el loader consulta el evento
  Entonces veo "Evento no encontrado" y retorno al listado
```

## Flujos alternativos y errores

```gherkin
Escenario: Validación fallida
  Dado que hay campos inválidos
  Cuando envío el formulario
  Entonces veo errores y no se actualiza

Escenario: Error de persistencia
  Dado que el servidor falla
  Cuando intento actualizar
  Entonces se muestra "No fue posible actualizar el evento, intenta de nuevo"
```