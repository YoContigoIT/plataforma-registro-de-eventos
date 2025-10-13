# Documentación: Modelos prisma (schema.prisma)

## Objetivo
Describir los modelos, enums, relaciones e índices definidos en `prisma/schema.prisma` para la gestión de eventos, usuarios, registros y formularios.

## Estructura general
- Generador: `prisma-client-js`
- Datasource: `PostgreSQL` con `DATABASE_URL`
- Multi-schema: uso de `@@schema("auth")` para todos los enums y modelos (se guardan en el esquema `auth`).
- Archivo fuente: `prisma\schema.prisma`

## Enums
- `UserRole`: `ATTENDEE`, `ORGANIZER`, `ADMIN`, `GUARD`
- `EventStatus`: `UPCOMING`, `ONGOING`, `ENDED`, `CANCELLED`, `DRAFT`
- `RegistrationStatus`: `PENDING`, `REGISTERED`, `WAITLISTED`, `CHECKED_IN`, `CANCELLED`, `DECLINED`
- `FormFieldType`: `TEXT`, `EMAIL`, `PHONE`, `NUMBER`, `TEXTAREA`, `SELECT`, `RADIO`, `CHECKBOX`, `DATE`, `FILE`

## Modelos y relaciones
### Session
| Campo               | Tipo      | Descripción                                  | Relación |
|---------------------|-----------|----------------------------------------------|----------|
| id                  | String    | Identificador único (UUID).                  | -        |
| user_id             | String    | ID del usuario asociado (UUID).              | -        |
| refresh_token_hash  | String    | Hash único del token de refresco.            | -        |
| expires_at          | DateTime  | Fecha de expiración de la sesión.            | -        |
| device_fingerprint  | String?   | Huella del dispositivo.                      | -        |
| ip_address          | String?   | Dirección IP del cliente.                    | -        |
| user_agent          | String?   | Agente de usuario del cliente.               | -        |
| created_at          | DateTime  | Fecha de creación de la sesión.              | -        |
| updated_at          | DateTime  | Fecha de actualización automática.           | -        |
| user                | User      | Usuario propietario de la sesión.            | User     |

### User
| Campo           | Tipo           | Descripción                                       | Relación      |
|-----------------|----------------|---------------------------------------------------|---------------|
| id              | String         | Identificador único (UUID).                       | -             |
| email           | String         | Correo electrónico único.                         | -             |
| name            | String?        | Nombre del usuario.                               | -             |
| company         | String?        | Empresa del usuario.                              | -             |
| title           | String?        | Cargo/posición del usuario.                       | -             |
| phone           | String?        | Teléfono del usuario.                             | -             |
| password        | String?        | Contraseña (hash).                                | -             |
| role            | UserRole       | Rol del usuario.                                  | -             |
| archived        | Boolean        | Marca de archivado/inactivo.                      | -             |
| createdAt       | DateTime       | Fecha de creación del usuario.                    | -             |
| updatedAt       | DateTime       | Fecha de actualización automática.                | -             |
| registrations   | Registration[] | Registros asociados al usuario.                   | Registration  |
| sessions        | Session[]      | Sesiones del usuario.                             | Session       |
| createdEvents   | Event[]        | Eventos creados por el usuario (organizador).     | Event         |
| índice email    | -              | Índice por email para búsqueda eficiente.         | -             |

### Event
| Campo              | Tipo        | Descripción                                          | Relación     |
|--------------------|-------------|------------------------------------------------------|--------------|
| id                 | String      | Identificador único (UUID).                          | -            |
| name               | String      | Nombre del evento.                                   | -            |
| start_date         | DateTime    | Fecha de inicio del evento.                          | -            |
| end_date           | DateTime    | Fecha de fin del evento.                             | -            |
| location           | String      | Ubicación del evento.                                | -            |
| agenda             | String?     | Agenda/contenido del evento.                         | -            |
| capacity           | Int         | Capacidad máxima de asistentes.                      | -            |
| description        | String?     | Descripción del evento.                              | -            |
| maxTickets         | Int?        | Máximo de tickets por registro.                      | -            |
| status             | EventStatus | Estado del evento.                                   | -            |
| remainingCapacity  | Int?        | Capacidad restante.                                  | -            |
| organizerId        | String      | ID del organizador (UUID).                           | -            |
| organizer          | User        | Organizador del evento.                              | User         |
| requiresSignature  | Boolean     | Indica si se requiere firma en el registro.          | -            |
| isPublic           | Boolean     | Indica si el evento es público.                      | -            |
| publicInviteToken  | String?     | Token de invitación pública.                         | -            |
| archived           | Boolean?    | Indicador de evento archivado.                       | -            |
| createdAt          | DateTime    | Fecha de creación del evento.                        | -            |
| updatedAt          | DateTime    | Fecha de actualización automática.                   | -            |
| registrations      | Registration[] | Registros asociados al evento.                    | Registration |
| EventForm          | EventForm?  | Formulario asociado al evento (relación 1:1).        | EventForm    |

