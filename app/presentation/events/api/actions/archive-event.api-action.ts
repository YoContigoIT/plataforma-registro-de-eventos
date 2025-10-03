import type { Route as ArchiveRoute } from ".react-router/types/app/presentation/events/routes/+types/archive";
import { UserRole } from "@prisma/client";
import type { ActionData } from "~/shared/types";

export const archiveEventAction = async ({
  params,
  context: { repositories, session },
}: ArchiveRoute.ActionArgs): Promise<ActionData> => {
  const userId = session.get("user")?.id;
  const userRole = session.get("user")?.role;
  const eventId = params.id as string;

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
    console.error("Error al archivar el evento:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Error al archivar el evento",
    };
  }
};
