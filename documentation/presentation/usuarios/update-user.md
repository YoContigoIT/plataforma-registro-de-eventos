# Actualización de usuario

## Objetivo
Editar un usuario existente con datos precargados y validación.

## Alcance
- Precarga de datos.
- Actualización y feedback UX.

## Componentes involucrados
- Presentación (UI)
  - Ruta: `app/presentation/usuarios/routes/update-user.tsx`
  - Form: `forms/user-form.tsx`
  - Hook: `use-update-user-form.hook.ts`
- SSR (Loaders/Actions)
  - Loader: `app/presentation/usuarios/api/get-user-by-id.loader.ts`
  - Action: `app/presentation/usuarios/api/update-user.action.ts`
- Dominio/Infraestructura
  - `app/domain/*`, `app/infrastructure/*`, `prisma/schema.prisma`

## Escenarios (BDD)

```gherkin
Escenario: Actualizar usuario exitosamente
  Dado que el formulario se precarga con "get-user-by-id.loader.ts"
  Cuando envío cambios válidos desde "update-user.tsx"
  Entonces "update-user.action.ts" guarda los cambios
  Y veo confirmación de actualización

Escenario: Usuario no encontrado
  Dado que el ID no existe
  Cuando el loader consulta
  Entonces veo "Usuario no encontrado" y retorno al listado
```

## Flujos alternativos y errores

```gherkin
Escenario: Validación fallida
  Dado que hay campos inválidos
  Cuando envío la actualización
  Entonces veo errores y no se guardan cambios

Escenario: Error de persistencia
  Dado que el servidor falla
  Cuando intento actualizar
  Entonces se muestra "No fue posible actualizar el usuario, intenta de nuevo"
```
