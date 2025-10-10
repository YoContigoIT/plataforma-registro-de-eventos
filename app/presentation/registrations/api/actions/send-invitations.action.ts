import { EventStatus, RegistrationStatus, UserRole } from "@prisma/client";
import type { InvitationEmailDto } from "~/domain/dtos/email-invitation.dto";
import { sendInvitationsSchema } from "~/domain/dtos/invitation.dto";
import type { CreateRegistrationDto } from "~/domain/dtos/registration.dto";
import type { CreateUserDTO } from "~/domain/dtos/user.dto";
import { runInTransaction } from "~/infrastructure/db/prisma";
import {
    encodeInvitationData,
    generateQRCode,
    simplifyZodErrors,
} from "~/shared/lib/utils";
import type { ActionData } from "~/shared/types";
import type { Route } from "../../routes/+types/send-invitations";

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

        const results = {
          successful: 0,
          failed: 0,
          alreadyInvited: 0,
          errors: [] as string[],
        };

        await runInTransaction(async () => {
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

              //create registration first
              const createdRegistration =
                await repositories.registrationRepository.create(
                  registrationData
                );

              try {
                await services.emailService.sendInvitationEmail(
                  invitationData,
                  email
                );
                results.successful++;
              } catch (error) {
                results.failed++;
                results.errors.push(
                  `Error al enviar invitación a ${email}: ${error instanceof Error ? error.message : "Error desconocido"}`
                );
                try {
                  //then delete it if email send failed
                  await repositories.registrationRepository.delete(
                    createdRegistration.id
                  );
                } catch (deleteError) {
                  results.errors.push(
                    `No se pudo revertir registro para ${email}: ${deleteError instanceof Error ? deleteError.message : "Error desconocido"}`
                  );
                }
              }
            } catch (error) {
              results.failed++;
              results.errors.push(
                `Error al procesar ${email}: ${error instanceof Error ? error.message : "Error desconocido"}`
              );
            }
          }
        });

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

function parseEmails(emailsString: string): string[] {
  return emailsString
    .split(/[,;\n\r]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(
      (email) => email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    )
    .filter((email, index, arr) => arr.indexOf(email) === index);
}