import { RegistrationStatus, UserRole } from "@prisma/client";
import QRCode from "qrcode";
import {
  type CreateUserDTO,
  createUserSchema,
  type UpdateUserDTO,
} from "~/domain/dtos/user.dto";
import {
  decodeInvitationData,
  generateQRCode,
  simplifyZodErrors,
} from "~/shared/lib/utils";
import type { Route } from "../routes/+types/join";

export const createAttendeeAction = async ({
  request,
  params,
  context: { repositories, services },
}: Route.ActionArgs) => {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const { inviteToken } = params;

    const decodedData = decodeInvitationData(inviteToken);
    if (!decodedData) {
      return {
        success: false,
        error: "Invitación no válida o expirada.",
      };
    }

    const { userId, eventId } = decodedData;

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

    let user = null;

    // Verificar si el email ya existe
    user = await repositories.userRepository.findUnique(userId);
    if (!user) {
      user = await repositories.userRepository.create(result.data);
    } else {
      const updateData: UpdateUserDTO = {};

      // Actualizar nombre si se proporciona y es diferente
      if (result.data.name && result.data.name !== user.name) {
        updateData.name = result.data.name;
      }

      // Actualizar teléfono si se proporciona y es diferente
      if (result.data.phone && result.data.phone !== user.phone) {
        updateData.phone = result.data.phone;
      }

      // Solo actualizar si hay campos para actualizar
      if (Object.keys(updateData).length > 0) {
        user = await repositories.userRepository.update(user.id, updateData);
      }
    }

    //Obtener evento

    const event = await repositories.eventRepository.findUnique(eventId);
    if (!event) {
      return {
        error: "Evento no encontrado",
      };
    }

    const maxTickets = event.maxTickets || 0;

    // Contar cuántos tickets ya tiene el usuario en ese event
    const userEventRegister =
      await repositories.registrationRepository.findTickesPurchased(
        eventId,
        userId,
      );

    if (!userEventRegister) {
      return {
        success: false,
        error: "No tienes un registro para este evento.",
      };
    }

    const userTickets = userEventRegister.purchasedTickets || 0;
    if (userTickets + ticketsRequested > maxTickets) {
      return {
        error: `Solo puedes comprar ${maxTickets} tickets como máximo. 
                Actualmente tienes ${userTickets}, 
                intentaste comprar ${ticketsRequested}.`,
      };
    }
    // Tickets totales del evento
    const remainingTickets = event.remainingCapacity || 0; //force to fail.

    // Validación contra capacidad
    if (ticketsRequested > remainingTickets) {
      return {
        error: `No hay suficientes tickets disponibles. 
            Quedan ${remainingTickets} tickets, 
            intentaste comprar ${ticketsRequested}.`,
      };
    }

    //Actualizar registro
    const updateRegistration = await repositories.registrationRepository.update(
      {
        id: userEventRegister.id,
        userId: user.id,
        eventId,
        status: RegistrationStatus.REGISTERED,
        qrCode: generateQRCode(user.id, eventId),
        purchasedTickets:
          (userEventRegister?.purchasedTickets || 0) + ticketsRequested,
        registeredAt: new Date(),
      },
    );

    //Actualizar evento
    await repositories.eventRepository.update({
      id: event.id,
      remainingCapacity: remainingTickets - ticketsRequested,
    });

    // const qrCode = generateQRCode(user.id, eventId);
    // const registrations: CreateRegistrationDto[] = Array.from({
    //   length: ticketsRequested,
    // }).map(() => ({
    //   qrCode,
    //   userId: user.id,
    //   eventId,
    //   status: RegistrationStatus.REGISTERED,
    // }));

    // await Promise.all(
    //   registrations.map((r) => repositories.registrationRepository.create(r))
    // );

    const finalRegistrations =
      await repositories.registrationRepository.findTickesPurchased(
        eventId,
        userId,
      );

    if (!finalRegistrations) {
      return {
        error: "Error al registrar el asistente.",
        success: false,
      };
    }

    const qrCodeUrl = await QRCode.toDataURL(
      `${process.env.APP_URL}/verificar-registro/${finalRegistrations.qrCode}`,
    );

    console.log(qrCodeUrl);

    await services.emailService.sendRegistrationConfirmation(user.email, {
      userName: user.name || "",
      eventName: event.name,
      eventDate: event.start_date.toISOString().split("T")[0],
      eventLocation: event.location,
      eventTime: event.start_date.toISOString().split("T")[1],
      qrCode: finalRegistrations.qrCode,
      qrCodeUrl,
      ticketsQuantity: finalRegistrations.purchasedTickets || 0,
    });

    return {
      message: "Asistente registrado exitosamente.",
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Error al registrar el asistente.",
      message: "Intenta de nuevo más tarde.",
    };
  }
};
