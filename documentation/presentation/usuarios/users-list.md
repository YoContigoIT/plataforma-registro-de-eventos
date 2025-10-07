# Listado de usuarios

## Objetivo
Visualizar el listado de usuarios con soporte de vistas (lista y grid).

## Alcance
- Carga del listado.
- Presentación en list/grid y navegación a detalle.

## Componentes involucrados
- Presentación (UI)
  - Ruta: `app/presentation/usuarios/routes/users.tsx`
  - Vistas: `users-list-view.tsx`, `users-grid-view.tsx`
- SSR (Loaders/Actions)
  - Loader: `app/presentation/usuarios/api/get-all-users.loader.ts`
- Dominio/Infraestructura
  - `app/domain/*`, `app/infrastructure/*`, `prisma/schema.prisma`

## Escenarios (BDD)

```gherkin
Escenario: Ver listado de usuarios
  Dado que accedo a "users.tsx"
  Cuando "get-all-users.loader.ts" trae los usuarios
  Entonces veo la lista y puedo alternar vista grid

Escenario: Navegar a detalle
  Dado que selecciono un usuario
  Cuando navego al detalle
  Entonces se presenta la información completa del usuario
```

## Flujos alternativos y errores

```gherkin
Escenario: Sin resultados
  Dado que no hay usuarios cargados
  Cuando el loader retorna vacío
  Entonces la UI muestra "No hay usuarios disponibles"

Escenario: Error de carga
  Dado que el servidor falla al traer usuarios
  Cuando el loader se ejecuta
  Entonces se muestra "No fue posible cargar los usuarios"
```