# Creación de Asistente

## Objetivo
Registrar al invitado como asistente del evento, asociando sus datos y respuestas al registro.

## Componentes involucrados
- Ruta: `app/presentation/attendees/routes/create-attendee.tsx`
- Acción: `app/presentation/attendees/api/create-attendee.action.ts`

## Escenarios (BDD)

```gherkin
Característica: Alta de asistente
  Como invitado que completó el formulario
  Requiero crear mi registro como asistente
  Para quedar formalmente asociado al evento

Antecedentes:
  Dado que mis respuestas del formulario fueron validadas y persistidas

Escenario: Creación exitosa
  Cuando se ejecuta "create-attendee.action.ts"
  Entonces se crea mi registro de asistente
  Y mi estado pasa a confirmado o pendiente según reglas

Escenario: Error en la creación
  Dado que hay un problema de servidor o datos inconsistentes
  Cuando se intenta crear el asistente
  Entonces se muestra un mensaje de error general
  Y puedo reintentar la operación
```