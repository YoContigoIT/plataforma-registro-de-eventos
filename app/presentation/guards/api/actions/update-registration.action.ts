import { RegistrationStatus, UserRole } from "@prisma/client";
import {
  type CreateFormResponseDTO,
  createFormResponseSchema,
} from "~/domain/dtos/form-response.dto";
import { type CreateGuestDTO, createGuestSchema } from "~/domain/dtos/user.dto";
import { runInTransaction } from "~/infrastructure/db/prisma";
import { handleServiceError } from "~/shared/lib/error-handler";
import { generateQRCode, simplifyZodErrors } from "~/shared/lib/utils";
import type { ActionData } from "~/shared/types";
import type { Route as UpdateRegistrationRoute } from "../../routes/+types/update-registration";

export const updateRegistrationAction = async ({
  request,
  context: { repositories, session },
}: UpdateRegistrationRoute.ActionArgs): Promise<ActionData> => {
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
      error: "No tienes permisos para actualizar registros de asistentes",
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

      const user = await repositories.userRepository.findByEmail(email);
      if (!user) {
        return {
          success: false,
          error:
            "Usuario no encontrado. Use la acción de creación para nuevos usuarios.",
        };
      }

      const event = await repositories.eventRepository.findUnique(eventId);
      if (!event) return { success: false, error: "Evento no encontrado" };

      const maxTickets = event.maxTickets || 0;
      const remainingTickets = event.remainingCapacity || 0;

      const existingRegistration =
        await repositories.registrationRepository.findTickesPurchased(
          eventId,
          user.id
        );

      if (!existingRegistration) {
        return {
          success: false,
          error:
            "No se encontró un registro existente para este usuario en este evento. Use la acción de creación.",
        };
      }

      const currentTickets = existingRegistration.purchasedTickets || 0;
      const ticketDifference = ticketsRequested - currentTickets;

      if (ticketsRequested > maxTickets) {
        return {
          error: `Solo puedes asignar ${maxTickets} tickets como máximo. 
                Intentaste asignar ${ticketsRequested}.`,
        };
      }

      if (ticketDifference > 0 && ticketDifference > remainingTickets) {
        return {
          error: `No hay suficientes tickets disponibles. 
                Quedan ${remainingTickets}, intentaste agregar ${ticketDifference} más.`,
        };
      }

      if (existingRegistration.status === RegistrationStatus.PENDING) {
        await repositories.registrationRepository.update({
          id: existingRegistration.id,
          qrCode: generateQRCode(user.id, eventId),
          status: RegistrationStatus.REGISTERED,
          checkedInAt: new Date(),
          registeredAt: new Date(),
          respondedAt: new Date(),
          purchasedTickets: ticketsRequested,
        });

        if (name !== user.name || phone !== user.phone) {
          await repositories.userRepository.update(user.id, {
            name,
            phone,
          });

          await repositories.registrationRepository.update({
            id: existingRegistration.id,
            name: name,
            phone: phone,
            email: email,
          });
        }

        const eventFormData = {
          registrationId: existingRegistration.id,
          fieldResponses: [] as { fieldId: string; value: any }[],
        };

        for (const [key, value] of Object.entries(data)) {
          if (key.startsWith("field_")) {
            const fieldId = key.replace("field_", "");
            eventFormData.fieldResponses.push({
              fieldId,
              value: Array.isArray(value) ? value : value,
            });
          }
        }

        const existingFormResponse =
          await repositories.formResponseRepository.findByRegistrationId(
            existingRegistration.id
          );

        if (existingFormResponse && eventFormData.fieldResponses.length > 0) {
          await repositories.formResponseRepository.bulkUpdateFieldResponses({
            responseId: existingFormResponse.id,
            fieldUpdates: eventFormData.fieldResponses.map((fr) => ({
              fieldId: fr.fieldId,
              value: fr.value,
            })),
          });
        } else if (eventFormData.fieldResponses.length > 0) {
          const formResponseResult =
            createFormResponseSchema.safeParse(eventFormData);

          if (!formResponseResult.success) {
            return {
              success: false,
              error: "Error de validación del formulario",
              errors: simplifyZodErrors<CreateFormResponseDTO>(
                formResponseResult.error
              ),
            };
          }

          await repositories.formResponseRepository.create({
            registrationId: existingRegistration.id,
            fieldResponses: eventFormData.fieldResponses,
          });
        }

        await repositories.eventRepository.update({
          id: event.id,
          remainingCapacity: remainingTickets - ticketDifference,
        });

        return {
          success: true,
          message:
            "Usuario invitado pendiente ahora está registrado y en check-in.",
          redirectTo: `/actualizar-registro?eventId=${event.id}&email=${user.email}`,
        };
      }

      // 🔹 Caso 2: Usuario ya registrado
      if (existingRegistration.status === RegistrationStatus.REGISTERED) {
        await repositories.registrationRepository.update({
          id: existingRegistration.id,
          status: RegistrationStatus.CHECKED_IN,
          checkedInAt: new Date(),
          purchasedTickets: ticketsRequested,
        });

        if (name !== user.name || phone !== user.phone) {
          await repositories.userRepository.update(user.id, {
            name,
            phone,
          });

          await repositories.registrationRepository.update({
            id: existingRegistration.id,
            name: name,
            phone: phone,
            email: email,
          });
        }

        const eventFormData = {
          registrationId: existingRegistration.id,
          fieldResponses: [] as { fieldId: string; value: any }[],
        };

        for (const [key, value] of Object.entries(data)) {
          if (key.startsWith("field_")) {
            const fieldId = key.replace("field_", "");
            eventFormData.fieldResponses.push({
              fieldId,
              value: Array.isArray(value) ? value : value,
            });
          }
        }

        const existingFormResponse =
          await repositories.formResponseRepository.findByRegistrationId(
            existingRegistration.id
          );

        if (existingFormResponse && eventFormData.fieldResponses.length > 0) {
          await repositories.formResponseRepository.bulkUpdateFieldResponses({
            responseId: existingFormResponse.id,
            fieldUpdates: eventFormData.fieldResponses.map((fr) => ({
              fieldId: fr.fieldId,
              value: fr.value,
            })),
          });
        } else if (eventFormData.fieldResponses.length > 0) {
          const formResponseResult =
            createFormResponseSchema.safeParse(eventFormData);

          if (!formResponseResult.success) {
            return {
              success: false,
              error: "Error de validación del formulario",
              errors: simplifyZodErrors<CreateFormResponseDTO>(
                formResponseResult.error
              ),
            };
          }

          await repositories.formResponseRepository.create({
            registrationId: existingRegistration.id,
            fieldResponses: eventFormData.fieldResponses,
          });
        }

        await repositories.eventRepository.update({
          id: event.id,
          remainingCapacity: remainingTickets - ticketDifference,
        });

        return {
          success: true,
          message: "El usuario ya estaba registrado y ahora está en check-in.",
          redirectTo: `/actualizar-registro?eventId=${event.id}&email=${user.email}`,
        };
      }

      // 🔹 Caso 3: Usuario ya en check-in
      if (existingRegistration.status === RegistrationStatus.CHECKED_IN) {
        await repositories.registrationRepository.update({
          id: existingRegistration.id,
          purchasedTickets: ticketsRequested,
        });

        if (name !== user.name || phone !== user.phone) {
          await repositories.userRepository.update(user.id, {
            name,
            phone,
          });
          await repositories.registrationRepository.update({
            id: existingRegistration.id,
            name: name,
            phone: phone,
            email: email,
          });
        }

        const eventFormData = {
          registrationId: existingRegistration.id,
          fieldResponses: [] as { fieldId: string; value: any }[],
        };

        for (const [key, value] of Object.entries(data)) {
          if (key.startsWith("field_")) {
            const fieldId = key.replace("field_", "");
            eventFormData.fieldResponses.push({
              fieldId,
              value: Array.isArray(value) ? value : value,
            });
          }
        }

        if (eventFormData.fieldResponses.length > 0) {
          const existingFormResponse =
            await repositories.formResponseRepository.findByRegistrationId(
              existingRegistration.id
            );

          if (existingFormResponse) {
            await repositories.formResponseRepository.bulkUpdateFieldResponses({
              responseId: existingFormResponse.id,
              fieldUpdates: eventFormData.fieldResponses.map((fr) => ({
                fieldId: fr.fieldId,
                value: fr.value,
              })),
            });
          } else {
            const formResponseResult =
              createFormResponseSchema.safeParse(eventFormData);

            if (!formResponseResult.success) {
              return {
                success: false,
                error: "Error de validación del formulario",
                errors: simplifyZodErrors<CreateFormResponseDTO>(
                  formResponseResult.error
                ),
              };
            }

            await repositories.formResponseRepository.create({
              registrationId: existingRegistration.id,
              fieldResponses: eventFormData.fieldResponses,
            });
          }
        }

        await repositories.eventRepository.update({
          id: event.id,
          remainingCapacity: remainingTickets - ticketDifference,
        });

        return {
          success: true,
          message: "Registro actualizado exitosamente.",
          redirectTo: `/actualizar-registro?eventId=${event.id}&email=${user.email}`,
        };
      }

      return {
        success: false,
        error: "Estado de registro no válido para actualización.",
      };
    });
  } catch (error) {
    return handleServiceError(error, "Error interno al actualizar registro.");
  }
};
