import { EventStatus } from "@prisma/client";
import type { EventFormWithFields } from "~/domain/entities/event-form.entity";
import type { EventEntity } from "~/domain/entities/event.entity";
import type { FormResponseAnswers } from "~/domain/entities/form-response.entity";
import type { UserEntity } from "~/domain/entities/user.entity";
import { handleServiceError } from "~/shared/lib/error-handler";
import { decodeInvitationData } from "~/shared/lib/utils";
import type { LoaderData } from "~/shared/types";
import type { Route } from "../routes/+types/join";

export type InvitationData = {
  event: EventEntity;
  user: UserEntity;
  eventForm: EventFormWithFields | null;
  formResponse: FormResponseAnswers | null;
  registrationId: string;
  hasResponse: boolean;
  inviteToken: string;
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
        data: null,
      };
    }

    const eventForm =
      await repositories.eventFormRepository.findByEventId(eventId);

    let formResponse: FormResponseAnswers | null = null;

    if (eventForm?.isActive) {
      formResponse =
        await repositories.formResponseRepository.findByRegistrationId(
          invite.id
        );
    }

    console.log("form response id: ", formResponse?.id);

    return {
      success: true,
      data: {
        event: invite.event,
        user: invite.user,
        eventForm: eventForm?.isActive ? eventForm : null,
        formResponse,
        registrationId: invite.id,
        hasResponse: !!formResponse,
        inviteToken,
      },
    };
  } catch (error) {
    return handleServiceError(
      error,
      "Error al cargar los detalles de la invitación"
    );
  }
}
