import type { Route } from "../routes/+types/join";

export const createAttendeeAction = async ({
  request,
  context: { repositories },
}: Route.ActionArgs) => {
  try {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);

    // Aquí puedes agregar validaciones si es necesario

    // Crear asistente
    // await repositories.attendeeRepository.create({
    //   name: data.name as string,
    //   email: data.email as string,
    //   eventId: data.eventId as string,
    // });

    return {
      message: "Asistente registrado exitosamente.",
    };
  } catch (error) {
    console.error(error);
    return {
      error: "Error al registrar el asistente.",
      message: "Intenta de nuevo más tarde.",
    };
  }
};
