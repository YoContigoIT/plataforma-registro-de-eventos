import { RegistrationStatus, UserRole } from "@prisma/client";
import * as crypto from "crypto";
import type { InvitationEmailDto } from "~/domain/dtos/email-invitation.dto";
import { sendInvitationsSchema } from "~/domain/dtos/invitation.dto";
import type { CreateRegistrationDto } from "~/domain/dtos/registration.dto";
import type { CreateUserDTO } from "~/domain/dtos/user.dto";
import { runInTransaction } from "~/infrastructure/db/prisma";
import { generateQRCode, simplifyZodErrors } from "~/shared/lib/utils";
import type { ActionData } from "~/shared/types";
import type { Route } from "../routes/+types/send-invitations";

// Generate unique invite token
function generateInviteToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Parse emails from comma-separated string
function parseEmails(emailsString: string): string[] {
  return emailsString
    .split(/[,;\n\r]+/)
    .map((email) => email.trim().toLowerCase())
    .filter(
      (email) => email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    )
    .filter((email, index, arr) => arr.indexOf(email) === index); // Remove duplicates
}

/* Steps in sendInvitationsAction:
1. Validate authentication and authorization
   - Check if user is logged in
   - Verify user has ORGANIZER or ADMIN role

2. Validate form data using schema
   - Parse and validate input data
   - Extract eventId, emails and custom message

3. Verify event exists and user permissions
   - Check if event exists in database

4. Process email list
   - Parse and validate email addresses
   - Check for duplicates
   - Enforce maximum limit of 100 emails

5. For each email:
   - Check if user exists, create if not
   - Check for existing registration
   - Generate invite token and QR code
   - Create pending registration
   - Send invitation email with event details

6. Track results
   - Count successful invites
   - Track failed attempts
   - Note already invited users

7. Return summary
   - Return success/failure status
   - Include redirect URL on success
   - Return error details on failure
*/
export const sendInvitationsAction = async ({
  request,
  context: { repositories, services, session },
}: Route.ActionArgs): Promise<ActionData> => {
  const formData = Object.fromEntries(await request.formData());
  const userId = session.get("user")?.id;
  const userRole = session.get("user")?.role;

  // Authentication check
  if (!userId) {
    return {
      success: false,
      error: "No se ha iniciado sesión",
    };
  }

  // Authorization check - only organizers and admins can send invitations
  if (
    !userRole ||
    (userRole !== UserRole.ORGANIZER && userRole !== UserRole.ADMIN)
  ) {
    return {
      success: false,
      error: "No tienes permisos para enviar invitaciones",
    };
  }

  // Validate form data
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
        // 1. Verify event exists and user has permission
        const event = await repositories.eventRepository.findUnique(eventId);

        if (!event) {
          return {
            success: false,
            error: "Evento no encontrado",
          };
        }

        // 2. Extract and validate emails
        const emailList = parseEmails(emailsString);

        if (emailList.length === 0) {
          return {
            success: false,
            error: "No se encontraron correos electrónicos válidos",
          };
        }

        if (emailList.length > 100) {
          return {
            success: false,
            error:
              "No se pueden procesar más de 100 correos electrónicos a la vez",
          };
        }

        // 3. Process each email
        const results = {
          successful: 0,
          failed: 0,
          alreadyInvited: 0,
          errors: [] as string[],
        };

        for (const email of emailList) {
          try {
            // 4. Check if user exists, if not create one
            let user = await repositories.userRepository.findByEmail(email);

            if (!user) {
              // Create new user with minimal data
              const newUserData: CreateUserDTO = {
                email,
                name: email.split("@")[0], // Use email prefix as default name
                role: UserRole.ATTENDEE,
              };

              user = await repositories.userRepository.create(newUserData);
            }

            // 5. Check if registration already exists
            const existingRegistration =
              await repositories.registrationRepository.findExactInvitation(
                eventId,
                user.id,
              );

            if (existingRegistration) {
              results.alreadyInvited++;
              continue;
            }

            // 6. Create registration with PENDING status and invite token
            const inviteToken = generateInviteToken();
            const qrCode = generateQRCode(user.id, eventId);

            const registrationData: CreateRegistrationDto = {
              qrCode,
              userId: user.id,
              eventId,
              status: RegistrationStatus.PENDING,
              inviteToken,
              invitedAt: new Date(),
            };

            
              await repositories.registrationRepository.create(
                registrationData,
              );

            // 7. Send invitation email
            const eventDate = new Date(event.start_date).toLocaleDateString(
              "es-MX",
              {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              },
            );

            const eventTime = new Date(event.start_date).toLocaleTimeString(
              "es-MX",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            );

            // Prepare invitation email data
            const invitationData: InvitationEmailDto = {
              userName: user.name || email.split("@")[0],
              userEmail: user.email || email,
              eventName: event.name,
              eventDescription: event.description || "Descripción por confirmar",
              eventDate,
              eventLocation: event.location || "Ubicación por confirmar",
              eventTime,
              eventCapacity: event.capacity,
              customMessage:
                customMessage ||
                "Te invitamos a participar en este increíble evento. ¡Esperamos verte allí!",
              eventDetailsUrl: `${process.env.APP_URL || "http://localhost:3000"}/invitacion/${inviteToken}`,
              supportEmail: "soporte@eventos.com",
              inviteUrl: `${process.env.APP_URL || "http://localhost:3000"}/invitacion/${inviteToken}`,
            };

            // Send invitation email using the existing email service
            // Note: We'll use sendRegistrationConfirmation as a base, but ideally we'd create a sendInvitation method
            await services.emailService.sendInvitationEmail(
              invitationData,
              email,
            );

            results.successful++;
          } catch (error) {
            console.error(`Error processing email ${email}:`, error);
            results.failed++;
            results.errors.push(
              `Error al procesar ${email}: ${error instanceof Error ? error.message : "Error desconocido"}`,
            );
          }
        }

        // 8. Return results summary
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
      },
    );
  } catch (error) {
    console.error("Error sending invitations:", error);
    return {
      success: false,
      error: "Error al enviar las invitaciones",
      message: error instanceof Error ? error.message : "Error desconocido",
    };
  }
};

