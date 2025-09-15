import type { Route as RouteList } from ".react-router/types/app/presentation/events/routes/+types/create";
import { simplifyZodErrors } from "@/shared/lib/utils";
import { EventStatus, UserRole } from "@prisma/client";
import { createEventSchema, updateEventSchema } from "~/domain/dtos/event.dto";
import type { ActionData } from "~/shared/types";

export const createEventAction = async ({
  request,
  context: { repositories, session },
}: RouteList.ActionArgs): Promise<ActionData> => {
  const formData = Object.fromEntries(await request.formData());
  const userId = session.get("user")?.id;

  if (!userId) {
    return {
      success: false,
      error: "No se ha iniciado sesión",
    };
  }

  const parsedData = {
    ...formData,
    capacity: formData.capacity ? Number(formData.capacity) : undefined,
    maxTickets: formData.maxTickets ? Number(formData.maxTickets) : undefined,
    status: formData.status || EventStatus.DRAFT,
    organizerId: userId,
  };

  const { data, success, error } = createEventSchema.safeParse(parsedData);

  if (!success) {
    return {
      success: false,
      errors: simplifyZodErrors(error),
    };
  }

  try {
    await repositories.eventRepository.create(data);

    return {
      success: true,
      message: "Evento creado exitosamente",
      redirectTo: `/eventos`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Error al crear el evento",
    };
  }
};

export const updateEventAction = async ({
  request,
  context: { repositories, session },
}: RouteList.ActionArgs): Promise<ActionData> => {
  const formData = Object.fromEntries(await request.formData());
  const userId = session.get("user")?.id;

  if (!userId) {
    return {
      success: false,
      error: "No se ha iniciado sesión",
    };
  }

  const parsedData = {
    ...formData,
    capacity: formData.capacity ? Number(formData.capacity) : undefined,
    maxTickets: formData.maxTickets ? Number(formData.maxTickets) : undefined,
    status: formData.status || EventStatus.DRAFT,
    organizerId: userId,
  };

  const { data, success, error } = updateEventSchema.safeParse(parsedData);

  if (!success) {
    return {
      success: false,
      errors: simplifyZodErrors(error),
    };
  }

  try {
    await repositories.eventRepository.update(data);

    return {
      success: true,
      message: "Evento actualizado exitosamente",
      redirectTo: `/eventos`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error al actualizar el evento",
    };
  }
};

export const archiveEventAction = async ({
  request,
  context: { repositories, session },
}: RouteList.ActionArgs): Promise<ActionData> => {
  const formData = Object.fromEntries(await request.formData());
  const userId = session.get("user")?.id;
  const userRole = session.get("user")?.role;
  const eventId = formData.id as string;

  if (!userId) {
    return {
      success: false,
      error: "No se ha iniciado sesión",
    };
  }

  if (!userRole || userRole !== UserRole.ADMIN) {
    return {
      success: false,
      error: "No tienes permisos para archivar eventos",
    };
  }

  try {
    await repositories.eventRepository.softDelete(eventId);

    return {
      success: true,
      message: "Evento archivado exitosamente",
      redirectTo: `/eventos`,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Error al archivar el evento",
    };
  }
};

export const testEmailAction = async ({
  request,
  context: { repositories, services, session },
}: RouteList.ActionArgs): Promise<ActionData> => {
  const formData = Object.fromEntries(await request.formData());
  const userId = session.get("user")?.id;
  const eventId = formData.eventId as string;

  if (!userId) {
    return {
      success: false,
      error: "No se ha iniciado sesión",
    };
  }

  try {
    // Get user and event data
    const user = await repositories.userRepository.findUnique(userId);
    const event = await repositories.eventRepository.findUnique(eventId);

    if (!user || !event) {
      return {
        success: false,
        error: "Usuario o evento no encontrado",
      };
    }

    // Generate a test QR code
    const testQrCode = `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(testQrCode)}`;

    // Prepare registration data for email
    const registrationData = {
      userName: user.name,
      eventName: event.name,
      eventDate: new Date(event.start_date).toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      eventLocation: event.location || "Ubicación por confirmar",
      eventTime: new Date(event.start_date).toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      qrCode: testQrCode,
      qrCodeUrl: qrCodeUrl,
      customMessage:
        "Este es un correo de prueba del sistema de confirmación de registro.",
      eventDetailsUrl: `${process.env.APP_URL || "http://localhost:5173"}/eventos/${event.id}`,
      supportEmail: "soporte@eventos.com",
    };

    // Send test email
    const tempEmail = "jesustrujillor23@gmail.com";

    await services.emailService.sendRegistrationConfirmation(
      tempEmail,
      registrationData
    );

    return {
      success: true,
      message: `Correo de prueba enviado exitosamente a ${tempEmail}`,
    };
  } catch (error) {
    console.error("Error sending test email:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error al enviar el correo de prueba",
    };
  }
};
