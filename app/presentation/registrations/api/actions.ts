import { EventStatus, RegistrationStatus, UserRole } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { InvitationEmailDto } from "~/domain/dtos/email-invitation.dto";
import { sendInvitationsSchema } from "~/domain/dtos/invitation.dto";
import type { CreateRegistrationDto } from "~/domain/dtos/registration.dto";
import type { CreateUserDTO } from "~/domain/dtos/user.dto";
import { runInTransaction } from "~/infrastructure/db/prisma";
import { handleServiceError } from "~/shared/lib/error-handler";
import {
  encodeInvitationData,
  generateQRCode,
  simplifyZodErrors,
} from "~/shared/lib/utils";
import type { ActionData } from "~/shared/types";
import { generateRevocationEmailTemplate } from "../../templates/revocation-email.template";
import type { Route } from "../routes/+types/send-invitations";

function parseEmails(emailsString: string): string[] {
  return emailsString
    .split(/[,;\n\r]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(
      (email) => email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    )
    .filter((email, index, arr) => arr.indexOf(email) === index);
}

export const sendInvitationsAction = async ({
  request,
  context: { repositories, services, session },
}: Route.ActionArgs): Promise<ActionData> => {
  const formData = Object.fromEntries(await request.formData());
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
      error: "No tienes permisos para enviar invitaciones",
    };
  }

  const validated = sendInvitationsSchema.safeParse(formData);

  if (!validated.success) {
    return {
      success: false,
      errors: simplifyZodErrors(validated.error),
    };
  }

  const {
    eventId,
    emails: emailsString,
    message: customMessage,
  } = validated.data;

  try {
    return await runInTransaction(
      async () => {
        const event = await repositories.eventRepository.findUnique(eventId);

        if (!event) {
          return {
            success: false,
            error: "Evento no encontrado",
          };
        }

        if (
          event.status !== EventStatus.UPCOMING &&
          event.status !== EventStatus.ONGOING
        ) {
          return {
            success: false,
            error:
              "No se pueden enviar invitaciones a eventos que no están programados",
          };
        }

        const emailList = parseEmails(emailsString);

        if (emailList.length === 0) {
          return {
            success: false,
            error: "No se encontraron correos electrónicos válidos",
          };
        }

        //check remaining capacity validation
        const remainingCapacity = event.remainingCapacity || 0;

        if (emailList.length > remainingCapacity) {
          return {
            success: false,
            error: `No se pueden enviar ${emailList.length} invitaciones. Solo hay ${remainingCapacity} lugares disponibles`,
          };
        }

        if (emailList.length > 100) {
          return {
            success: false,
            error:
              "No se pueden procesar más de 100 correos electrónicos a la vez",
          };
        }

        // Check remaining capacity validation by status
        /* const statusCounts = await repositories.registrationRepository.countAllStatusesByEvent(eventId);
        const registeredCount = (statusCounts.REGISTERED || 0) + (statusCounts.CHECKED_IN || 0);
        const availableSpots = Math.max(0, event.capacity - registeredCount);

        if (emailList.length > availableSpots) {
          return {
            success: false,
            error: `No se pueden enviar ${emailList.length} invitaciones. Solo hay ${availableSpots} lugares disponibles (capacidad: ${event.capacity}, registrados: ${registeredCount})`,
          };
        } */

        const results = {
          successful: 0,
          failed: 0,
          alreadyInvited: 0,
          errors: [] as string[],
        };

        for (const email of emailList) {
          try {
            let user = await repositories.userRepository.findByEmail(email);

            if (!user) {
              const newUserData: CreateUserDTO = {
                email,
                name: email.split("@")[0],
                role: UserRole.ATTENDEE,
              };

              user = await repositories.userRepository.create(newUserData);
            }

            const existingRegistration =
              await repositories.registrationRepository.registrationExists(
                eventId,
                user.id
              );

            if (existingRegistration) {
              results.alreadyInvited++;
              continue;
            }

            const qrCode = generateQRCode(user.id, eventId);

            const registrationData: CreateRegistrationDto = {
              qrCode,
              userId: user.id,
              eventId,
              status: RegistrationStatus.PENDING,
              invitedAt: new Date(),
            };

            const eventDate = new Date(event.start_date).toLocaleDateString(
              "es-MX",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            );

            const eventTime = new Date(event.start_date).toLocaleTimeString(
              "es-MX",
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            );

            const invitationHash = encodeInvitationData(user.id, eventId);

            const invitationData: InvitationEmailDto = {
              userName: user.name || email.split("@")[0],
              userEmail: user.email || email,
              eventName: event.name,
              eventDescription:
                event.description || "Descripción por confirmar",
              eventDate,
              eventLocation: event.location || "Ubicación por confirmar",
              eventTime,
              eventCapacity: event.capacity,
              customMessage:
                customMessage ||
                "Te invitamos a participar en este increíble evento. ¡Esperamos verte allí!",
              supportEmail: "soporte@eventos.com",
              inviteUrl: `${process.env.APP_URL || "http://localhost:3000"}/inscripcion/${invitationHash}`,
            };

            // TODO: hmm this should work, i need to check it
            await runInTransaction(async () => {
              await repositories.registrationRepository.create(
                registrationData
              );

              await services.emailService.sendInvitationEmail(
                invitationData,
                email
              );
            });

            results.successful++;
          } catch (error) {
            results.failed++;
            results.errors.push(
              `Error al procesar ${email}: ${error instanceof Error ? error.message : "Error desconocido"}`
            );
          }
        }

        const totalProcessed =
          results.successful + results.failed + results.alreadyInvited;
        let message = `Procesados ${totalProcessed} correos: ${results.successful} invitaciones enviadas`;

        if (results.alreadyInvited > 0) {
          message += `, ${results.alreadyInvited} ya estaban invitados`;
        }

        if (results.failed > 0) {
          message += `, ${results.failed} fallaron`;
        }

        if (results.failed > 0 && results.successful === 0) {
          return {
            success: false,
            error: "No se pudo enviar ninguna invitación",
            message: results.errors.join("; "),
          };
        }

        return {
          success: true,
          message,
          redirectTo: `/registros?eventId=${eventId}`,
        };
      },
      {
        timeout: 25000,
      }
    );
  } catch (error) {
    return {
      success: false,
      error: "Error al enviar las invitaciones",
      message: error instanceof Error ? error.message : "Error desconocido",
    };
  }
};

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
      for (const registrationId of registrationIds) {
        const registration =
          await repositories.registrationRepository.findOne(registrationId);

        if (!registration) continue;

        const currentEvent = await repositories.eventRepository.findUnique(
          registration.eventId
        );
        const user = await repositories.userRepository.findUnique(
          registration.userId
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
              { locale: es }
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
    });

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
