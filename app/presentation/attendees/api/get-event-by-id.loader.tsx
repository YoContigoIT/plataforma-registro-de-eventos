import { decodeInvitationData } from "~/shared/lib/utils";
import type { Route } from "../routes/+types/join";

export async function getEventByIdLoader({
  params,
  context: { repositories },
}: Route.LoaderArgs) {
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

  try {
    const { userId, eventId } = decodedData;
    // Find the exact invitation using the decoded IDs
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

    // Check if the event is still valid (not cancelled or archived)
    if (invite.event.status === "CANCELLED" || invite.event.archived) {
      return {
        success: false,
        error: "Este evento ha sido cancelado",
      };
    }

    // Check if the event has already ended
    if (invite.event.end_date < new Date()) {
      return {
        success: false,
        error: "Este evento ya ha finalizado.",
      };
    }

    return {
      success: true,
      data: {
        event: invite.event,
        user: invite.user,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: `Error al cargar los detalles de la invitación: ${error}`,
    };
  }
}
