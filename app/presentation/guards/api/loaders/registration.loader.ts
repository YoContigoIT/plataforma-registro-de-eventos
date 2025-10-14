import QRCode from "qrcode";
import type { Route as VerifyRoute } from "../../routes/+types/verify";

export const registrationByTokenLoader = async ({
  params,
  context: { repositories, session },
}: VerifyRoute.LoaderArgs) => {
  const { qrCode } = params;
  const userId = session.get("user")?.id;
  const userRole = session.get("user")?.role;

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
      userId,
      userRole,
    },
  };
};
