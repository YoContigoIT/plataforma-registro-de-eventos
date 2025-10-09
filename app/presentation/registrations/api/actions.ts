import { EventStatus, RegistrationStatus, UserRole } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import * as xlsx from "xlsx";
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
import type { Route as RegistrationsRoute } from "../routes/+types/registrations";
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

export const exportXLSXAction = async ({
  request,
  context: { repositories, session },
}: RegistrationsRoute.ActionArgs): Promise<ActionData> => {
  const formData = Object.fromEntries(await request.formData());
  const eventId = formData.eventId as string;
  const selectAllAcrossPages = formData.selectAll === "true";
  const rawSelected = formData.selectedRegistrations;

  // Convertimos a array de strings
  let selectedRegistrations: string[] | undefined;
  if (rawSelected) {
    if (typeof rawSelected === "string") {
      // Si viene como "id1,id2,id3"
      selectedRegistrations = rawSelected.split(",");
    } else {
      // Nunca debería ser File, pero por seguridad
      selectedRegistrations = undefined;
    }
  }
  const userId = session.get("user")?.id;
  const userRole = session.get("user")?.role;

  if (!userId) {
    return { success: false, error: "No se ha iniciado sesión" };
  }
  if (!eventId) {
    return { success: false, error: "ID de evento requerido" };
  }

  const event = await repositories.eventRepository.findUnique(eventId);
  if (!event) {
    return { success: false, error: "Evento no encontrado" };
  }

  const registrations = await repositories.registrationRepository.findForExport(
    eventId,
    {
      selectedRegistrations,
      selectAllAcrossPages,
    }
  );

  if (registrations.length === 0)
    return {
      success: false,
      error: "No hay registros para exportar",
    };

  // Generar XLSX
  const headers = [
    "ID",
    "Nombre",
    "Correo",
    "Fecha de registro",
    "Status",
    "QR Code",
    "Firma",
  ] as const;

  type DataRow = {
    ID: string;
    Nombre: string | null;
    Correo: string;
    "Fecha de registro": string | undefined;
    Status: RegistrationStatus;
    "QR Code": string;
    Firma: string;
  };

  const data: DataRow[] = registrations.map((r) => ({
    ID: r.id,
    Nombre: r.user.name,
    Correo: r.user.email,
    "Fecha de registro": r.registeredAt?.toISOString(),
    Status: r.status,
    "QR Code": r.qrCode,
    Firma: "",
  }));

  const worksheet = xlsx.utils.json_to_sheet(data, {
    header: headers as unknown as string[],
  });

  // Establecer el ancho de las columnas
  const cols = headers.map((key) => {
    const maxLength = Math.max(
      key.length, // ancho del header
      ...data.map((row) => {
        const value = row[key as keyof DataRow];
        return value ? value.toString().length : 0;
      })
    );
    return { wch: maxLength + 2 }; // +2 para espacio extra
  });

  const firmaIndex = headers.indexOf("Firma");
  if (firmaIndex !== -1) {
    cols[firmaIndex].wch = 40; // ancho mayor para la firma
  }
  worksheet["!cols"] = cols;

  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Registros");

  const base64 = xlsx.write(workbook, { bookType: "xlsx", type: "base64" });

  return {
    success: true,
    message: base64,
  };
};
