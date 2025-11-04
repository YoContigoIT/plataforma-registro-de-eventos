import QRCode from "qrcode";
import { UserRole } from "@prisma/client";
import { handleServiceError } from "~/shared/lib/error-handler";
import type { ActionData } from "~/shared/types";

export const resendQrAction = async ({
  request,
  context: { repositories, services, session },
}: any): Promise<ActionData> => {
  const formData = Object.fromEntries(await request.formData());
  const registrationId = formData.registrationId as string;

  const userId = session.get("user")?.id;
  const userRole = session.get("user")?.role;

  if (!userId) {
    return { success: false, error: "No se ha iniciado sesión" };
  }

  if (!userRole || (userRole !== UserRole.ORGANIZER && userRole !== UserRole.ADMIN)) {
    return { success: false, error: "No tienes permisos para reenviar correos de QR" };
  }

  if (!registrationId) {
    return { success: false, error: "ID de registro requerido" };
  }

  try {
    const registration = await repositories.registrationRepository.findOne(registrationId);

    if (!registration) {
      return { success: false, error: "Registro no encontrado" };
    }

    if (!registration.qrCode) {
      return {
        success: false,
        error: "El registro aún no tiene un código QR. Registra al usuario antes de reenviar.",
      };
    }

    const { user, event } = registration;

    const qrCodeUrl = await QRCode.toDataURL(
      `${process.env.APP_URL || "http://localhost:3000"}/verificar-registro/${registration.qrCode}`,
    );

    const eventStartLocal = new Date(event.start_date);
    const eventTimeFormatted = eventStartLocal.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      // Ajusta la zona horaria si aplica para tus eventos:
      // timeZone: "America/Tijuana",
    });

    const emailResponse = await services.emailService.sendRegistrationConfirmation(user.email, {
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

    if (emailResponse.success) {
      return { success: true, message: "Correo de QR reenviado exitosamente." };
    }

    return { success: false, error: "Error al reenviar el correo de QR." };
  } catch (error) {
    return handleServiceError(error, "Error al reenviar correo de QR.");
  }
};