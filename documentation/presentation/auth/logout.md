# Documentación BDD: Cierre de Sesión (Logout)

## Objetivo
Permitir a los usuarios cerrar su sesión de forma segura, invalidando credenciales/tokens y limpiando cualquier dato de sesión en el cliente/servidor, redirigiendo a la pantalla de login.

## Alcance
- Acción de logout desde UI.
- Comunicación con el servicio para invalidar sesión/token.
- Limpieza de almacenamiento y redirección.
- Comportamiento seguro ante tokens inválidos o expirados.

## Componentes involucrados por capas

- Presentación (UI)
  - Botón/acción de “Cerrar Sesión”: `app/presentation/auth/`
  - Guards/redirecciones post-logout: `app/presentation/guards/`
  - Layout/páginas del panel: `app/presentation/panel/`

- Dominio
  - Servicios y repositorios relacionados con sesión/usuario: `app/domain/services/`, `app/domain/repositories/`

- Infraestructura
  - Servicio de cierre de sesión: `app/infrastructure/auth/`
  - Middleware (limpieza de sesión/cookies): `app/infrastructure/middleware/`
  - Configuración de entorno: `app/infrastructure/config/`

- Compartidos
  - Hooks (acciones, estado): `app/shared/hooks/`
  - UI y utilidades (toasts, storage): `app/shared/components/`, `app/shared/lib/`

- Servidor y enrutamiento
  - App server (SSR): `server/app.ts`, `server.js`
  - Configuración de enrutado: `react-router.config.ts`, `app/routes.ts`

## Estructura de escenarios (Gherkin)

```gherkin
Característica: Cierre de sesión
  Como usuario autenticado
  Requiero poder cerrar mi sesión
  Para proteger mi cuenta en dispositivos compartidos

  Antecedentes:
    Dado que estoy autenticado en la aplicación
    Y existe un servicio de cierre de sesión que invalida la sesión/token
```

### Flujo principal: Cierre de sesión exitoso

```gherkin
Escenario: Cierre de sesión exitoso
  Dado que estoy autenticado en la aplicación
  Cuando presiono el botón "Cerrar Sesión"
  Y el servicio de cierre de sesión invalida la sesión/token
  Entonces se eliminan mis datos de sesión del dispositivo/servidor
  Y soy redirigido a la pantalla de "Login"
```

### Flujos alternativos y errores

```gherkin
Escenario: Token inválido o sesión expirada
  Dado que mi sesión/token es inválido o ha expirado
  Cuando intento cerrar sesión
  Entonces la operación retorna estado no exitoso
  Pero se fuerza la limpieza de datos locales
  Y se me redirige a la pantalla de "Login"

Escenario: Error de red o servidor durante el logout
  Dado que estoy autenticado en la aplicación
  Cuando presiono "Cerrar Sesión"
  Pero ocurre un error de red/servidor (p. ej., 5xx)
  Entonces se muestra un mensaje ("No fue posible cerrar sesión, intenta más tarde")
  Y se ofrece reintentar; si persiste, se puede forzar limpieza local y redirección segura
```

## Estados y transiciones
- Estado inicial: usuario autenticado, opción “Cerrar Sesión” visible.
- Acción: mostrar estado “cargando” al ejecutar logout para evitar dobles clics.
- Éxito: invalidar sesión/token, limpiar storage/cookies y redirigir a login.
- Error: mostrar feedback y permitir reintentos; opcionalmente forzar limpieza local.