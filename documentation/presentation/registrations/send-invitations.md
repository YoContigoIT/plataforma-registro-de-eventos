# Enviar invitaciones

## Objetivo
Configurar y enviar invitaciones a potenciales asistentes para un evento seleccionado.

## Alcance
- Selección de evento.
- Configuración de destinatarios y contenido básico.
- Envío y confirmación.

## Componentes involucrados
- Presentación (UI)
  - Ruta: `app/presentation/registrations/routes/send-invitations.tsx`
  - Form: `invitation-form.tsx`
  - Apoyos: `event-selector.tsx`, `event-combobox.tsx`
- SSR (Loaders/Actions)
  - Action: `app/presentation/registrations/api/actions.ts`
  - Loader: `app/presentation/registrations/api/loaders.ts` (apoyos)
- Dominio/Infraestructura
  - `app/domain/*`, `app/infrastructure/*`, `prisma/schema.prisma`

## Escenarios (BDD)

```gherkin
Escenario: Enviar invitaciones exitosamente
  Dado que completo "invitation-form.tsx" con datos válidos
  Y selecciono un evento con "event-selector.tsx"
  Cuando envío el formulario desde "send-invitations.tsx"
  Entonces "api/actions.ts" procesa el envío
  Y la UI confirma la operación

Escenario: Selección de evento requerida
  Dado que no he seleccionado un evento
  Cuando intento enviar
  Entonces veo error y no se procesan invitaciones
```

## Flujos alternativos y errores

```gherkin
Escenario: Validación fallida
  Dado que hay destinatarios o campos inválidos
  Cuando envío el formulario
  Entonces veo errores y no se realiza el envío

Escenario: Error de persistencia
  Dado que el servidor devuelve error
  Cuando ejecuto la acción de envío
  Entonces se muestra "No fue posible enviar las invitaciones, intenta de nuevo"
```