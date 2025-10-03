import type { EventEntityWithEventForm } from "~/domain/entities/event.entity";
import type { LoaderData } from "~/shared/types";
import type { Route as DetailRoute } from "../../routes/+types/detail";

export const getEventByIdLoader = async ({
  params,
  context: { repositories },
}: DetailRoute.LoaderArgs): Promise<LoaderData<EventEntityWithEventForm>> => {
  const id = params.id;

  if (!id) {
    return {
      success: false,
      error: "Event ID is required",
    };
  }

  const event = await repositories.eventRepository.findUnique(id);

  if (!event) {
    return {
      success: false,
      error: "Event not found",
    };
  }

  return {
    success: true,
    data: event,
  };
};
