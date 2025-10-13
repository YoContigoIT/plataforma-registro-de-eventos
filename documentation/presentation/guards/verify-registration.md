# Verificación de registro

## Objetivo
Confirmar si existe un registro de asistente mediante búsqueda por email/código y orientar al siguiente paso (crear, actualizar o check-in).

## Alcance
- Entrada de email/código.
- Consulta y presentación del resultado.
- Navegación al flujo correspondiente.

## Componentes involucrados
- Presentación (UI)
  - Ruta: `app/presentation/guards/routes/verify.tsx`
  - Componentes: `components/verify-registration.tsx`, `components/email-lookup.tsx`
  - UI: `components/ui/registration-layout.tsx`, `components/ui/registration-info-card.tsx`, `components/ui/registration-actions.tsx`
- SSR (Loaders/Actions)
  - Loader/servicios: `app/presentation/guards/api/loaders.ts` (búsqueda y precarga)
- Dominio/Infraestructura
  - `app/domain/*`, `app/infrastructure/*`, `prisma/schema.prisma`

## Escenarios (BDD)

```gherkin
Escenario: Verificar por email
  Dado que ingreso un email válido
  Cuando consulto en "verify.tsx"
  Entonces "api/loaders.ts" devuelve el estado del registro
  Y veo detalle en "verify-registration.tsx"

Escenario: Registro inexistente
  Dado que no existe registro para el email
  Cuando consulto
  Entonces la UI ofrece "Crear registro" y guía al flujo de creación
```

## Flujos alternativos y errores

```gherkin
Escenario: Email inválido
  Dado que el email no tiene formato correcto
  Cuando intento verificar
  Entonces se muestra error de validación y no se consulta

Escenario: Error de carga
  Dado que el servidor falla
  Cuando consulto el registro
  Entonces veo "No fue posible verificar el registro, intenta de nuevo"
```
