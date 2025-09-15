export const clientPrismaErrors: Record<string, string> = {
  // Errores de Conexión
  P1000:
    "No pudimos conectarnos a la base de datos. Por favor, intenta más tarde.",
  P1001: "El servicio no está disponible en este momento.",
  P1002: "La conexión está tardando demasiado. Por favor, intenta de nuevo.",

  // Errores de Validación
  P2000: "El texto ingresado es demasiado largo.",
  P2001: "No encontramos el registro que buscas.",
  P2002: "Este registro ya existe en la base de datos.",
  P2003:
    "No se puede eliminar este registro porque está siendo usado en otro lugar.",
  P2005: "Uno de los valores ingresados no es válido.",
  P2006: "Los datos proporcionados no son válidos.",
  P2011: "Falta información requerida.",
  P2012: "Por favor, completa todos los campos obligatorios.",
  P2014: "Esta acción no es posible debido a registros relacionados.",

  // Errores de Operación
  P2015: "No encontramos la información relacionada.",
  P2018: "Falta información necesaria para completar la operación.",
  P2019: "Los datos ingresados no son correctos.",
  P2020: "Uno de los valores está fuera del rango permitido.",
  P2021: "La información solicitada no existe.",
  P2022: "No encontramos uno de los campos solicitados.",
  P2024: "El servidor está ocupado. Por favor, intenta de nuevo.",
  P2025: "No se pudo completar la operación por falta de datos.",
  P2030: "No se puede realizar esta búsqueda.",
  P2033: "El número ingresado es demasiado grande.",

  // Errores de Sistema
  P2034:
    "Hubo un conflicto al procesar tu solicitud. Por favor, intenta de nuevo.",
  P2037: "El sistema está ocupado. Por favor, intenta más tarde.",
  P6000: "Ocurrió un error inesperado.",
  P6004: "La operación está tomando demasiado tiempo.",
  P5011: "Demasiadas solicitudes. Por favor, espera un momento.",

  // Error por defecto
  DEFAULT:
    "Ocurrió un error inesperado. Por favor, intenta de nuevo más tarde.",
};
