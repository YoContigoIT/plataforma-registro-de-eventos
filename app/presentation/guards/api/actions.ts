import { RegistrationStatus, UserRole } from "@prisma/client";
import QRCode from "qrcode";
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
      return { success: false, error: "No se ha iniciado sesión" };
    }

    const result = createGuestSchema.safeParse(data);
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

    // Buscar usuario por email
    let user = await repositories.userRepository.findByEmail(email);
    if (!user) {
      user = await repositories.userRepository.create({
        email,
        name,
        phone,
        role: UserRole.ATTENDEE,
      });
    }

    // Buscar evento
    const event = await repositories.eventRepository.findUnique(eventId);
    if (!event) return { success: false, error: "Evento no encontrado" };

    const maxTickets = event.maxTickets || 0;
    const remainingTickets = event.remainingCapacity || 0;

    // Buscar registro previo del usuario en este evento
    const existingRegistration =
      await repositories.registrationRepository.findTickesPurchased(
        eventId,
        user.id
      );

    if (ticketsRequested > maxTickets) {
      return {
        error: `Solo puedes comprar ${maxTickets} tickets como máximo. 
                Intentaste comprar ${ticketsRequested}.`,
      };
    }

    if (ticketsRequested > remainingTickets) {
      return {
        error: `No hay suficientes tickets disponibles. 
                Quedan ${remainingTickets}, intentaste comprar ${ticketsRequested}.`,
      };
    }

    // 🔹 Caso 1: Usuario invitado pendiente
    if (existingRegistration?.status === RegistrationStatus.PENDING) {
      await repositories.registrationRepository.update({
        id: existingRegistration.id,
        qrCode: generateQRCode(user.id, eventId),
        status: RegistrationStatus.CHECKED_IN,
        checkedInAt: new Date(),
        registeredAt: new Date(),
        purchasedTickets: ticketsRequested,
      });

      return {
        success: true,
        message:
          "Usuario invitado pendiente ahora está registrado y en check-in.",
        redirectTo: "/panel",
      };
    }

    // 🔹 Caso 2: Usuario ya registrado
    if (existingRegistration?.status === RegistrationStatus.REGISTERED) {
      await repositories.registrationRepository.update({
        id: existingRegistration.id,
        status: RegistrationStatus.CHECKED_IN,
        checkedInAt: new Date(),
      });

      return {
        success: true,
        message: "El usuario ya estaba registrado y en check-in.",
        redirectTo: "/panel",
      };
    }

    // 🔹 Caso 3: Usuario nuevo

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

    // Actualizar capacidad del evento
    await repositories.eventRepository.update({
      id: event.id,
      remainingCapacity: remainingTickets - ticketsRequested,
    });

    // Buscar registro final
    const finalRegistration =
      await repositories.registrationRepository.findTickesPurchased(
        eventId,
        user.id
      );

    if (!finalRegistration) {
      return { error: "Error al registrar el asistente.", success: false };
    }

    // Enviar QR por correo
    const qrCodeUrl = await QRCode.toDataURL(
      `${process.env.APP_URL}/verificar-registro/${finalRegistration.qrCode}`
    );

    await services.emailService.sendRegistrationConfirmation(user.email, {
      userName: user.name || "",
      eventName: event.name,
      eventDate: event.start_date.toISOString().split("T")[0],
      eventLocation: event.location,
      eventTime: event.start_date.toISOString().split("T")[1],
      qrCode: finalRegistration.qrCode,
      qrCodeUrl,
      ticketsQuantity: finalRegistration.purchasedTickets || 0,
    });

    return {
      success: true,
      message: "Asistente registrado exitosamente.",
      redirectTo: "/panel",
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Error interno al registrar invitado." };
  }
};
