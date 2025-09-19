import QRCode from "qrcode";
import type { Route as RegisterGuestRoute } from "../routes/+types/register-guest";
import type { Route } from "../routes/+types/verify-registration";
export const registrationByTokenLoader = async ({
  params,
  context: { repositories },
}: Route.LoaderArgs) => {
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
    `${process.env.DOMAIN}/verificar-registro/${invite.qrCode}`
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

export const getEventsLoader = async ({
  request,
  context: { repositories, session },
}: RegisterGuestRoute.LoaderArgs) => {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const eventId = url.searchParams.get("eventId");

  const userId = session.get("user")?.id;

  if (!userId) {
    return {
      success: false,
      error: "No se ha iniciado sesión",
    };
  }
  const { data, pagination } = await repositories.eventRepository.findMany();
  let invites = null;
  let user = null;
  if (email) {
    user = await repositories.userRepository.findByEmail(email as string);

    if (user && eventId) {
      invites = await repositories.registrationRepository.findTickesPurchased(
        eventId as string,
        user.id
      );
    }
  }

  return {
    events: data,
    invites,
    user,
  };
};
