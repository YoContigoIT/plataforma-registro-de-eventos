import type { Route } from "../routes/+types/join";

export async function getEventByIdLoader({
  params,
  context: { repositories },
}: Route.LoaderArgs) {
  const eventId = params.eventId;

  if (!eventId) {
    return { error: "No se encontró el evento solicitado." };
  }
  const event = await repositories.eventRepository.findUnique(eventId);

  //TODO: Cambiar por el usuario invitado

  const user = await repositories.userRepository.findByEmail(
    "andygtz99@gmail.com"
  );

  if (!event) {
    return {
      success: false,
      error: "Event not found",
    };
  }

  return {
    success: true,
    data: {
      event,
      user,
    },
  };
}