export const deleteRegistrationAction = async ({
  request,
  context: { repositories, session },
}: Route.ActionArgs): Promise<ActionData> => {
  const formData = Object.fromEntries(await request.formData());
  const registrationId = formData.registrationId as string;
  const userId = session.get("user")?.id;
  const userRole = session.get("user")?.role;

  // Authentication check
  if (!userId) {
    return {
      success: false,
      error: "No se ha iniciado sesión",
    };
  }

  // Authorization check - only organizers and admins can delete registrations
  if (
    !userRole ||
    (userRole !== UserRole.ORGANIZER && userRole !== UserRole.ADMIN)
  ) {
    return {
      success: false,
      error: "No tienes permisos para eliminar registros",
    };
  }

  if (!registrationId) {
    return {
      success: false,
      error: "ID de registro requerido",
    };
  }

  try {
    // First, verify the registration exists and get event info for authorization
    const registration = await repositories.registrationRepository.findOne(registrationId);
    
    if (!registration) {
      return {
        success: false,
        error: "Registro no encontrado",
      };
    }

    // Additional authorization: organizers can only delete registrations from their own events
    if (userRole === UserRole.ORGANIZER) {
      const event = await repositories.eventRepository.findUnique(registration.eventId);
      if (!event || event.organizerId !== userId) {
        return {
          success: false,
          error: "No tienes permisos para eliminar este registro",
        };
      }
    }

    // Delete the registration
    await repositories.registrationRepository.delete(registrationId);

    return {
      success: true,
      message: "Registro eliminado exitosamente. Ahora se puede enviar una nueva invitación.",
    };
  } catch (error) {
    console.error("Error deleting registration:", error);
    return {
      success: false,
      error: "Error interno del servidor al eliminar el registro",
    };
  }
};
