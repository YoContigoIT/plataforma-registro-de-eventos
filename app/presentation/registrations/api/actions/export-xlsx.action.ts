import type { RegistrationStatus } from "@prisma/client";
import * as xlsx from "xlsx";
import type { ActionData } from "~/shared/types";
import type { Route as RegistrationsRoute } from "../../routes/+types/registrations";

export const exportXLSXAction = async ({
  request,
  context: { repositories, session },
}: RegistrationsRoute.ActionArgs): Promise<ActionData> => {
  const formData = Object.fromEntries(await request.formData());
  const eventId = formData.eventId as string;
  const selectAllAcrossPages = formData.selectAll === "true";
  const rawSelected = formData.selectedRegistrations;

  // Convertimos a array de strings
  let selectedRegistrations: string[] | undefined;
  if (rawSelected) {
    if (typeof rawSelected === "string") {
      // Si viene como "id1,id2,id3"
      selectedRegistrations = rawSelected.split(",");
    } else {
      // Nunca debería ser File, pero por seguridad
      selectedRegistrations = undefined;
    }
  }
  const userId = session.get("user")?.id;

  if (!userId) {
    return { success: false, error: "No se ha iniciado sesión" };
  }
  if (!eventId) {
    return { success: false, error: "ID de evento requerido" };
  }

  const event = await repositories.eventRepository.findUnique(eventId);
  if (!event) {
    return { success: false, error: "Evento no encontrado" };
  }

  const registrations = await repositories.registrationRepository.findForExport(
    eventId,
    {
      selectedRegistrations,
      selectAllAcrossPages,
    },
  );

  if (registrations.length === 0)
    return {
      success: false,
      error: "No hay registros para exportar",
    };

  // Generar XLSX
  const headers = [
    "ID",
    "Nombre",
    "Correo",
    "Fecha de registro",
    "Status",
    "QR Code",
    "Firma",
  ] as const;

  type DataRow = {
    ID: string;
    Nombre: string | null;
    Correo: string;
    "Fecha de registro": string | undefined;
    Status: RegistrationStatus;
    "QR Code": string;
    Firma: string;
  };

  const data: DataRow[] = registrations.map((r) => ({
    ID: r.id,
    Nombre: r.user.name,
    Correo: r.user.email,
    "Fecha de registro": r.registeredAt?.toISOString(),
    Status: r.status,
    "QR Code": r.qrCode,
    Firma: "",
  }));

  const worksheet = xlsx.utils.json_to_sheet(data, {
    header: headers as unknown as string[],
  });

  // Establecer el ancho de las columnas
  const cols = headers.map((key) => {
    const maxLength = Math.max(
      key.length, // ancho del header
      ...data.map((row) => {
        const value = row[key as keyof DataRow];
        return value ? value.toString().length : 0;
      }),
    );
    return { wch: maxLength + 2 }; // +2 para espacio extra
  });

  const firmaIndex = headers.indexOf("Firma");
  if (firmaIndex !== -1) {
    cols[firmaIndex].wch = 40; // ancho mayor para la firma
  }
  worksheet["!cols"] = cols;

  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, "Registros");

  const base64 = xlsx.write(workbook, { bookType: "xlsx", type: "base64" });

  return {
    success: true,
    message: base64,
  };
};
