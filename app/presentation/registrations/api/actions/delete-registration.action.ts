import { RegistrationStatus, UserRole } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { runInTransaction } from "~/infrastructure/db/prisma";
import { handleServiceError } from "~/shared/lib/error-handler";
import type { ActionData } from "~/shared/types";
import { generateRevocationEmailTemplate } from "../../../templates/revocation-email.template";
import type { Route } from "../../routes/+types/send-invitations";

export const deleteRegistrationAction = async ({
  request,
  context: { repositories, session, services },
}: Route.ActionArgs): Promise<ActionData> => {
  const formData = Object.fromEntries(await request.formData());

  // Acepta tanto un solo ID como múltiples IDs
  const registrationIds: string[] = formData.registrationIds
    ? (formData.registrationIds as string)
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
    : formData.registrationId
      ? [formData.registrationId as string]
      : [];

  const customMessage = formData.customMessage as string;
  const userId = session.get("user")?.id;
  const userRole = session.get("user")?.role;

  if (!userId) {
    return { success: false, error: "No se ha iniciado sesión" };
  }

  if (
    !userRole ||
    (userRole !== UserRole.ORGANIZER && userRole !== UserRole.ADMIN)
  ) {
    return {
      success: false,
      error: "No tienes permisos para eliminar registros",
    };
  }

  if (registrationIds.length === 0) {
    return { success: false, error: "ID(s) de registro requeridos" };
  }

  try {
    await runInTransaction(async () => {
      console.log(registrationIds);
      for (const registrationId of registrationIds) {
        const registration =
          await repositories.registrationRepository.findOne(registrationId);

        if (!registration) continue;

        const currentEvent = await repositories.eventRepository.findUnique(
          registration.eventId,
        );
        const user = await repositories.userRepository.findUnique(
          registration.userId,
        );

        if (!currentEvent) continue;

        // Permisos
        if (
          userRole === UserRole.ORGANIZER &&
          currentEvent.organizerId !== userId
        ) {
          return {
            success: false,
            error: "No tienes permisos para eliminar este registro",
          };
        }

        // Eliminar registro
        await repositories.registrationRepository.delete(registrationId);

        // Actualizar capacidad
        if (
          registration.status === RegistrationStatus.REGISTERED ||
          registration.status === RegistrationStatus.CHECKED_IN
        ) {
          await repositories.eventRepository.update({
            id: currentEvent.id,
            remainingCapacity: currentEvent.remainingCapacity
              ? currentEvent.remainingCapacity + 1
              : 1,
          });
        }

        // Notificación por correo
        if (user?.email) {
          const emailTemplate = generateRevocationEmailTemplate({
            userName: user.name || user.email.split("@")[0],
            eventName: currentEvent.name,
            eventDate: format(
              new Date(currentEvent.start_date),
              "PPP 'a las' p",
              { locale: es },
            ),
            customMessage: customMessage || undefined,
          });

          await services.emailService.sendEmail({
            to: user.email,
            subject: `Invitación revocada - ${currentEvent.name}`,
            html: emailTemplate,
          });
        }
      }
    }, { timeout: 10000 });

    return {
      success: true,
      message:
        registrationIds.length > 1
          ? "Registros eliminados exitosamente. Se ha enviado una notificación a los usuarios."
          : "Registro eliminado exitosamente. Se ha enviado una notificación al usuario.",
    };
  } catch (error) {
    return handleServiceError(error);
  }
};
