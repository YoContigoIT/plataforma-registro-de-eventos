# Documentación BDD: Gestión de usuarios 

## Navegación
- [Listado de usuarios](./users-list.md)
- [Detalle de usuario](./user-detail.md)
- [Creación de usuario](./create-user.md)
- [Actualización de usuario](./update-user.md)
- [Eliminación de usuario](./delete-user.md)

## Objetivo
Administrar usuarios del sistema: listar, consultar detalle, crear, actualizar y eliminar usuarios, con formularios y componentes de presentación consistentes.

## Alcance
- Listado de usuarios con vistas en lista y grid.
- Consulta de detalle de usuario.
- Creación y actualización de usuario con validación.
- Eliminación de usuario.

## Componentes involucrados

- Presentación (UI)
  - Rutas: `app/presentation/usuarios/routes/`
    - `users.tsx` (listado de usuarios)
    - `user-by-id.tsx` (detalle de usuario)
    - `create-user.tsx` (crear usuario)
    - `update-user.tsx` (actualizar usuario)
  - Componentes:
    - Vistas: `users-list-view.tsx`, `users-grid-view.tsx`
    - Formulario: `forms/user-form.tsx`
    - Cards: `cards/user-header.tsx`, `cards/user-details.tsx`, `cards/account-info.tsx`, `cards/user-stats.tsx`
  - Hooks:
    - `use-create-user-form.hook.ts`
    - `use-update-user-form.hook.ts`

- Acciones y Carga de Datos (SSR: Loaders/Actions)
  - Loaders:
    - `get-all-users.loader.ts` (cargar listado)
    - `get-user-by-id.loader.ts` (cargar detalle/edición)
  - Actions:
    - `create-user.action.ts`
    - `update-user.action.ts`
    - `delete-user.action.ts`

- Dominio e Infraestructura relacionadas
  - Dominio: `app/domain/{dtos,entities,repositories,services}`
  - Infraestructura: `app/infrastructure/{db,repositories,services}`
  - ORM/Esquema: `prisma/schema.prisma`
  - Middleware/Guards: `app/presentation/guards/`, `app/infrastructure/middleware/`

## Flujo general

1. Listado
   - La ruta `users.tsx` usa `get-all-users.loader.ts` para cargar usuarios.
   - La UI alterna entre `users-list-view.tsx` y `users-grid-view.tsx`.
2. Detalle
   - `user-by-id.tsx` utiliza `get-user-by-id.loader.ts` para obtener datos.
   - Se muestran tarjetas de información (`user-details.tsx`, `account-info.tsx`, `user-stats.tsx`, `user-header.tsx`).
3. Crear usuario
   - `create-user.tsx` renderiza `user-form.tsx` y gestiona estado con `use-create-user-form.hook.ts`.
   - Persistencia con `create-user.action.ts`.
4. Actualizar usuario
   - `update-user.tsx` precarga datos con `get-user-by-id.loader.ts`.
   - Persistencia con `update-user.action.ts`, estado con `use-update-user-form.hook.ts`.
5. Eliminar usuario
   - La UI dispara `delete-user.action.ts` desde detalle o listado para eliminar.

## Característica completa (BDD)

```gherkin
Característica: Gestión de usuarios del sistema
  Como administrador
  Quiero listar, consultar, crear, actualizar y eliminar usuarios
  Para mantener la base de usuarios organizada y actualizada

  Antecedentes:
    Dado que estoy autenticado con permisos adecuados
    Y el sistema puede cargar usuarios y ejecutar acciones
    Y existen formularios con validación para crear/editar
```

### Escenarios principales

```gherkin
Escenario: Ver listado de usuarios
  Dado que accedo a "users.tsx"
  Cuando "get-all-users.loader.ts" carga los usuarios
  Entonces veo la lista o grid con la información básica

Escenario: Ver detalle de usuario
  Dado que selecciono un usuario del listado
  Cuando "get-user-by-id.loader.ts" obtiene sus datos
  Entonces la UI muestra "user-details.tsx" y tarjetas informativas

Escenario: Crear usuario
  Dado que completo "user-form.tsx" en "create-user.tsx" con datos válidos
  Cuando envío el formulario
  Entonces "create-user.action.ts" persiste el nuevo usuario
  Y veo confirmación en la UI

Escenario: Actualizar usuario
  Dado que estoy en "update-user.tsx" con datos precargados
  Cuando envío cambios válidos
  Entonces "update-user.action.ts" guarda la actualización

Escenario: Eliminar usuario
  Dado que confirmo la eliminación en la UI
  Cuando ejecuto "delete-user.action.ts"
  Entonces el usuario se elimina y la lista se actualiza
```

### Flujos alternativos y errores

```gherkin
Escenario: Validación fallida (crear/actualizar)
  Dado que hay campos requeridos faltantes o inválidos
  Cuando envío el formulario
  Entonces veo errores específicos por campo y no se persiste

Escenario: Usuario no encontrado (detalle/actualizar)
  Dado que el ID no existe
  Cuando el loader consulta
  Entonces se muestra "Usuario no encontrado" y navegación segura

Escenario: Error de persistencia (crear/actualizar/eliminar)
  Dado que el servidor devuelve error
  Cuando ejecuto la acción correspondiente
  Entonces veo "No fue posible completar la operación, intenta de nuevo"
```

## Notas técnicas y buenas prácticas
- Validación: esquemas consistentes; mensajes claros en campos y globales.
- UX: vistas list/grid; tarjetas informativas; estados de carga/éxito/error.
- Persistencia: idempotencia donde aplique; control de concurrencia en edición.
- Seguridad: proteger rutas y acciones; validar permisos; evitar exponer datos sensibles.
- Observabilidad: registrar acciones clave (listar, crear, actualizar, eliminar) sin datos sensibles.
