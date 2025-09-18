import { RegistrationStatus, UserRole } from "@prisma/client";
import type { CreateRegistrationDto } from "~/domain/dtos/registration.dto";
import { createGuestSchema, type CreateGuestDTO } from "~/domain/dtos/user.dto";
import { generateQRCode, simplifyZodErrors } from "~/shared/lib/utils";
import type { Route } from "../routes/+types/verify-registration";

export const createCheckInAction = async ({
  request,
  params,
  context: { repositories },
}: Route.ActionArgs) => {
  try {
    const { qrCode } = params;

    const registration =
      await repositories.registrationRepository.findByQrCode(qrCode);

    if (!registration) {
      return {
        success: false,
        error: "No se encontró el registro.",
      };
    }

    await repositories.registrationRepository.update({
      id: registration.id,
      status: RegistrationStatus.CHECKED_IN,
      checkedInAt: new Date(),
    });

    return {
      success: true,
      message: "Check-in registrado exitosamente.",
    };
  } catch (error) {
    return {
      success: false,
      error: "Error al crear el check-in",
    };
  }
};

export const createGuestAction = async ({
  request,
  params,
  context: { repositories, session, services },
}: Route.ActionArgs) => {
  try {
    const data = Object.fromEntries(await request.formData());
    const userId = session.get("user")?.id;

    if (!userId) {
      return {
        success: false,
        error: "No se ha iniciado sesión",
      };
    }

    console.log("data: ", data);
    const result = createGuestSchema.safeParse(data);
    console.log("result: ", result);
    if (!result.success) {
      return {
        error: "Error de validación",
        errors: simplifyZodErrors<CreateGuestDTO>(result.error),
      };
    }

    const { email, quantity, eventId, name, phone } = result.data;

    const ticketsRequested = Number(quantity);
    if (ticketsRequested <= 0) {
      return { error: "La cantidad de tickets debe ser mayor a 0." };
    }

    let user = await repositories.userRepository.findByEmail(email);

    if (!user) {
      user = await repositories.userRepository.create({
        email,
        name,
        phone,
        role: UserRole.ATTENDEE,
      });
    }

    //Obtener evento
    const event = await repositories.eventRepository.findUnique(eventId);

    if (!event) {
      return {
        success: false,
        error: "Evento no encontrado",
      };
    }
    const maxTickets = event.maxTickets || 0;

    // Contar cuántos tickets ya tiene el usuario en ese event
    const userEventRegister =
      await repositories.registrationRepository.findTickesPurchased(
        eventId,
        user.id
      );

    if (userEventRegister) {
      return {
        success: false,
        error: "Ya ha comprado tickets para este evento",
      };
    }

    if (ticketsRequested > maxTickets) {
      return {
        error: `Solo puedes comprar ${maxTickets} tickets como máximo. 
                intentaste comprar ${ticketsRequested}.`,
      };
    }

    // Tickets totales del evento
    const remainingTickets = event.remainingCapacity || 0;
    // Validación contra capacidad
    if (ticketsRequested > remainingTickets) {
      return {
        error: `No hay suficientes tickets disponibles. 
            Quedan ${remainingTickets} tickets, 
            intentaste comprar ${ticketsRequested}.`,
      };
    }

    const registration: CreateRegistrationDto = {
      qrCode: generateQRCode(user.id, eventId),
      eventId,
      userId: user.id,
      status: RegistrationStatus.CHECKED_IN,
      registeredAt: new Date(),
      purchasedTickets: ticketsRequested,
      checkedInAt: new Date(),
    };

    await repositories.registrationRepository.create(registration);

    //Actualizar evento
    await repositories.eventRepository.update({
      id: event.id,
      remainingCapacity: remainingTickets - ticketsRequested,
    });

    const finalRegistrations =
      await repositories.registrationRepository.findTickesPurchased(
        eventId,
        user.id
      );

    if (!finalRegistrations) {
      return {
        error: "Error al registrar el asistente.",
        success: false,
      };
    }

    //TODO: Pendiente enviar el correo?
    // const qrCodeUrl = await QRCode.toDataURL(
    //   `${process.env.APP_URL}/verificar-registro/${finalRegistrations.qrCode}`
    // );
    // await services.emailService.sendRegistrationConfirmation(user.email, {
    //   userName: user.name || "",
    //   eventName: event.name,
    //   eventDate: event.start_date.toISOString().split("T")[0],
    //   eventLocation: event.location,
    //   eventTime: event.start_date.toISOString().split("T")[1],
    //   qrCode: finalRegistrations.qrCode,
    //   qrCodeUrl,
    //   ticketsQuantity: finalRegistrations.purchasedTickets || 0,
    // });

    return {
      success: true,
      message: "Asistente registrado exitosamente.",
      redirectTo: "/panel",
    };
  } catch (error) {}
};
