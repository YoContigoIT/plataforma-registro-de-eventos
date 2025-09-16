import QRCode from "qrcode";
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
