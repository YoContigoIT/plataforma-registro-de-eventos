# Documentación BDD: Guardias de registro y verificación

## Navegación
- [Verificación de registro](./verify-registration.md)
- [Creación de registro](./create-registration.md)
- [Actualización de registro](./update-registration.md)
- [Check-in de asistente](./check-in.md)

## Objetivo
Orquestar el flujo para verificar, crear, actualizar y hacer check-in de registros de asistentes, asegurando una experiencia guiada, validaciones consistentes y acciones seguras.

## Alcance
- Verificación de registro por email/código.
- Creación de registro guiada por pasos.
- Actualización de datos de registro existente.
- Check-in de asistente en el evento.

## Componentes involucrados

- Presentación (UI)
  - Rutas: `app/presentation/guards/routes/`
    - `verify.tsx` (verificar registro)
    - `create-registration.tsx` (crear registro)
    - `update-registration.tsx` (actualizar registro)
  - Acciones (rutas): `app/presentation/guards/routes/actions/`
    - `check-in.action.tsx` (ejecuta check-in)
    - `create-registration.action.tsx` (crear registro)
    - `update-registration.action.tsx` (actualizar registro)
  - Componentes:
    - `components/verify-registration.tsx` (panel de verificación)
    - `components/email-lookup.tsx` (búsqueda por email)
    - `components/register-attendee-form.tsx` (form de registro)
    - `components/steps/email-input-step.tsx` (paso: email)
    - `components/steps/event-selection-step.tsx` (paso: selección de evento)
    - `components/steps/registration-form-step.tsx` (paso: formulario)
    - `components/ui/registration-layout.tsx` (layout general)
    - `components/ui/registration-info-card.tsx` (info del registro)
    - `components/ui/registration-actions.tsx` (acciones en la UI)
- API/SSR
  - `app/presentation/guards/api/loaders.ts` (cargas auxiliares)
  - `app/presentation/guards/api/check-in.api.ts` (servicio de check-in)
  - `app/presentation/guards/api/create-registration.api.ts` (servicio de creación)
  - `app/presentation/guards/api/update-registration.api.ts` (servicio de actualización)
- Dominio e Infraestructura relacionadas
  - Dominio: `app/domain/{dtos,entities,repositories,services}`
  - Infraestructura: `app/infrastructure/{db,repositories,services}`
  - ORM/Esquema: `prisma/schema.prisma`
  - Middleware/Guards: `app/presentation/guards/`, `app/infrastructure/middleware/`

## Flujo general

1. Verificar registro existente
   - El usuario ingresa email/código en `verify.tsx`.
   - La UI consulta con `api/loaders.ts` y muestra resultado en `verify-registration.tsx`.
2. Crear registro
   - Desde verificación sin registro o vía acceso directo a `create-registration.tsx`.
   - Pasos guiados: email → selección de evento → formulario → persistencia con `create-registration.action.tsx`/`create-registration.api.ts`.
3. Actualizar registro
   - Precarga de datos con `api/loaders.ts` y edición en `update-registration.tsx`.
   - Persistencia con `update-registration.action.tsx`/`update-registration.api.ts`.
4. Check-in
   - Ejecución de `check-in.action.tsx` que delega a `check-in.api.ts`.
   - Feedback en la UI (`registration-info-card.tsx`) y actualización del estado.

## Característica completa (BDD)

```gherkin
Característica: Guardias de registro de asistentes
  Como staff del evento
  Quiero verificar, crear, actualizar y realizar el check-in de registros
  Para asegurar que los asistentes estén correctamente gestionados

  Antecedentes:
    Dado que estoy autenticado con permisos adecuados
    Y el sistema puede consultar y persistir registros
    Y existen formularios con validación
    Y hay acciones para crear, actualizar y registrar el check-in
```

### Escenarios principales

```gherkin
Escenario: Verificar registro por email
  Dado que ingreso un email en "verify.tsx"
  Cuando el sistema consulta con "api/loaders.ts"
  Entonces veo en "verify-registration.tsx" si existe o no el registro

Escenario: Crear registro guiado
  Dado que no existe registro para el email
  Cuando avanzo por los pasos (email → evento → formulario)
  Entonces "create-registration.action.tsx" crea el registro
  Y veo confirmación en "registration-info-card.tsx"

Escenario: Actualizar registro existente
  Dado que cargo datos del registro con "api/loaders.ts"
  Cuando envío cambios válidos desde "update-registration.tsx"
  Entonces "update-registration.action.tsx" actualiza el registro

Escenario: Check-in del asistente
  Dado que el asistente se presenta en el evento
  Cuando ejecuto "check-in.action.tsx"
  Entonces "check-in.api.ts" marca el registro como presente
  Y la UI muestra estado actualizado
```

### Flujos alternativos y errores

```gherkin
Escenario: Registro no encontrado
  Dado que el email no corresponde a un registro
  Cuando consulto en verificación
  Entonces veo "No se encontró registro" y opción para crear

Escenario: Validación de formulario fallida (crear/actualizar)
  Dado que faltan campos o tienen formato inválido
  Cuando envío el formulario
  Entonces veo errores bajo los campos afectados
  Y no se persisten los cambios

Escenario: Error de persistencia (crear/actualizar/check-in)
  Dado que el servidor devuelve un error
  Cuando ejecuto la acción correspondiente
  Entonces veo "No fue posible procesar la operación, intenta de nuevo"
```

## Notas técnicas y buenas prácticas
- Validación: esquemas alineados al dominio; feedback claro y consistente.
- UX: pasos guiados; layout unificado; estados de carga/éxito/error.
- Persistencia: idempotencia donde aplique; manejo de concurrencia y reintentos.
- Seguridad: proteger rutas; validar permisos; evitar exponer datos sensibles.
- Observabilidad: registrar acciones clave (verificación, creación, actualización, check-in) sin datos sensibles.

## Ver también
- [Gestión de Eventos](../events/events-flow.md)
- [Gestión de Asistentes](../attendees/attendees-flow.md)