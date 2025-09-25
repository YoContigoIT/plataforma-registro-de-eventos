import type { Route as RouteList } from ".react-router/types/app/presentation/events/routes/+types/create";
import { simplifyZodErrors } from "@/shared/lib/utils";
import { EventStatus, RegistrationStatus, UserRole } from "@prisma/client";
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
    remainingCapacity: formData.capacity
      ? Number(formData.capacity)
      : undefined,
  };

  const { data, success, error } = createEventSchema.safeParse(parsedData);

  if (!success) {
    return {
      success: false,
      errors: simplifyZodErrors(error),
    };
  }

  if ([EventStatus.CANCELLED, EventStatus.ENDED].includes(data.status as any)) {
    return {
      success: false,
      error: "No se puede crear un evento como Cancelado o Finalizado.",
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
  context: { repositories, session, services },
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

  const existingEvent = await repositories.eventRepository.findUnique(data.id);
  if (!existingEvent) {
    return { success: false, error: "Evento no encontrado" };
  }

  // Si ya terminó, no se puede cambiar el estado
  if (
    existingEvent.status === EventStatus.ENDED &&
    data.status !== EventStatus.ENDED
  ) {
    return {
      success: false,
      error: "El evento ya terminó, no se permite cambiar el estado.",
    };
  }

  // Si está en curso, solo se permite pasar a Finalizado
  if (
    existingEvent.status === EventStatus.ONGOING &&
    data.status !== EventStatus.ENDED
  ) {
    return {
      success: false,
      error: "Un evento en curso solo puede marcarse como Finalizado.",
    };
  }

  try {
    //edge case: when we update the event capacity, we preserve the updated capacity
    //even if the event is full, we allow the update to keep the capacity
    const statusCounts =
      await repositories.registrationRepository.countAllStatusesByEvent(
        data.id
      );

    const registeredCount =
      (statusCounts.REGISTERED || 0) + (statusCounts.CHECKED_IN || 0);

    const eventCapacity = Number(data.capacity);

    //validate that new capacity is not smaller than current registered attendees
    if (eventCapacity < registeredCount) {
      return {
        success: false,
        error: `No se puede reducir la capacidad a ${eventCapacity} porque ya hay ${registeredCount} personas registradas. 
        La capacidad mínima debe ser ${registeredCount}.`,
      };
    }

    const calculatedRemainingCapacity = Math.max(
      0,
      eventCapacity - registeredCount
    );

    await repositories.eventRepository.update({
      ...data,
      remainingCapacity: calculatedRemainingCapacity,
    });

    if (data.status === EventStatus.CANCELLED) {
      const invitations =
        await repositories.registrationRepository.findByEventId(data.id);
      // Filtrar solo los asistentes con estado válido
      const attendeesToNotify = invitations.filter(
        (invite) =>
          invite.status === RegistrationStatus.REGISTERED ||
          invite.status === RegistrationStatus.CHECKED_IN
      );

      // Generar y enviar el correo de cancelación
      for (const attendee of attendeesToNotify) {
        if (!data.start_date) continue;
        await services.emailService.sendCancelInvitationEmail(
          {
            eventName: data.name || "",
            eventDate: data?.start_date.toLocaleDateString() || "",
            eventTime: data?.start_date.toLocaleTimeString() || "",
            eventLocation: data.location || "",
            userName: attendee.user.name || "",
          },
          attendee.user.email
        );
      }
    }

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
