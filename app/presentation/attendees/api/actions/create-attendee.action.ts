import { RegistrationStatus, UserRole } from "@prisma/client";
import QRCode from "qrcode";
import {
  type CreateUserDTO,
  createUserSchema,
  type UpdateUserDTO,
} from "~/domain/dtos/user.dto";
import type { UserEntity } from "~/domain/entities/user.entity";
import { handleServiceError } from "~/shared/lib/error-handler";
import {
  classifyInvitationToken,
  generateQRCode,
  simplifyZodErrors,
} from "~/shared/lib/utils";
import type { ActionData } from "~/shared/types";
import type { Route } from "../../routes/+types/create-attendee";

export const createAttendeeAction = async ({
  request,
  params,
  context: { repositories, services },
}: Route.ActionArgs): Promise<ActionData> => {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const { inviteToken } = params;

    const tokenClassification = classifyInvitationToken(inviteToken);
    const privateInvitationToken =
      tokenClassification.type === "private"
        ? tokenClassification.payload
        : { userId: "", eventId: "" };

    const result = createUserSchema.safeParse({
      email: data.email,
      name: data.name || "",
      phone: data.phone || undefined,
      role: UserRole.ATTENDEE,
      password: data.password,
    });

    const ticketsRequested = Number(data.quantity) || 1;
    if (ticketsRequested <= 0) {
      return { error: "La cantidad de tickets debe ser mayor a 0." };
    }

    if (!result.success) {
      return {
        error: "Error de validación",
        errors: simplifyZodErrors<CreateUserDTO>(result.error),
      };
    }

    //we resolve eventId and event for both public and private flows
    let eventId = privateInvitationToken.eventId;
    const event =
      tokenClassification.type === "public"
        ? await repositories.eventRepository.findByPublicInviteToken(
            inviteToken
          )
        : await repositories.eventRepository.findUnique(eventId);

    if (!event) {
      return { error: "Evento no encontrado" };
    }

    if (tokenClassification.type === "public") {
      eventId = event.id;
    }

    let user = null as UserEntity | null;
    const isPrivate = tokenClassification.type === "private";

    user = isPrivate
      ? await repositories.userRepository.findUnique(
          privateInvitationToken.userId
        )
      : await repositories.userRepository.findByEmail(result.data.email);

    if (!user) {
      //we need to create if user not found
      user = await repositories.userRepository.create(result.data);
    } else {
      const updateData: UpdateUserDTO = {};
      if (result.data.name && result.data.name !== user.name) {
        updateData.name = result.data.name;
      }
      if (result.data.phone && result.data.phone !== user.phone) {
        updateData.phone = result.data.phone;
      }
      if (Object.keys(updateData).length > 0) {
        user = await repositories.userRepository.update(user.id, updateData);
      }
    }

    const maxTickets = event.maxTickets || 0;

    let registration =
      await repositories.registrationRepository.findTickesPurchased(
        eventId,
        user.id
      );

    const userTickets = registration?.purchasedTickets || 0;
    if (userTickets + ticketsRequested > maxTickets) {
      return {
        success: false,
        error: `Solo puedes comprar un máximo de ${maxTickets} tickets por correo. 
Por favor, intenta con otro correo si deseas adquirir más.`,
      };
    }

    const remainingTickets = event.remainingCapacity || 0;
    if (ticketsRequested > remainingTickets) {
      return {
        error: `No hay suficientes tickets disponibles. 
            Quedan ${remainingTickets} tickets, 
            intentaste comprar ${ticketsRequested}.`,
      };
    }

    // Create or update registration depending on existence
    if (!registration) {
      // Public flow or no prior registration: create a new one
      registration = await repositories.registrationRepository.create({
        userId: user.id,
        eventId,
        status: RegistrationStatus.REGISTERED,
        qrCode: generateQRCode(user.id, eventId),
        purchasedTickets: ticketsRequested,
        registeredAt: new Date(),
        respondedAt: new Date(),
      });
    } else {
      // Private flow or existing public registration: update quantities
      registration = await repositories.registrationRepository.update({
        id: registration.id,
        userId: user.id,
        eventId,
        status: RegistrationStatus.REGISTERED,
        qrCode: generateQRCode(user.id, eventId),
        purchasedTickets: userTickets + ticketsRequested,
        registeredAt: new Date(),
        respondedAt: new Date(),
      });
    }

    await repositories.eventRepository.update({
      id: event.id,
      remainingCapacity: remainingTickets - ticketsRequested,
    });

    if (!registration) {
      return {
        error: "Error al registrar el asistente.",
        success: false,
      };
    }

    const qrCodeUrl = await QRCode.toDataURL(
      `${process.env.APP_URL}/verificar-registro/${registration.qrCode}`
    );

    const eventStartLocal = new Date(event.start_date);
    const eventTimeFormatted = eventStartLocal.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    await services.emailService.sendRegistrationConfirmation(user.email, {
      userName: user.name || "",
      eventName: event.name,
      eventDate: event.start_date.toISOString().split("T")[0],
      eventLocation: event.location,
      eventTime: eventTimeFormatted,
      qrCode: registration.qrCode,
      qrCodeUrl,
      ticketsQuantity: registration.purchasedTickets || 0,
      eventUrl: event.eventUrl || "",
      privacyPolicyUrl: event.privacyPolicyUrl || "",
      contactEmail: event.contactEmail || undefined,
    });

    // Verificar si el evento no tiene formulario activo con campos
    const eventForm =
      await repositories.eventFormRepository.findByEventId(eventId);
    const shouldRedirectToSuccess =
      !eventForm ||
      eventForm.isActive !== true ||
      (eventForm.fields?.length ?? 0) === 0;

    return {
      success: true,
      message: "Asistente registrado exitosamente.",
      data: { registrationId: registration.id },
      redirectTo: shouldRedirectToSuccess ? "/registro-exitoso" : undefined,
    };
  } catch (error) {
    return handleServiceError(error, "Error al registrar el asistente.");
  }
};
