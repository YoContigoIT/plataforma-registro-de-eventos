# Confirmación de registro

## Objetivo
Presentar una confirmación del registro, mostrando detalles del evento y el estado del asistente.

## Componentes involucrados
- Ruta: `app/presentation/attendees/routes/registration-confirm.tsx`

## Escenarios (BDD)

```gherkin
Característica: Confirmación del registro
  Como invitado registrado
  Requiero ver la confirmación de mi participación
  Para conocer mi estado y detalles del evento

Antecedentes:
  Dado que mi registro fue procesado exitosamente

Escenario: Visualización de confirmación
  Cuando accedo a "registration-confirm.tsx"
  Entonces veo un resumen del evento y mi estado
  Y se ofrece la opción de regresar o continuar con pasos siguientes
```