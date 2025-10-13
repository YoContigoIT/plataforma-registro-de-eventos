import { PageHeader } from "@/components/common/page-header";
import { createEventAction } from "../api/actions/create-event.action";
import { EventForm } from "../components/forms/event-form";

export const action = createEventAction;

export default function CreateEvent() {
  return (
    <div>
      <PageHeader
        title="Crear evento"
        description="Completa el formulario para crear un nuevo evento"
        goBack="/eventos"
      />

      <EventForm />
    </div>
  );
}
