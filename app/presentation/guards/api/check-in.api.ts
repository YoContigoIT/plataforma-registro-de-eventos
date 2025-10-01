import { RegistrationStatus } from "@prisma/client";
import { handleServiceError } from "~/shared/lib/error-handler";
import type { ActionData } from "~/shared/types";
import type { Route as CheckInRoute } from "../routes/actions/+types/check-in.action";

export const createCheckInAction = async ({
  params,
  context: { repositories },
}: CheckInRoute.ActionArgs): Promise<ActionData> => {
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
      redirectTo: "/panel",
    };
  } catch (error) {
    return handleServiceError(error, "Error al hacer check-in del usuario");
  }
};



