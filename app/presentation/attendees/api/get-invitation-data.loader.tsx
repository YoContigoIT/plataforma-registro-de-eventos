import { EventStatus } from "@prisma/client";
import type { EventFormWithFields } from "~/domain/entities/event-form.entity";
import type { EventEntity } from "~/domain/entities/event.entity";
import type { FormResponseEntity } from "~/domain/entities/form-response.entity";
import type { UserEntity } from "~/domain/entities/user.entity";
import { handleServiceError } from "~/shared/lib/error-handler";
import { decodeInvitationData } from "~/shared/lib/utils";
import type { LoaderData } from "~/shared/types";
import type { Route } from "../routes/+types/join";

type InvitationData = {
  event: EventEntity;
  user: UserEntity;
  eventForm: EventFormWithFields | null;
  formResponse: FormResponseEntity | null;
  registrationId: string;
};

export async function getInvitationDataLoader({
  params,
  context: { repositories },
}: Route.LoaderArgs): Promise<LoaderData<InvitationData>> {
  const { inviteToken } = params;

  if (!inviteToken) {
    return {
      success: false,
      error: "No se encontró el token de invitación.",
    };
  }

  const decodedData = decodeInvitationData(inviteToken);

  if (!decodedData) {
    return {
      success: false,
      error: "Invitación no válida o expirada.",
    };
  }

  const { userId, eventId } = decodedData;

  try {
    const invite =
      await repositories.registrationRepository.findExactInvitation(
        eventId,
        userId
      );

    if (!invite) {
      return {
        success: false,
        error: "Invitación no encontrada o expirada.",
      };
    }

    if (invite.event.status === "CANCELLED" || invite.event.archived) {
      return {
        success: false,
        error: "Este evento ha sido cancelado",
      };
    }

    if (
      invite.event.end_date < new Date() ||
      invite.event.status === EventStatus.ENDED
    ) {
      return {
        success: false,
        error: "Este evento ya ha finalizado.",
      };
    }

    const eventForm =
      await repositories.eventFormRepository.findByEventId(eventId);

    let formResponse: FormResponseEntity | null = null;

    if (eventForm?.isActive) {
      const responseExists =
        await repositories.formResponseRepository.responseExists(invite.id);

      if (responseExists) {
        formResponse =
          await repositories.formResponseRepository.findByRegistrationId(
            invite.id
          );
      }
    }

    const data = {
      event: invite.event,
      user: invite.user,
      eventForm: eventForm?.isActive ? eventForm : null,
      formResponse,
      registrationId: invite.id,
    };

    console.log("data", data);

    return {
      success: true,
      data,
    };
  } catch (error) {
    return handleServiceError(
      error,
      "Error al cargar los detalles de la invitación"
    );
  }
}
