# Detalles de invitación y evento

## Objetivo
Mostrar información de la invitación y del evento al que se ha sido invitado, verificando la validez del token y el estado de la invitación.

## Componentes involucrados
- Ruta: `app/presentation/attendees/routes/invite-details.tsx`
- Loader: `app/presentation/attendees/api/get-invitation-data.loader.tsx`
- UI: `app/presentation/attendees/components/forms/event-details-panel.tsx`
- Otros loaders: `app/presentation/attendees/api/loaders.ts`

## Escenarios (BDD)

```gherkin
Característica: Mostrar detalles de invitación
  Como invitado
  Requiero ver detalles del evento y estado de mi invitación
  Para decidir si completo mi registro

Antecedentes:
  Dado que accedo con un token de invitación

Escenario: Carga exitosa de detalles
  Cuando el loader obtiene los datos del evento y mi estado de invitación
  Entonces veo el panel con nombre del evento, fecha, ubicación y estado

Escenario: Invitación inválida
  Dado que el token no existe o ha expirado
  Cuando el loader intenta obtener los datos
  Entonces se muestra un mensaje indicando que la invitación no es válida
  Y no se permite continuar al formulario
```