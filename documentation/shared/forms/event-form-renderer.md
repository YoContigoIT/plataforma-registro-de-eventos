# event-form-renderer.tsx — Renderizador de formularios de eventos

## Resumen
Componente que renderiza dinámicamente un formulario de evento a partir de su definición (`EventFormWithFields`), maneja entradas de usuario para distintos tipos de campos y soporta creación y actualización de respuestas de formulario.

## Ubicación
`app/shared/components/forms/event-form-renderer.tsx`

## Responsabilidades
- Renderizar campos del formulario basados en su tipo (`TEXT`, `EMAIL`, `PHONE`, `NUMBER`, `TEXTAREA`, `SELECT`, `RADIO`, `CHECKBOX`, `DATE`).
- Gestionar valores por defecto y estado interno para campos `CHECKBOX`.
- Ordenar la visualización de campos por `order`.
- Exponer inputs ocultos para `registrationId` y `formResponseId` en flujos de creación/actualización.
- Mostrar un botón de envío con indicador de carga y textos según el estado (`Enviar`, `Actualizando…`).

## API pública
- `EventFormRenderer(props: EventFormRendererProps): JSX.Element`
  - `eventForm: EventFormWithFields` — Definición del formulario y sus campos.
  - `handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void` — Handler para propagar cambios (nombre/valor) al contenedor.
  - `registrationId?: string` — ID de la inscripción asociada; se inyecta como `<input type="hidden">`.
  - `submitButtonText?: string` — Texto del botón de envío (por defecto: `"Enviar"`).
  - `className?: string` — Clases CSS para el contenedor.
  - `defaultValues?: FormResponseAnswers` — Valores por defecto para pintar respuestas existentes.
  - `isUpdateForm?: boolean` — Activa modo actualización (pinta textos y `formResponseId` oculto).
  - `formResponseId?: string` — ID de la respuesta al formulario (solo en actualización).
  - `isSubmitting?: boolean` — Control externo de estado de envío (deshabilita botón y muestra spinner).

## Componentes involucrados
- UI comunes: `TextInput`, `NumberInput`, `PhoneInput`, `DateInput`, `SelectInput`, `RadioGroupInput`, `Checkbox`, `Textarea`, `Label`, `Button`.
- Ícono: `Loader2` (spinner).
- Tipos de dominio: `EventFormWithFields`, `FormFieldEntity`, `FormResponseAnswers`.

## Ejemplos de integración

### Crear una nueva respuesta
```tsx
import { useState } from "react";
import { EventFormRenderer } from "~/shared/components/forms/event-form-renderer";
import type { EventFormWithFields } from "~/domain/entities/event-form.entity";

export function EventFormCreate({
  eventForm,
  registrationId,
}: {
  eventForm: EventFormWithFields;
  registrationId: string;
}) {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    // Envía `formValues` (keys: field_<id>) junto con registrationId
    await fetch("/api/form-responses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        registrationId,
        answers: formValues,
      }),
    }).finally(() => setIsSubmitting(false));
  }

  return (
    <form onSubmit={onSubmit}>
      <EventFormRenderer
        eventForm={eventForm}
        registrationId={registrationId}
        handleInputChange={handleInputChange}
        isSubmitting={isSubmitting}
        submitButtonText="Enviar"
      />
    </form>
  );
}
```

### Actualizar una respuesta existente
```tsx
import { useState } from "react";
import { EventFormRenderer } from "~/shared/components/forms/event-form-renderer";
import type { EventFormWithFields } from "~/domain/entities/event-form.entity";
import type { FormResponseAnswers } from "~/domain/entities/form-response.entity";

export function EventFormUpdate({
  eventForm,
  registrationId,
  formResponseId,
  defaultValues,
}: {
  eventForm: EventFormWithFields;
  registrationId: string;
  formResponseId: string;
  defaultValues: FormResponseAnswers; // Tiene fieldResponses con { fieldId, value }
}) {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    await fetch(`/api/form-responses/${formResponseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        registrationId,
        answers: formValues,
      }),
    }).finally(() => setIsSubmitting(false));
  }

  return (
    <form onSubmit={onSubmit}>
      <EventFormRenderer
        eventForm={eventForm}
        registrationId={registrationId}
        defaultValues={defaultValues}
        isUpdateForm
        formResponseId={formResponseId}
        handleInputChange={handleInputChange}
        isSubmitting={isSubmitting}
        submitButtonText="Actualizar"
      />
    </form>
  );
}
```

## Consideraciones y errores
- `defaultValues.fieldResponses`: para `CHECKBOX`, el componente espera un string JSON (array) y lo parsea. Si pasas un string plano, lo tratará como selección única.
- `NUMBER` y `DATE`: se convierten internamente a string (`toString()` para números y `toISOString()` para fechas) antes de enviar; asegúrate de parsear correctamente en el backend.
- Orden de campos: se usa `field.order` para ordenar; valida que todos los campos tengan este valor.
- Envoltura `<form>`: el componente no gestiona el submit por sí mismo; envuélvelo en un `<form>` y maneja `onSubmit` para enviar `registrationId`, `formResponseId` y valores capturados.
- Nombres de inputs: se generan como `field_<fieldId>` y se deben mapear en el backend a la entidad de respuesta por `fieldId`.

## Mantenimiento
- Si agregas nuevos tipos de campo en el dominio, extiende el `switch` en `renderField`.
- Mantén sincronizados los tipos `EventFormWithFields`, `FormFieldEntity` y `FormResponseAnswers` con la definición de dominio.
- Considera extraer validación y normalización de valores a utilidades compartidas si crece la complejidad.