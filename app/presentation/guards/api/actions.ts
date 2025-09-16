import { RegistrationStatus } from "@prisma/client";
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
