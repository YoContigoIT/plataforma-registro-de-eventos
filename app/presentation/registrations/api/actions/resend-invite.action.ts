import { RegistrationStatus, UserRole } from "@prisma/client";
import type { InvitationEmailDto } from "~/domain/dtos/email-invitation.dto";
import { handleServiceError } from "~/shared/lib/error-handler";
import { encodeInvitationData } from "~/shared/lib/utils";
import type { ActionData } from "~/shared/types";
import type { Route } from "../../routes/+types/send-invitations";

export const resendInviteAction = async ({
  request,
  context: { repositories, services, session },
}: Route.ActionArgs): Promise<ActionData> => {
  const formData = Object.fromEntries(await request.formData());
  const registrationId = formData.registrationId as string;
  const userId = session.get("user")?.id;
  const userRole = session.get("user")?.role;

  if (!userId) {
    return {
      success: false,
      error: "No se ha iniciado sesión",
    };
  }

  if (
    !userRole ||
    (userRole !== UserRole.ORGANIZER && userRole !== UserRole.ADMIN)
  ) {
    return {
      success: false,
      error: "No tienes permisos para reenviar invitaciones",
    };
  }

  if (!registrationId) {
    return {
      success: false,
      error: "ID de registro requerido",
    };
  }

  try {
    const registration =
      await repositories.registrationRepository.findOne(registrationId);

    if (!registration) {
      return {
        success: false,
        error: "Registro no encontrado",
      };
    }

    if (registration.status !== RegistrationStatus.PENDING) {
      return {
        success: false,
        error: "Solo se pueden reenviar invitaciones pendientes",
      };
    }

    /* const newInviteToken = generateInviteToken(); */
    const encodedToken = encodeInvitationData(
      registration.userId,
      registration.eventId
    );

    await repositories.registrationRepository.update({
      id: registrationId,
      /* inviteToken: newInviteToken, */
      invitedAt: new Date(),
    });

    const emailData: InvitationEmailDto = {
      userName: registration.user.name || registration.user.email,
      eventName: registration.event.name,
      eventTime: registration.event.start_date.toLocaleTimeString(),
      eventDate: registration.event.start_date.toLocaleDateString(),
      eventLocation: registration.event.location,
      inviteUrl: `${process.env.APP_URL || "http://localhost:3000"}/inscripcion/${encodedToken}`,
      customMessage: "Se ha reenviado tu invitación al evento.",
    };

    const emailResponse = await services.emailService.sendInvitationEmail(
      emailData,
      registration.user.email
    );

    if (emailResponse.success) {
      return {
        success: true,
        message: "Invitación reenviada exitosamente",
      };
    } else {
      return {
        success: false,
        error: "Error al reenviar la invitación",
      };
    }
  } catch (error) {
    return handleServiceError(error);
  }
};