# use-table-sorting.ts — Ordenamiento de tablas con URL params

## Resumen
Controla el estado de ordenamiento de una tabla (columna/dirección) y lo sincroniza con parámetros de la URL, incluyendo ciclo de estados (asc → desc → null) y reseteo de página.

## Ubicación
`app/shared/hooks/use-table-sorting.ts`

## Responsabilidades
- Inicializar sort desde `URLSearchParams`.
- Gestionar cambios de columna con ciclo de dirección.
- Escribir `sortBy` y `sortOrder` en la URL y resetear `page` a `1`.

## API pública
- `useTableSorting(defaultColumn?, defaultDirection?)`
  - Retorno:
    - `sort: { column: string | null; direction: "asc" | "desc" | null }`
    - `handleSort(column: string)`

## Componentes involucrados
- `useSearchParamsManager` para actualizar múltiples parámetros.

## Ejemplo de uso
```tsx
import { useTableSorting } from "~/shared/hooks/use-table-sorting";

export function UsersTableHeader() {
  const { sort, handleSort } = useTableSorting("createdAt", "desc");

  return (
    <div>
      <button onClick={() => handleSort("name")}>
        Nombre {sort.column === "name" ? sort.direction : ""}
      </button>
      <button onClick={() => handleSort("email")}>
        Email {sort.column === "email" ? sort.direction : ""}
      </button>
    </div>
  );
}
```

## Consideraciones y errores
- El ciclo asc/desc/null permite “quitar” orden (útil para reset).
- Al cambiar el orden se resetea `page` a `1`.
- Si `column` es `null`, se eliminan los parámetros de orden de la URL.

## Mantenimiento
- Estandariza nombres de columnas y mapea a claves de backend.
- Integra con tu paginación para resetear correctamente.