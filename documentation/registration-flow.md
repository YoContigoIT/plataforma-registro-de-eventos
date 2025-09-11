# Proceso completo de invitaciones y registros para eventos

## Fase 1: Creación y configuración del evento

### Paso 1: Creación del evento
- El organizador crea un nuevo evento en el sistema
- Se establece la información básica: `name`, `start_date`, `end_date`, `location`, `capacity`
- El evento se crea inicialmente en status `DRAFT`
- Se asigna automáticamente un `id` único al evento
- Se vincula el evento con el `organizer_id` que lo creó

### Paso 2: Publicación del evento
- El organizador revisa y confirma los detalles del evento
- El `status` del evento cambia de `DRAFT` a `UPCOMING`
- El evento queda disponible para enviar invitaciones

## Fase 2: Envío de invitaciones

### Paso 3: Selección de invitados
- El organizador accede a la lista de usuarios del sistema
- Selecciona los usuarios que desea invitar al evento
- Puede buscar por `name`, `email` o filtrar por criterios específicos
- Confirma la lista final de invitados

### Paso 4: Generación de registros de invitación
**Para cada usuario invitado, el sistema:**
- Crea un nuevo registro en la tabla `Registration`
- Establece el `status` inicial como `PENDING`
- Genera un `invite_token` único y seguro para la invitación
- Crea un `qr_code` único para el registro
- Registra la `invited_at` con fecha y hora de envío de la invitación
- Inicializa los campos `responded_at` y `registered_at` como nulos

### Paso 5: Envío de emails de invitación
- El sistema envía automáticamente un email a cada invitado
- El email contiene:
  - Información del evento (`name`, `start_date`, `end_date`, `location`)
  - Enlace único con el `invite_token` de invitación
  - Instrucciones para responder a la invitación
- Se registra el envío exitoso del email

## Fase 3: Respuesta del usuario a la invitación

### Paso 6: Usuario recibe y accede a la invitación
- El usuario recibe el email de invitación
- Hace clic en el enlace único proporcionado
- El sistema valida el `invite_token` de invitación
- Se muestra la página de respuesta con detalles del evento
- El `status` del registro permanece como `PENDING`

### Paso 7A: Usuario acepta la invitación
**Cuando el usuario acepta:**
- El `status` del registro cambia a `REGISTERED`
- Se registra la `responded_at` con fecha y hora de respuesta
- Se registra la `registered_at` con fecha y hora de registro
- El usuario queda confirmado para el evento
- Se envía email de confirmación

### Paso 7B: Usuario rechaza la invitación
**Cuando el usuario rechaza:**
- El `status` del registro cambia a `DECLINED`
- Se registra la `responded_at` con fecha y hora de respuesta
- El campo `registered_at` permanece nulo
- Se libera el cupo para otros invitados

### Paso 7C: Evento con capacidad completa
**Si el evento está lleno:**
- El `status` del registro cambia a `WAITLISTED`
- Se registra la `responded_at` con fecha y hora de respuesta
- El campo `registered_at` permanece nulo
- El usuario queda en lista de espera
- Se notifica al usuario sobre su posición en la lista

## Fase 4: Gestión de registros

### Paso 8: Cancelación de registro (opcional)
**Si un usuario registrado cancela:**
- El `status` cambia a `CANCELLED`
- Las fechas `responded_at` y `registered_at` se mantienen (historial)
- Se libera un cupo en el evento
- Se notifica al organizador
- Se puede promover a alguien de la lista de espera

### Paso 9: Promoción desde lista de espera (opcional)
**Cuando se libera un cupo:**
- Se identifica al siguiente usuario en `status` `WAITLISTED`
- Su `status` cambia de `WAITLISTED` a `REGISTERED`
- Se registra la nueva `registered_at` (promoción)
- La `responded_at` original se mantiene
- Se notifica al usuario sobre su promoción

## Fase 5: Día del evento - Check-in

### Paso 10: Llegada del usuario al evento
- El usuario llega al lugar del evento
- El personal de seguridad/recepción tiene acceso al sistema
- Se puede buscar al usuario por:
  - Escaneo del `qr_code`
  - Búsqueda por `name`
  - Búsqueda por `email`

### Paso 11: Proceso de check-in
**Cuando se confirma la asistencia:**
- El `status` del registro cambia a `CHECKED_IN`
- Se registra la `checked_in_at` con fecha y hora exacta de check-in
- Se confirma la asistencia en el sistema
- El usuario puede acceder al evento
- Se actualiza el contador de asistentes

## Estados y transiciones del registro

### Flujo principal (camino feliz):
1. `PENDING` → Usuario recibe invitación
2. `REGISTERED` → Usuario acepta invitación
3. `CHECKED_IN` → Usuario asiste al evento

### Flujos alternativos:
- `PENDING` → `DECLINED` (Usuario rechaza)
- `PENDING` → `WAITLISTED` → `REGISTERED` → `CHECKED_IN` (Capacidad llena)
- `REGISTERED` → `CANCELLED` (Usuario cancela)
- `WAITLISTED` → `CANCELLED` (Usuario cancela desde lista)

## Campos de seguimiento temporal

### Fechas que nunca cambian:
- `invited_at`: Momento exacto del envío inicial
- `invite_token`: Identificador único permanente

### Fechas que se actualizan:
- `responded_at`: Primera vez que el usuario responde
- `registered_at`: Cuando el usuario queda registrado (puede ser diferente a la respuesta si estuvo en lista de espera)
- `checked_in_at`: Momento de llegada al evento

### Estados de control:
- `status`: Refleja la situación presente del registro
- `qr_code`: Identificador para check-in físico

## Beneficios del sistema

### Para organizadores:
- Control total sobre invitaciones y `capacity` de cada evento
- Seguimiento en tiempo real de respuestas
- Gestión automática de listas de espera
- Reportes detallados de asistencia
- Historial completo de cada invitación

### Para invitados:
- Proceso simple de respuesta
- Confirmaciones automáticas
- Notificaciones de cambios de `status`
- Acceso fácil mediante enlaces únicos
- Check-in rápido el día del evento

### Para el sistema:
- Trazabilidad completa del proceso
- Integridad de datos garantizada
- Escalabilidad para eventos grandes
- Flexibilidad para diferentes tipos de eventos
- Auditoría completa de todas las acciones

### Bulletproofing service
- Sistema de reintentos para envio de emails que hayan fallado
- Crear el usuario con el correo si no existe. Si ya existe, usar el id existente para crear los datos en `registration`