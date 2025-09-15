import { PageHeader } from "@/components/common/page-header";
import { useLoaderData } from "react-router";
import type { EventEntity } from "~/domain/entities/event.entity";
import type { LoaderData } from "~/shared/types";
import { updateEventAction } from "../api/actions";
import { getEventByIdLoader } from "../api/loaders";
import { EventForm } from "../components/event-form";

export const loader = getEventByIdLoader;
export const action = updateEventAction;

export default function UpdateEvent() {
  const { data: event } = useLoaderData<LoaderData<EventEntity>>();

  if (!event) {
    return null;
  }

  return (
    <div>
      <PageHeader
        title="Actualizar evento"
        description="Modifica la información del evento"
        goBack="/eventos"
      />

      <EventForm eventData={event} isEditing={true} />
    </div>
  );
}
