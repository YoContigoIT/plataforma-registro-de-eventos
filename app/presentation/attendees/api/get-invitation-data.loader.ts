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
  user: UserEntity | null;
  eventForm: EventFormWithFields | null;
  formResponse: FormResponseAnswers | null;
  registrationId: string | null;
  hasResponse: boolean;
  token: string;
};

type TokenClassification =
  | { type: "private"; payload: { userId: string; eventId: string } }
  | { type: "public" };

function classifyInvitationToken(token: string): TokenClassification {
  const decoded = decodeInvitationData(token);
  if (decoded) {
    return { type: "private", payload: decoded };
  }
  return { type: "public" };
}

export async function getInvitationDataLoader({
  params,
  context: { repositories },
}: Route.LoaderArgs): Promise<LoaderData<InvitationData>> {
  const { token } = params;

  if (!token) {
    return {
      success: false,
      error: "No se encontró el token de invitación.",
    };
  }

  const tokenClassification = classifyInvitationToken(token);
  const privateInvitationToken =
    tokenClassification.type === "private" ? tokenClassification.payload : null;

  try {
    if (!privateInvitationToken) {
      const publicEvent =
        await repositories.eventRepository.findByPublicInviteToken(token);

      if (!publicEvent) {
        return {
          success: false,
          error: "Invitación no válida o expirada.",
        };
      }

      if (publicEvent.status === "CANCELLED" || publicEvent.archived) {
        return {
          success: false,
          error: "Este evento ha sido cancelado",
        };
      }

      if (
        publicEvent.end_date < new Date() ||
        publicEvent.status === EventStatus.ENDED
      ) {
        return {
          success: false,
          error: "Este evento ya ha finalizado.",
          data: null,
        };
      }

      const eventForm = publicEvent.EventForm;
      /* const eventForm =
      await repositories.eventFormRepository.findByEventId(publicEvent.id); */

      return {
        success: true,
        data: {
          event: publicEvent,
          user: null,
          eventForm: eventForm?.isActive ? eventForm : null,
          formResponse: null,
          registrationId: null,
          hasResponse: false,
          token,
        },
      };
    }

    const { userId, eventId } = privateInvitationToken;

    const invite =
      await repositories.registrationRepository.findExactInvitation(
        eventId,
        userId,
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
          invite.id,
        );
    }

    return {
      success: true,
      data: {
        event: invite.event,
        user: invite.user,
        eventForm: eventForm?.isActive ? eventForm : null,
        formResponse,
        registrationId: invite.id,
        hasResponse: !!formResponse,
        token,
      },
    };
  } catch (error) {
    return handleServiceError(
      error,
      "Error al cargar los detalles de la invitación",
    );
  }
}
