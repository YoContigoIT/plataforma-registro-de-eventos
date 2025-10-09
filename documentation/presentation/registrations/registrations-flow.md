# Documentación BDD: Gestión de registros (Registrations)

## Navegación
- [Listado y filtros de registros](./registrations-list.md)
- [Enviar invitaciones](./send-invitations.md)
- [Reenviar invitación](./resend-invite.md)
- [Eliminar registro](./delete-registration.md)

## Objetivo
Permitir administrar registros de asistentes: listar y filtrar registros, enviar invitaciones, reenviar invitaciones y eliminar registros, con paneles de detalle y métricas de estado.

## Alcance
- Listado, filtros y detalle de registros.
- Envío inicial de invitaciones.
- Reenvío de invitaciones.
- Eliminación de registros.

## Componentes involucrados

- Presentación (UI)
  - Rutas: `app/presentation/registrations/routes/`
    - `registrations.tsx` (listado y filtros)
    - `send-invitations.tsx` (envío de invitaciones)
    - `resend-invite.tsx` (reenvío de invitación)
    - `delete-registration.tsx` (eliminar registro)
  - Componentes:
    - `registration-table.tsx` (tabla)
    - `registration-filters.tsx`, `registration-filters-content.tsx` (filtros)
    - `registration-details-sheet.tsx` (panel de detalle)
    - `status-cards.tsx`, `status-cards-skeleton.tsx` (resumen de estados)
    - `invitation-form.tsx` (formulario de envío de invitaciones)
    - `event-selector.tsx`, `event-combobox.tsx` (selección de evento)
    - `mass-actions.tsx` (acciones masivas: reenviar, eliminar)
  - Hook:
    - `registration-filters.hook.ts` (gestión de filtros)

- Acciones y Carga de Datos (SSR: Loaders/Actions)
  - `app/presentation/registrations/api/loaders.ts` (cargar listado, soportes de datos)
  - `app/presentation/registrations/api/actions.ts` (enviar, reenviar, eliminar)

- Dominio e Infraestructura relacionadas
  - Dominio: `app/domain/{dtos,entities,repositories,services}`
  - Infraestructura: `app/infrastructure/{db,repositories,services}`
  - ORM/Esquema: `prisma/schema.prisma`
  - Middleware/Guards: `app/presentation/guards/`, `app/infrastructure/middleware/`

## Flujo general

1. Listado y filtros
   - `registrations.tsx` obtiene datos mediante `api/loaders.ts`.
   - La UI presenta `registration-table.tsx`, filtros y `status-cards.tsx`.
2. Ver detalle
   - Al seleccionar un registro, se abre `registration-details-sheet.tsx` con la información relevante.
3. Enviar invitaciones
   - `send-invitations.tsx` renderiza `invitation-form.tsx`, con selección de evento (`event-selector.tsx`, `event-combobox.tsx`).
   - Envío con `api/actions.ts`.
4. Reenviar invitación
   - `resend-invite.tsx` o `mass-actions.tsx` disparan reenvío para registros seleccionados usando `api/actions.ts`.
5. Eliminar registro
   - `delete-registration.tsx` o `mass-actions.tsx` ejecutan la eliminación mediante `api/actions.ts`.
   - La UI actualiza la tabla y métricas.

## Característica completa (BDD)

```gherkin
Característica: Administración de registros de asistentes
  Como operador del evento
  Quiero listar, filtrar, invitar, reenviar invitaciones y eliminar registros
  Para mantener actualizada la información de participación

  Antecedentes:
    Dado que estoy autenticado con permisos adecuados
    Y el sistema puede cargar registros y ejecutar acciones
    Y existen formularios y filtros con validación
```

### Escenarios principales

```gherkin
Escenario: Listar y filtrar registros
  Dado que estoy en "registrations.tsx"
  Cuando "api/loaders.ts" carga los registros
  Entonces veo la tabla y métricas en "registration-table.tsx" y "status-cards.tsx"
  Y puedo ajustar criterios en "registration-filters.tsx"

Escenario: Enviar invitaciones
  Dado que completo "invitation-form.tsx" en "send-invitations.tsx"
  Cuando envío el formulario
  Entonces "api/actions.ts" envía invitaciones a los destinatarios seleccionados
  Y veo confirmación en la UI

Escenario: Reenviar invitación
  Dado que selecciono uno o más registros
  Cuando ejecuto reenvío desde "resend-invite.tsx" o "mass-actions.tsx"
  Entonces "api/actions.ts" procesa el reenvío
  Y la UI confirma la operación

Escenario: Eliminar registro
  Dado que selecciono un registro
  Cuando ejecuto eliminación en "delete-registration.tsx" o "mass-actions.tsx"
  Entonces "api/actions.ts" elimina el registro
  Y la tabla se actualiza
```

### Flujos alternativos y errores

```gherkin
Escenario: Sin resultados en el listado
  Dado que aplico filtros restrictivos
  Cuando el loader retorna vacío
  Entonces veo "No hay registros que coincidan"

Escenario: Validación fallida en invitaciones
  Dado que el formulario tiene campos requeridos faltantes o inválidos
  Cuando envío el formulario
  Entonces la UI muestra errores y no se procesan invitaciones

Escenario: Error al reenviar o eliminar
  Dado que el servidor devuelve un error
  Cuando ejecuto la acción
  Entonces veo "No fue posible completar la operación, intenta de nuevo"
```

## Notas técnicas y buenas prácticas
- Validación: esquemas consistentes; errores claros por campo y globales.
- UX: filtros usables; feedback de estados; panel de detalle y métricas.
- Persistencia: idempotencia donde aplique (no duplicar envíos); control de concurrencia.
- Seguridad: proteger acciones; validar permisos; no exponer datos sensibles.
- Observabilidad: registrar acciones clave (envío, reenvío, eliminación) sin datos sensibles.

## Ver también
- [Guardias de registro](../guards/guards-flow.md)
- [Gestión de Eventos](../events/events-flow.md)
- [Gestión de Asistentes](../attendees/attendees-flow.md)