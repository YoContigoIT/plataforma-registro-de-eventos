import * as xlsx from 'xlsx';

/**
 * Hook personalizado para extraer correos electrónicos de archivos Excel
 * @returns Funciones para validar y extraer correos electrónicos de archivos Excel
 */
export function useExcelEmailExtractor() {
  /**
   * Valida si una cadena tiene formato de correo electrónico válido
   * @param email - Cadena a validar
   * @returns true si es un correo electrónico válido, false en caso contrario
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  /**
   * Extrae correos electrónicos de un archivo Excel
   * @param file - Archivo Excel a procesar
   * @returns Promise con un array de correos electrónicos únicos
   */
  const extractEmailsFromExcel = async (file: File): Promise<string[]> => {
    try {
      // Validar el archivo
      if (!file) {
        throw new Error("No se proporcionó ningún archivo.");
      }
      
      if (file.size === 0) {
        throw new Error("El archivo está vacío.");
      }
      
      // Leer el archivo
      const bytes = await file.arrayBuffer();
      const workbook = xlsx.read(bytes, { type: "buffer" });
      
      // Obtener la primera hoja
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error("El archivo Excel no contiene hojas de trabajo.");
      }
      
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        throw new Error("No se pudo leer la hoja de trabajo del archivo Excel.");
      }
      
      // Convertir a JSON
      const rawData = xlsx.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
      }) as string[][];
      
      if (rawData.length === 0) {
        throw new Error("El archivo Excel está vacío.");
      }
      
      // Buscar la columna que contiene correos electrónicos
      const [headerRow, ...dataRows] = rawData;
      
      // Buscar índice de columna que podría contener correos
      const emailColumnIndex = headerRow.findIndex(header => {
        const headerText = String(header).toLowerCase();
        return headerText.includes("correo") || 
               headerText.includes("email") || 
               headerText.includes("e-mail") || 
               headerText.includes("mail");
      });
      
      // Si no se encuentra una columna específica, buscar en todas las columnas
      const emails: string[] = [];
      
      if (emailColumnIndex >= 0) {
        // Extraer correos de la columna específica
        dataRows.forEach(row => {
          if (row[emailColumnIndex] && typeof row[emailColumnIndex] === 'string') {
            const email = row[emailColumnIndex].toString().trim();
            if (email && isValidEmail(email)) {
              emails.push(email);
            }
          }
        });
      } else {
        // Buscar en todas las columnas y filas
        dataRows.forEach(row => {
          row.forEach(cell => {
            if (cell && typeof cell === 'string') {
              const cellValue = cell.toString().trim();
              if (cellValue && isValidEmail(cellValue)) {
                emails.push(cellValue);
              }
            }
          });
        });
      }
      
      // Eliminar duplicados
      return [...new Set(emails)];
    } catch (error) {
      throw new Error(`Error al procesar el archivo Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return {
    isValidEmail,
    extractEmailsFromExcel,
  };
}