# Documentación BDD: Gestión de Asistentes (Attendees)

## Navegación

- [Detalles de invitación](./invite-details.md)
- [Ingreso al flujo de registro](./join.md)
- [Formulario de registro y respuestas](./form-response.md)
- [Creación de asistente](./create-attendee.md)
- [Confirmación de registro](./registration-confirm.md)
- [Actualización de respuestas](./update-form-response.md)

## Objetivo
Permitir que una persona invitada a un evento consulte los detalles, complete su registro mediante un formulario, cree su perfil de asistente y confirme su participación. También contempla la actualización de respuestas del formulario cuando sea necesario.

## Alcance
- Consulta de detalles de invitación y evento.
- Registro de asistentes mediante formulario y persistencia de respuestas.
- Confirmación visual del registro y estado.
- Actualización de respuestas previamente registradas.

## Componentes involucrados

- Presentación (UI)
  - Rutas: `app/presentation/attendees/routes/`
    - `invite-details.tsx` (detalles de invitación y evento)
    - `join.tsx` (ingreso al flujo de registro por invitación)
    - `form-response.tsx` (formulario de registro)
    - `create-attendee.tsx` (alta de asistente)
    - `registration-confirm.tsx` (pantalla de confirmación)
    - `update-form-response.tsx` (edición de respuestas)
  - Formularios y UI:
    - `app/presentation/attendees/components/forms/event-details-panel.tsx`
    - `app/presentation/attendees/components/forms/registration-form.tsx`
    - `app/presentation/attendees/components/forms/registration-form-handler.tsx`
  - Hooks:
    - `app/presentation/attendees/hooks/useRegistrationForm.tsx`

- Acciones y Carga de Datos (SSR: Loaders/Actions)
  - API/SSR:
    - `app/presentation/attendees/api/get-invitation-data.loader.tsx` (cargar datos de invitación)
    - `app/presentation/attendees/api/loaders.ts` (cargas auxiliares)
    - `app/presentation/attendees/api/create-form-response.action.ts` (crear respuestas de formulario)
    - `app/presentation/attendees/api/update-form-response.action.ts` (actualizar respuestas)
    - `app/presentation/attendees/api/create-attendee.action.ts` (crear asistente)

- Dominio e Infraestructura relacionadas
  - Dominio: `app/domain/{dtos,entities,repositories,services}`
  - Infraestructura: `app/infrastructure/{db,repositories,services}`
  - ORM/Esquema: `prisma/schema.prisma`
  - Middleware/Guards: `app/presentation/guards/`, `app/infrastructure/middleware/`

## Flujo general

1. Invitación y acceso
   - El usuario accede con un enlace de invitación (token/ID), y el sistema carga detalles del evento y estado de la invitación.
2. Registro mediante formulario
   - Se presenta el formulario de registro con campos necesarios (p. ej., datos personales, preferencias).
   - El hook `useRegistrationForm` gestiona estado, validación y envío.
3. Persistencia de respuestas y alta de asistente
   - Se envían las respuestas a `create-form-response.action.ts`.
   - En caso de requerir alta explícita, se crea el asistente con `create-attendee.action.ts`.
4. Confirmación
   - Tras éxito, el usuario ve `registration-confirm.tsx` con detalles del registro.
5. Actualización de respuestas
   - Si el flujo lo permite, el usuario puede editar `update-form-response.tsx` usando `update-form-response.action.ts`.

## Característica completa (BDD)

```gherkin
Característica: Gestión de asistentes
  Como invitado a un evento
  Requiero revisar la invitación y registrarme
  Para confirmar mi asistencia y proporcionar la información requerida

  Antecedentes:
    Dado que accedo mediante un enlace de invitación válido
    Y el sistema puede cargar detalles del evento y mi estado de invitación
    Y existe un formulario de registro con validación apropiada
    Y hay acciones para persistir respuestas y crear mi registro como asistente
```

### Escenarios principales

```gherkin
Escenario: Ver detalles de invitación y evento
  Dado que accedo con un token de invitación válido
  Cuando el sistema carga datos con "get-invitation-data.loader.tsx"
  Entonces veo el panel de detalles del evento
  Y mi estado de invitación (pendiente/confirmado/expirado)

Escenario: Completar formulario de registro
  Dado que estoy en la pantalla de "Formulario de registro"
  Y se aplica validación a los campos requeridos
  Cuando envío el formulario
  Entonces las respuestas se guardan con "create-form-response.action.ts"
  Y se crea/actualiza mi estado de registro

Escenario: Alta de asistente
  Dado que ya proporcioné mis respuestas válidas
  Cuando se ejecuta "create-attendee.action.ts"
  Entonces se crea mi perfil de asistente asociado al evento
  Y mi registro queda en estado "confirmado" o "pendiente" según reglas

Escenario: Confirmación de registro
  Dado que mi registro fue procesado exitosamente
  Cuando accedo a "registration-confirm.tsx"
  Entonces veo una confirmación con los detalles del evento y mi participación

Escenario: Actualización de respuestas
  Dado que necesito corregir información del formulario
  Cuando accedo a "update-form-response.tsx"
  Y envío cambios con "update-form-response.action.ts"
  Entonces se actualizan mis respuestas
  Y veo una confirmación de actualización
```

### Flujos alternativos y errores

```gherkin
Escenario: Invitación inválida o expirada
  Dado que el token de invitación es inválido o ha expirado
  Cuando intento cargar los detalles con "get-invitation-data.loader.tsx"
  Entonces veo un mensaje informando que la invitación no es válida
  Y no puedo continuar con el registro

Escenario: Validación de formulario fallida
  Dado que completo el formulario con campos requeridos faltantes o formato inválido
  Cuando envío el formulario
  Entonces veo errores específicos bajo los campos afectados
  Y no se persisten las respuestas

Escenario: Error al crear asistente
  Dado que mis respuestas fueron guardadas
  Pero ocurre un error en "create-attendee.action.ts"
  Entonces veo un mensaje de error general ("No fue posible crear el asistente")
  Y puedo reintentar el proceso

Escenario: Error al actualizar respuestas
  Dado que intento modificar mis respuestas
  Cuando envío cambios
  Pero el servidor devuelve un error
  Entonces se muestra un mensaje ("No fue posible actualizar la información, intenta de nuevo")
```

## Notas técnicas y buenas prácticas

- Validación y UX:
  - Proveer mensajes claros en los campos y feedback general (toasts/banners).
  - Prevenir envíos múltiples con estados de “cargando”.
- Persistencia y consistencia:
  - Las acciones deben ser idempotentes cuando sea posible (evitar duplicados).
  - Manejar transacciones o consistencia entre respuestas y alta de asistente.
- Seguridad y privacidad:
  - No exponer datos sensibles del evento o del invitado en el cliente.
  - Validar token de invitación y su expiración en el servidor.
- Observabilidad:
  - Registrar (sin datos sensibles) eventos de carga de invitación, creación y actualización.