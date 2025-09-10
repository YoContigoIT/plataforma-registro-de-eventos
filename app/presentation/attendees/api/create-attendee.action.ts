import { UserRole } from "@prisma/client";
import type { CreateRegistrationDto } from "~/domain/dtos/registration.dto";
import { createUserSchema, type CreateUserDTO } from "~/domain/dtos/user.dto";
import { generateQRCode, simplifyZodErrors } from "~/shared/lib/utils";
import type { Route } from "../routes/+types/join";

export const createAttendeeAction = async ({
  request,
  params,
  context: { repositories, services },
}: Route.ActionArgs) => {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    const result = createUserSchema.safeParse({
      email: data.email,
      name: data.name,
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
    user = await repositories.userRepository.findByEmail(result.data.email);
    if (!user) {
      user = await repositories.userRepository.create(result.data);
    }
    // Obtener evento
    const eventId = params.eventId;
    const event = await repositories.eventRepository.findUnique(eventId);
    if (!event) {
      return {
        error: "Evento no encontrado",
      };
    }

    const maxTickets = event.maxTickets || 0;
    const capacity = event.capacity;

    // Contar cuántos tickets ya tiene el usuario en ese event
    const userTickets =
      await repositories.registrationRepository.countRegistrations({
        userId: user.id,
        eventId: eventId,
      });

    if (userTickets + ticketsRequested > maxTickets) {
      return {
        error: `Solo puedes comprar ${maxTickets} tickets como máximo. 
                Actualmente tienes ${userTickets}, 
                intentaste comprar ${ticketsRequested}.`,
      };
    }
    // Tickets totales del evento
    const totalTickets =
      await repositories.registrationRepository.countRegistrations({
        eventId: eventId,
      });

    // Validación contra capacidad
    if (totalTickets + ticketsRequested > capacity) {
      return {
        error: `El evento alcanzó su capacidad máxima de ${capacity} tickets. 
                Actualmente hay ${totalTickets} registrados.`,
      };
    }

    const registrations: CreateRegistrationDto[] = Array.from({
      length: ticketsRequested,
    }).map(() => ({
      qrCode: generateQRCode(user.id, eventId),
      userId: user.id,
      eventId,
    }));

    await Promise.all(
      registrations.map((r) => repositories.registrationRepository.create(r))
    );

    await services.emailService.sendRegistrationConfirmation(user.email, {
      userName: user.name,
      eventName: event.name,
      eventDate: event.start_date.toISOString().split("T")[0],
      eventLocation: event.location,
      eventTime: event.start_date.toISOString().split("T")[1],
      qrCode: registrations[0].qrCode,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(registrations[0].qrCode)}`, //TODO: Cambiar cuando este implementado
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
