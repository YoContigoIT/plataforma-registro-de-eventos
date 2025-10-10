# Creación de evento

## Objetivo
Permitir la creación de nuevos eventos mediante un formulario dinámico.

## Alcance
- Formulario para crear un evento.
- Persistencia del evento y feedback UX.

## Componentes involucrados
- Presentación (UI)
  - Ruta: `app/presentation/events/routes/create.tsx`
  - Form: `event-form.tsx`, `form-builder.tsx`, `sortable-form-field.tsx`
- SSR (Loaders/Actions)
  - Action: `app/presentation/events/api/actions/create-event.api-action.ts`
- Dominio/Infraestructura
  - `app/domain/*`, `app/infrastructure/*`, `prisma/schema.prisma`

## Escenarios (BDD)

```gherkin
Escenario: Crear evento exitosamente
  Dado que completo "event-form.tsx" con datos válidos
  Cuando envío el formulario
  Entonces "create-event.api-action.ts" guarda el nuevo evento
  Y veo confirmación y redirección al detalle/listado

Escenario: Validación fallida
  Dado que hay campos requeridos vacíos o inválidos
  Cuando envío el formulario
  Entonces veo errores específicos bajo los campos
  Y no se crea el evento
```

## Flujos alternativos y errores

```gherkin
Escenario: Error de persistencia
  Dado que el servidor responde con error
  Cuando intento crear el evento
  Entonces se muestra "No fue posible crear el evento, intenta de nuevo"
```