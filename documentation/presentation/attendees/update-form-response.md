# Actualización de respuestas del formulario

## Objetivo
Permitir que el invitado modifique respuestas previamente guardadas, manteniendo la consistencia del registro.

## Componentes involucrados
- Ruta: `app/presentation/attendees/routes/update-form-response.tsx`
- Acción: `app/presentation/attendees/api/update-form-response.action.ts`

## Escenarios (BDD)

```gherkin
Característica: Editar respuestas de registro
  Como invitado
  Requiero actualizar mis respuestas del formulario
  Para corregir información o agregar datos faltantes

Antecedentes:
  Dado que ya tengo respuestas guardadas y acceso autorizado a la edición

Escenario: Actualización exitosa
  Cuando envío mis cambios en "update-form-response.tsx"
  Entonces se persisten con "update-form-response.action.ts"
  Y veo una confirmación de actualización

Escenario: Error en la actualización
  Dado que ocurre un error de servidor o validación
  Cuando intento guardar los cambios
  Entonces se muestra un mensaje de error
  Y puedo reintentar después de corregir los datos
```