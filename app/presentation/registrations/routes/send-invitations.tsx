import { useLoaderData } from "react-router";
import type { EventEntity } from "~/domain/entities/event.entity";
import { getEventByIdLoader } from "~/presentation/events/api/loaders";
import { PageHeader } from "~/shared/components/common/page-header";
import type { LoaderData } from "~/shared/types";
import { sendInvitationsAction } from "../api/actions";
import { InvitationForm } from "../components/invitation-form";

export const loader = getEventByIdLoader;
export const action = sendInvitationsAction;

export default function SendInvitations() {
  const { data: event } = useLoaderData<LoaderData<EventEntity>>();

  if (!event) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-center text-gray-800">
          Evento no encontrado
        </h1>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Enviar invitaciones para ${event.name}`}
        description="Completa el formulario para enviar invitaciones"
        goBack={`/registros?eventId=${event.id}`}
      />

      <InvitationForm eventId={event?.id} eventName={event?.name} />
    </div>
  );
}
