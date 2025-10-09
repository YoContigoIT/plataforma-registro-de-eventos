# Formulario de Registro y Respuestas

## Objetivo
Capturar información relevante del invitado y persistir las respuestas del formulario de registro para el evento.

## Componentes involucrados
- Ruta: `app/presentation/attendees/routes/form-response.tsx`
- UI (formularios):
  - `app/presentation/attendees/components/forms/registration-form.tsx`
  - `app/presentation/attendees/components/forms/registration-form-handler.tsx`
- Hook: `app/presentation/attendees/hooks/useRegistrationForm.tsx`
- Acción: `app/presentation/attendees/api/create-form-response.action.ts`

## Escenarios (BDD)

```gherkin
Característica: Capturar y persistir respuestas del formulario
  Como invitado
  Requiero completar el formulario de registro
  Para guardar mi información y avanzar en el proceso

Antecedentes:
  Dado que tengo una invitación válida y puedo acceder al formulario

Escenario: Envío exitoso
  Dado que completo los campos requeridos con información válida
  Cuando envío el formulario
  Entonces se persisten las respuestas con "create-form-response.action.ts"
  Y el estado de mi registro se actualiza

Escenario: Validación fallida
  Dado que dejo campos requeridos vacíos o con formato incorrecto
  Cuando intento enviar el formulario
  Entonces se muestran errores específicos bajo los campos
  Y no se persiste ninguna respuesta
```