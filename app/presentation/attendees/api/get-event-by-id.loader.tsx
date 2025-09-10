import type { Route } from "../routes/+types/join";

export async function getEventByIdLoader({
  params,
  context: { repositories },
}: Route.LoaderArgs) {
  const eventId = params.eventId;
  console.log("eventId: ", eventId);

  if (!eventId) {
    return { error: "No se encontró el evento solicitado." };
  }

  // Datos de ejemplo
  return {
    event: {
      id: "1",
      name: "Evento de ejemplo 2024 ",
      date: "2024-12-31",
      location: "Ciudad de Ejemplo",
      description: "Descripción del evento de ejemplo",
    },
  };
}
