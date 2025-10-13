# use-excel-email-extractor.hook.ts — Extracción de correos desde Excel

## Resumen
Provee utilidades para validar correos y extraer emails únicos desde archivos Excel (XLSX), buscando en columnas comunes o en todo el documento cuando no se identifica una columna específica.

## Ubicación
`app/shared/hooks/use-excel-email-extractor.hook.ts`

## Responsabilidades
- Validar formato de correo con regexp.
- Leer archivos Excel con `xlsx` y convertir la primera hoja a JSON.
- Detectar columna de emails por encabezados comunes o buscar en todas las columnas.
- Devolver emails únicos y normalizados.

## API pública
- `useExcelEmailExtractor()`
  - Retorno:
    - `isValidEmail(email: string): boolean`
    - `extractEmailsFromExcel(file: File): Promise<string[]>`

## Componentes involucrados
- Librería `xlsx` para parsing.
- Validación básica por regexp.

## Ejemplo de uso
```tsx
import { useExcelEmailExtractor } from "~/shared/hooks/use-excel-email-extractor.hook";

export function EmailImport() {
  const { extractEmailsFromExcel } = useExcelEmailExtractor();

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const emails = await extractEmailsFromExcel(file);
    console.log("Emails:", emails);
  }

  return <input type="file" accept=".xlsx,.xls" onChange={onFileChange} />;
}
```

## Consideraciones y errores
- Solo procesa la primera hoja; ajusta si necesitas múltiples hojas.
- Maneja errores comunes: archivo vacío, sin hojas, hoja inválida.
- La detección de encabezados es heurística; si no encuentra, recorre todas las celdas.

## Mantenimiento
- Extiende detección de encabezados según tus plantillas.
- Agrega normalización (lowercase, trim) y validaciones adicionales si es necesario.