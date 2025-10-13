# Documentación BDD: Gestión de eventos

## Navegación
- [Listado y filtros de eventos](./events-list.md)
- [Creación de evento](./create-event.md)
- [Actualización de evento](./update-event.md)
- [Detalle de evento](./event-detail.md)
- [Archivado de evento](./archive-event.md)

## Objetivo
Permitir a usuarios administradores crear, actualizar, consultar y archivar eventos, ofreciendo vistas de listado con filtros y detalle de cada evento.

## Alcance
- Listado y filtrado de eventos.
- Creación y edición de eventos con formularios dinámicos.
- Consulta de detalles de un evento.
- Archivado de eventos y actualización de estado.

## Componentes involucrados

- Presentación (UI)
  - Rutas: `app/presentation/events/routes/`
    - `events.tsx` (listado de eventos)
    - `create.tsx` (crear evento)
    - `update.tsx` (actualizar evento)
    - `detail.tsx` (detalle de evento)
    - `archive.ts` (archivar evento)
  - Componentes:
    - `event-list-view.tsx`, `event-grid-view.tsx` (vistas)
    - `event-filters.tsx`, `event-filters-content.tsx`, `email-tags-input.tsx` (filtros)
    - `event-details-sheet.tsx` (detalle)
    - `event-form.tsx`, `form-builder.tsx`, `sortable-form-field.tsx` (formulario)
  - Hooks:
    - `event-filters.hook.ts`

- Acciones y carga de datos (SSR: Loaders/Actions)
  - Loaders:
    - `get-events.loader.ts` (cargar listado)
    - `get-event-by-id.loader.ts` (cargar detalle/edición)
  - Actions:
    - `create-event.api-action.ts`
    - `update-event.api-action.ts`
    - `archive-event.api-action.ts`

- Dominio e infraestructura relacionadas
  - Dominio: `app/domain/{dtos,entities,repositories,services}`
  - Infraestructura: `app/infrastructure/{db,repositories,services}`

## Flujo general

1. Listado y filtros
   - Se cargan eventos con `get-events.loader.ts`.
   - La UI permite aplicar filtros y cambiar entre vista de lista o grid.
2. Ver detalle
   - Al seleccionar un evento, `get-event-by-id.loader.ts` provee los datos.
   - Se muestra el panel de detalle con metadatos relevantes.
3. Crear evento
   - La ruta `create.tsx` muestra `event-form.tsx`.
   - Al enviar, `create-event.api-action.ts` persiste el nuevo evento.
4. Actualizar evento
   - La ruta `update.tsx` precarga datos con `get-event-by-id.loader.ts`.
   - Al enviar, `update-event.api-action.ts` guarda cambios.
5. Archivar evento
   - La ruta `archive.ts` ejecuta `archive-event.api-action.ts` para cambiar el estado a “archivado”.

## Característica completa (BDD)

```gherkin
Característica: Gestión de eventos
  Como administrador del sistema
  Quiero listar, crear, actualizar, consultar y archivar eventos
  Para mantener una agenda organizada y actualizada

  Antecedentes:
    Dado que estoy autenticado con privilegios de administrador
    Y el sistema puede cargar el listado de eventos
    Y existen formularios con validación para crear/editar
    Y hay acciones para persistir cambios y archivar

Escenario: Listar y filtrar eventos
  Dado que estoy en la vista "events.tsx"
  Cuando el loader "get-events.loader.ts" obtiene los eventos
  Entonces veo la lista o grid con los eventos actuales
  Y puedo aplicar filtros en "event-filters.tsx"

Escenario: Ver detalle de un evento
  Dado que selecciono un evento de la lista
  Cuando el loader "get-event-by-id.loader.ts" obtiene el evento
  Entonces se muestra "event-details-sheet.tsx" con la información

Escenario: Crear un evento
  Dado que estoy en la ruta "create.tsx"
  Y completo el formulario "event-form.tsx"
  Cuando envío el formulario
  Entonces "create-event.api-action.ts" guarda el nuevo evento
  Y veo un mensaje de confirmación

Escenario: Actualizar un evento
  Dado que estoy en la ruta "update.tsx"
  Y el formulario se precarga con datos existentes
  Cuando envío cambios válidos
  Entonces "update-event.api-action.ts" actualiza el evento
  Y veo confirmación de actualización

Escenario: Archivar un evento
  Dado que estoy en la ruta "archive.ts"
  Cuando ejecuto la acción de archivado
  Entonces "archive-event.api-action.ts" cambia el estado del evento a archivado
  Y el evento no aparece en listados activos
```

### Flujos alternativos y errores

```gherkin
Escenario: Validación de formulario fallida (crear/actualizar)
  Dado que faltan campos requeridos o tienen formato inválido
  Cuando envío el formulario
  Entonces veo errores específicos bajo los campos afectados
  Y no se persisten los cambios

Escenario: Evento no encontrado (detalle/actualizar)
  Dado que el ID no existe o fue archivado/ eliminado
  Cuando el loader "get-event-by-id.loader.ts" consulta
  Entonces se muestra un mensaje "Evento no encontrado"

Escenario: Error de persistencia (crear/actualizar/archivar)
  Dado que el servidor devuelve un error
  Cuando ejecuto la acción correspondiente
  Entonces veo un mensaje "No fue posible guardar los cambios, intenta de nuevo"
```

## Notas técnicas y buenas prácticas
- Validación: aplicar esquemas consistentes con el dominio; feedback claro de errores.
- UX: vistas list/grid; filtros usables; estados de carga y éxito/error.
- Persistencia: idempotencia donde aplique; control de concurrencia en edición.
- Seguridad: proteger rutas con guards; validar permisos para acciones.
- Observabilidad: registrar acciones clave (listar, crear, actualizar, archivar) sin datos sensibles.
