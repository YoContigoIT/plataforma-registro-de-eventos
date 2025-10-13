# Eliminación de Usuario

## Objetivo
Eliminar un usuario del sistema cuando sea necesario (duplicado, baja, error).

## Alcance
- Confirmación y ejecución de eliminación.
- Actualización del listado.

## Componentes involucrados
- Presentación (UI)
  - Acciones desde listado/detalle
- SSR (Loaders/Actions)
  - Action: `app/presentation/usuarios/api/delete-user.action.ts`
- Dominio/Infraestructura
  - `app/domain/*`, `app/infrastructure/*`, `prisma/schema.prisma`

## Escenarios (BDD)

```gherkin
Escenario: Eliminar usuario exitosamente
  Dado que confirmo la eliminación en la UI
  Cuando ejecuto "delete-user.action.ts"
  Entonces el usuario se elimina
  Y el listado se actualiza

Escenario: Cancelar eliminación
  Dado que estoy en el diálogo de confirmación
  Cuando decido cancelar
  Entonces no se realiza ninguna acción
```

## Flujos alternativos y errores

```gherkin
Escenario: Error de persistencia
  Dado que el servidor devuelve error
  Cuando ejecuto la acción de eliminación
  Entonces se muestra "No fue posible eliminar el usuario, intenta de nuevo"
```