### Registration
| Campo            | Tipo               | Descripción                                      | Relación     |
|------------------|--------------------|--------------------------------------------------|--------------|
| id               | String             | Identificador único (UUID).                      | -            |
| qrCode           | String             | Código QR único de la inscripción.               | -            |
| status           | RegistrationStatus | Estado de la inscripción.                        | -            |
| checkedInAt      | DateTime?          | Fecha/hora de check-in.                          | -            |
| invitedAt        | DateTime           | Fecha de envío de invitación.                    | -            |
| respondedAt      | DateTime?          | Fecha de respuesta a la invitación.              | -            |
| registeredAt     | DateTime?          | Fecha de registro (puede ser nula).              | -            |
| purchasedTickets | Int?               | Cantidad de tickets comprados por el asistente.  | -            |
| userId           | String             | ID del usuario (UUID).                           | -            |
| user             | User               | Usuario inscrito.                                | User         |
| eventId          | String             | ID del evento (UUID).                            | -            |
| event            | Event              | Evento asociado.                                 | Event        |
| FormResponse     | FormResponse?      | Respuesta de formulario ligada a la inscripción. | FormResponse |

### EventForm
| Campo       | Tipo       | Descripción                                   | Relación   |
|-------------|------------|-----------------------------------------------|------------|
| id          | String     | Identificador único (UUID).                   | -          |
| eventId     | String     | ID único del evento (UUID).                   | -          |
| event       | Event      | Evento propietario del formulario.            | Event      |
| title       | String     | Título del formulario.                        | -          |
| description | String?    | Descripción del formulario.                   | -          |
| isActive    | Boolean    | Indica si el formulario está activo.          | -          |
| fields      | FormField[]| Campos/preguntas del formulario.              | FormField  |
| createdAt   | DateTime   | Fecha de creación del formulario.             | -          |
| updatedAt   | DateTime   | Fecha de actualización automática.            | -          |

### FormField
| Campo       | Tipo          | Descripción                                     | Relación        |
|-------------|---------------|-------------------------------------------------|-----------------|
| id          | String        | Identificador único (UUID).                     | -               |
| formId      | String        | ID del formulario al que pertenece (UUID).      | -               |
| form        | EventForm     | Formulario propietario del campo.               | EventForm       |
| label       | String        | Etiqueta visible del campo.                     | -               |
| type        | FormFieldType | Tipo de campo (texto, email, etc.).             | -               |
| required    | Boolean       | Indica si el campo es obligatorio.              | -               |
| placeholder | String?       | Texto de ayuda del campo.                       | -               |
| options     | Json?         | Opciones para select/radio/checkbox.            | -               |
| validation  | Json?         | Reglas de validación del campo.                 | -               |
| order       | Int           | Orden de visualización del campo.               | -               |
| responses   | FormFieldResponse[] | Respuestas asociadas al campo.          | FormFieldResponse |

### FormResponse
| Campo          | Tipo             | Descripción                                      | Relación          |
|----------------|------------------|--------------------------------------------------|-------------------|
| id             | String           | Identificador único (UUID).                      | -                 |
| registrationId | String           | ID único de la inscripción (UUID).               | -                 |
| registration   | Registration     | Inscripción a la que pertenece la respuesta.     | Registration      |
| fieldResponses | FormFieldResponse[] | Respuestas por campo del formulario.         | FormFieldResponse |
| submittedAt    | DateTime         | Fecha/hora de envío de la respuesta.             | -                 |

### FormFieldResponse
| Campo     | Tipo        | Descripción                          | Relación                                            |
|-----------|-------------|------------------------------------|-----------------------------------------------------|
| id        | String      | Identificador único (UUID).                   | -                                                   |
| responseId| String      | ID único del evento (UUID).                   | -                                                   |
| response  | FormResponse| `@relation(fields:[responseId], refs:[id], onDelete:Cascade)` | -               |
| fieldId   | String      | ID único del evento (UUID).                   | -                                                   |
| field     | FormField   | `@relation(fields:[fieldId], refs:[id], onDelete:Cascade)`    | -               |
| value     | Json        | -                                  | -                                                   |
| índices   | -           | `@@index([responseId, fieldId])`   | -                                                   |

## Flujos principales
- Usuario crea eventos (organizer) → invita asistentes → asistentes responden y se registran → en eventos activos se hace check-in → algunos eventos incluyen formularios con campos y respuestas vinculadas a `Registration`.

## Consideraciones
- Multi-schema: todos los modelos/emuns se ubican en `auth`; valide compatibilidad de migraciones y permisos de esquema en Postgres.
- Campos `Json` (`options`, `validation`, `value`) admiten arrays, strings u objetos.
- Índices detallados optimizan consultas por estado/tiempos en `Registration`.
- Relaciones con `onDelete: Cascade` aseguran limpieza consistente al eliminar entidades padre.

## Ejemplo de uso (consultas Prisma)

```typescript:c%253A%255Cdev%255Cevent-manager%255Cdocumentation%255Cexamples%255Cprisma-queries.example.ts
import { PrismaClient, EventStatus } from "@prisma/client";
const prisma = new PrismaClient();

// Eventos próximos con sus registros y usuario
const upcoming = await prisma.event.findMany({
  where: { status: EventStatus.UPCOMING },
  include: {
    registrations: {
      include: { user: true },
    },
    EventForm: {
      include: { fields: true },
    },
  },
});

// Respuestas de formulario por registro
const responses = await prisma.formResponse.findMany({
  include: {
    fieldResponses: { include: { field: true } },
    registration: { include: { event: true, user: true } },
  },
});
```

## Ver también
- `prisma\schema.prisma`
- `documentation\prisma\seed.md` (documentación de seeding)