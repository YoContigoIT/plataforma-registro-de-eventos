# Documentación BDD: Inicio de sesión (Login)

## Objetivo
Permitir a los usuarios autenticarse de forma segura mediante correo electrónico y contraseña para acceder a funcionalidades protegidas de la aplicación.

## Alcance
- Captura y validación de credenciales.
- Comunicación con el servicio de autenticación.
- Creación/actualización de sesión y redirección a rutas protegidas.
- Manejo de errores de validación, credenciales y red.

## Componentes involucrados

- Presentación (UI)
  - Formularios y pantallas de login: `app/presentation/auth/`
  - Guards/redirecciones a rutas protegidas: `app/presentation/guards/`
  - Layout y rutas de panel: `app/presentation/panel/`, `app/presentation/layout.tsx`

- Dominio
  - Entidades y DTOs de usuario/login: `app/domain/entities/`, `app/domain/dtos/`
  - Repositorios y servicios de dominio: `app/domain/repositories/`, `app/domain/services/`

- Infraestructura
  - Servicio de autenticación: `app/infrastructure/auth/`
  - Acceso a datos y ORM: `app/infrastructure/db/`, `prisma/`
  - Middleware (protección/verificación de sesión): `app/infrastructure/middleware/`
  - Configuración y utilidades: `app/infrastructure/config/`

- Compartidos
  - Hooks (formularios, estado): `app/shared/hooks/`
  - Componentes UI (inputs, toasts, modales): `app/shared/components/`
  - Librerías/utilidades (validación, storage, helpers): `app/shared/lib/`
  - Tipos compartidos: `app/shared/types/`

- Servidor y enrutamiento
  - App server (SSR): `server/app.ts`, `server.js`
  - Configuración de enrutado: `react-router.config.ts`, `app/routes.ts`


## Estructura de escenarios (Gherkin)

```gherkin
Característica: Autenticación de usuario (Login)
  Como usuario de la aplicación
  Requiero iniciar sesión con mis credenciales
  Para acceder a funcionalidades protegidas

  Antecedentes:
    Dado que estoy en la pantalla de "Login"
    Y el sistema valida los campos de correo y contraseña
    Y existe un servicio de autenticación que verifica credenciales
    Y las rutas protegidas requieren sesión válida
```

### Flujo principal: Inicio de sesión exitoso

```gherkin
Escenario: Inicio de sesión exitoso
  Dado que ingreso mi correo electrónico válido ("usuario@ejemplo.com")
  Y que ingreso mi contraseña válida ("ContraseñaSegura123")
  Cuando presiono el botón "Iniciar Sesión"
  Y la validación del formulario es exitosa
  Y el servicio de autenticación confirma las credenciales
  Entonces se crea/actualiza mi sesión de forma segura
  Y soy redirigido al panel principal (por ejemplo, "/panel")
```

### Flujos alternativos y errores

```gherkin
Escenario: Credenciales incorrectas
  Dado que ingreso un correo electrónico válido ("usuario@ejemplo.com")
  Y que ingreso una contraseña incorrecta ("incorrecta")
  Cuando presiono el botón "Iniciar Sesión"
  Y la validación del formulario es exitosa
  Pero el servicio rechaza las credenciales
  Entonces veo un mensaje de error general ("Correo o contraseña incorrectos")
  Y permanezco en la pantalla de "Login"

Escenario: Correo con formato inválido
  Dado que ingreso un correo con formato inválido ("usuario-invalido")
  Y que ingreso una contraseña cualquiera
  Cuando presiono el botón "Iniciar Sesión"
  Entonces veo un mensaje de error en "Correo Electrónico" ("Formato inválido")
  Y permanezco en la pantalla de "Login"

Escenario: Contraseña vacía
  Dado que ingreso un correo electrónico válido ("usuario@ejemplo.com")
  Y que dejo el campo "Contraseña" vacío
  Cuando presiono el botón "Iniciar Sesión"
  Entonces veo un mensaje de error en "Contraseña" ("La contraseña es requerida")
  Y permanezco en la pantalla de "Login")

Escenario: Error de red o servidor
  Dado que ingreso credenciales válidas
  Cuando presiono "Iniciar Sesión"
  Pero ocurre un error de red/servidor (p. ej., 5xx)
  Entonces veo un mensaje de error ("No fue posible iniciar sesión, intenta más tarde")
  Y permanezco en la pantalla de "Login"
```

## Estados y transiciones
- Estado inicial: formulario vacío, campos y botón “Iniciar Sesión”.
- Validación: aplicar reglas de formato y requerimiento antes del submit.
- Envío: mostrar estado “cargando” y deshabilitar el botón mientras se procesa.
- Éxito: establecer sesión/credenciales de forma segura y redirigir.
- Error: mostrar mensaje contextual (campo) o general (toast/banner) y permitir reintentos.

## UX y Mensajes
- Mostrar errores específicos en campos y feedback general con toasts.
- Mantener accesibilidad con mensajes asociados a inputs y estados “aria-live”.
- No revelar si el correo existe; usar mensajes genéricos para credenciales incorrectas.