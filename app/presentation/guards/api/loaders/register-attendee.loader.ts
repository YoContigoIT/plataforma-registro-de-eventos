import { EventStatus } from "@prisma/client";
import type { Route as RegisterAttendeeRoute } from "../../routes/+types/create-registration";

export const registerAttendeeLoader = async ({
  request,
  context: { repositories, session },
}: RegisterAttendeeRoute.LoaderArgs) => {
  const url = new URL(request.url);
  const eventId = url.searchParams.get("eventId");
  const email = url.searchParams.get("email");

  const userId = session.get("user")?.id;

  if (!userId) {
    return {
      success: false,
      error: "No se ha iniciado sesión",
    };
  }

  const { data: events } = await repositories.eventRepository.findMany(
    {
      page: 1,
      limit: 100,
    },
    {
      status: EventStatus.ONGOING,
    }
  );

  if (!eventId) {
    return {
      events,
      selectedEvent: null,
      existingRegistration: null,
    };
  }

  const selectedEvent = await repositories.eventRepository.findUnique(eventId);

  console.log("events", events);

  let existingRegistration = null;
  if (email && eventId) {
    existingRegistration =
      await repositories.registrationRepository.findByEmailAndEventId(
        email,
        eventId
      );
  }

  return {
    events,
    selectedEvent,
    existingRegistration,
  };
};
