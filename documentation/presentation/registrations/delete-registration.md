# Eliminar registro

## Objetivo
Eliminar un registro de asistente cuando sea necesario (duplicado, cancelado, error).

## Alcance
- Confirmación y ejecución de eliminación.
- Actualización del listado y métricas.

## Componentes involucrados
- Presentación (UI)
  - Ruta: `app/presentation/registrations/routes/delete-registration.tsx`
  - Apoyo: `mass-actions.tsx` (eliminación múltiple desde listado)
- SSR (Loaders/Actions)
  - Action: `app/presentation/registrations/api/actions.ts`
- Dominio/Infraestructura
  - `app/domain/*`, `app/infrastructure/*`, `prisma/schema.prisma`

## Escenarios (BDD)

```gherkin
Escenario: Eliminar registro exitosamente
  Dado que confirmo la eliminación en la UI
  Cuando ejecuto la acción desde "delete-registration.tsx" o "mass-actions.tsx"
  Entonces "api/actions.ts" elimina el registro
  Y el listado y métricas se actualizan

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
  Entonces se muestra "No fue posible eliminar el registro, intenta de nuevo"
```
