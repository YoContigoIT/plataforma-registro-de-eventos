# Ingreso al flujo de registro (Join)

## Objetivo
Permitir el ingreso al proceso de registro desde un enlace de invitación, preparando el contexto para la captura de datos.

## Componentes involucrados
- Ruta: `app/presentation/attendees/routes/join.tsx`
- Loader/acciones: `app/presentation/attendees/api/loaders.ts` 

## Escenarios (BDD)

```gherkin
Característica: Ingresa al flujo de registro
  Como invitado
  Requiero acceder al flujo de registro desde mi invitación
  Para completar mi participación en el evento

Antecedentes:
  Dado que tengo un enlace de invitación válido

Escenario: Ingreso exitoso
  Cuando accedo a la ruta "join"
  Entonces se prepara el contexto de registro (evento/invitación)
  Y se me redirige o presenta el formulario de registro

Escenario: Invitación no válida
  Dado que el enlace de invitación es inválido o expiró
  Cuando intento ingresar al flujo
  Entonces se muestra un mensaje informando la situación
  Y no se me permite avanzar
```