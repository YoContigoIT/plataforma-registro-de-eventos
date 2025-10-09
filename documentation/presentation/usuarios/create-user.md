# Creación de usuario

## Objetivo
Crear un nuevo usuario del sistema mediante un formulario con validación.

## Alcance
- Formulario de creación.
- Persistencia y confirmación.

## Componentes involucrados
- Presentación (UI)
  - Ruta: `app/presentation/usuarios/routes/create-user.tsx`
  - Form: `forms/user-form.tsx`
  - Hook: `use-create-user-form.hook.ts`
- SSR (Loaders/Actions)
  - Action: `app/presentation/usuarios/api/create-user.action.ts`
- Dominio/Infraestructura
  - `app/domain/*`, `app/infrastructure/*`, `prisma/schema.prisma`

## Escenarios (BDD)

```gherkin
Escenario: Crear usuario exitosamente
  Dado que completo "user-form.tsx" con datos válidos
  Cuando envío el formulario desde "create-user.tsx"
  Entonces "create-user.action.ts" guarda el nuevo usuario
  Y veo confirmación en la UI

Escenario: Validación fallida
  Dado que faltan campos requeridos o tienen formato inválido
  Cuando envío el formulario
  Entonces veo errores específicos bajo los campos
  Y no se crea el usuario
```

## Flujos alternativos y errores

```gherkin
Escenario: Error de persistencia
  Dado que el servidor responde con error
  Cuando intento crear el usuario
  Entonces se muestra "No fue posible crear el usuario, intenta de nuevo"
```

## Navegación
- [Flujo general](./users-flow.md)
- [Listado de usuarios](./users-list.md)
- [Detalle de usuario](./user-detail.md)
- [Actualización de usuario](./update-user.md)
- [Eliminación de usuario](./delete-user.md)

## Ver también
- [Gestión de Registros](../registrations/registrations-flow.md)
- [Guardias de registro](../guards/guards-flow.md)