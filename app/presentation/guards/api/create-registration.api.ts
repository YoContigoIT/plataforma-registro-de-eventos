import { RegistrationStatus, UserRole } from "@prisma/client";
import QRCode from "qrcode";
import {
  type CreateFormResponseDTO,
  createFormResponseSchema,
} from "~/domain/dtos/form-response.dto";
import type { CreateRegistrationDto } from "~/domain/dtos/registration.dto";
import { type CreateGuestDTO, createGuestSchema } from "~/domain/dtos/user.dto";
import { runInTransaction } from "~/infrastructure/db/prisma";
import { handleServiceError } from "~/shared/lib/error-handler";
import {
  generateQRCode,
  simplifyZodErrors
} from "~/shared/lib/utils";
import type { Route as CreateRegistrationRoute } from "../routes/+types/create-registration";
export const createRegistrationAction = async ({
  request,
  context: { repositories, session, services },
}: CreateRegistrationRoute.ActionArgs) => {
  const userId = session.get("user")?.id;
  const userRole = session.get("user")?.role;

  if (!userId) {
    return {
      success: false,
      error: "No se ha iniciado sesión",
    };
  }

  if (
    !userRole ||
    (userRole !== UserRole.GUARD && userRole !== UserRole.ADMIN)
  ) {
    return {
      success: false,
      error: "No tienes permisos para registrar asistentes",
    };
  }

  try {
    return await runInTransaction(async () => {
      const data = Object.fromEntries(await request.formData());

      const parsedData = {
        email: data.email,
        quantity: data.quantity,
        eventId: data.eventId,
        name: data.name,
        phone: data.phone,
      };

      const result = createGuestSchema.safeParse(parsedData);

      if (!result.success) {
        return {
          success: false,
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

      const registration: CreateRegistrationDto = {
        qrCode: generateQRCode(user.id, eventId),
        eventId,
        userId: user.id,
        status: RegistrationStatus.CHECKED_IN,
        registeredAt: new Date(),
        respondedAt: new Date(),
        purchasedTickets: ticketsRequested,
        checkedInAt: new Date(),
      };

      const newRegistration =
        await repositories.registrationRepository.create(registration);

      const eventFormData = {
        registrationId: newRegistration.id, //at this point is non existent, we will set it later after creating the registration
        fieldResponses: [] as { fieldId: string; value: string }[],
      };

      for (const [key, value] of Object.entries(data)) {
        if (key.startsWith("field_")) {
          const fieldId = key.replace("field_", "");
          eventFormData.fieldResponses.push({
            fieldId,
            value: value as string,
          });
        }
      }

      //we dont need it right now but we might as well validate right now
      const formResponseResult =
        createFormResponseSchema.safeParse(eventFormData);

      if (!formResponseResult.success) {
        return {
          success: false,
          error: "Error de validación",
          errors: simplifyZodErrors<CreateFormResponseDTO>(
            formResponseResult.error
          ),
        };
      }

      const formResponse = await repositories.formResponseRepository.create({
        registrationId: newRegistration.id,
        fieldResponses: eventFormData.fieldResponses,
      });

      console.log("registered response: ", formResponse);

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
    });
  } catch (error) {
    return handleServiceError(error, "Error al registrar asistente.");
  }
};
