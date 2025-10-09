# Detalle de usuario

## Objetivo
Presentar la información completa de un usuario mediante tarjetas y secciones.

## Alcance
- Carga del detalle.
- Presentación en tarjetas informativas.

## Componentes involucrados
- Presentación (UI)
  - Ruta: `app/presentation/usuarios/routes/user-by-id.tsx`
  - Cards: `cards/user-header.tsx`, `cards/user-details.tsx`, `cards/account-info.tsx`, `cards/user-stats.tsx`
- SSR (Loaders/Actions)
  - Loader: `app/presentation/usuarios/api/get-user-by-id.loader.ts`
- Dominio/Infraestructura
  - `app/domain/*`, `app/infrastructure/*`, `prisma/schema.prisma`

## Escenarios (BDD)

```gherkin
Escenario: Ver detalle de usuario
  Dado que selecciono un usuario desde el listado
  Cuando "get-user-by-id.loader.ts" trae sus datos
  Entonces la UI muestra tarjetas con su información

Escenario: Usuario no encontrado
  Dado que el ID proporcionado no existe
  Cuando el loader consulta
  Entonces se muestra "Usuario no encontrado" y navegación segura
```