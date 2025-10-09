import QRCode from "qrcode";
import type { Route as RegisterAttendeeRoute } from "../routes/+types/create-registration";
import type { Route as VerifyRoute } from "../routes/+types/verify";

export const registrationByTokenLoader = async ({
  params,
  context: { repositories },
}: VerifyRoute.LoaderArgs) => {
  const { qrCode } = params;

  if (!qrCode) {
    return {
      success: false,
      error: "No se encontró el codigo de invitación.",
    };
  }

  const invite = await repositories.registrationRepository.findByQrCode(qrCode);

  if (!invite) {
    return {
      success: false,
      error: "Invitación no válida o expirada.",
    };
  }
  const qrCodeUrl = await QRCode.toDataURL(
    `${process.env.DOMAIN}/verificar-registro/${invite.qrCode}`,
  );

  return {
    success: true,
    data: {
      invite,
      event: invite.event,
      user: invite.user,
      qrCodeUrl,
    },
  };
};

export const registerAttendeeLoader = async ({
  request,
  context: { repositories, session },
}: RegisterAttendeeRoute.LoaderArgs) => {
  const url = new URL(request.url);
  const eventId = url.searchParams.get("eventId");
  const email = url.searchParams.get("email"); // Changed from emailInput to email

  const userId = session.get("user")?.id;

  if (!userId) {
    return {
      success: false,
      error: "No se ha iniciado sesión",
    };
  }

  const { data: events } = await repositories.eventRepository.findMany({
    page: 1,
    limit: 100,
  });

  if (!eventId) {
    return {
      events,
      selectedEvent: null,
      existingRegistration: null,
    };
  }

  const selectedEvent = await repositories.eventRepository.findUnique(eventId);

  let existingRegistration = null;
  if (email && eventId) {
    existingRegistration = await repositories.registrationRepository.findByEmailAndEventId(
      email,
      eventId,
    );
  }

  return {
    events,
    selectedEvent,
    existingRegistration,
  };
};
