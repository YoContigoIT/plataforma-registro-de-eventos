# use-search-params-manager.ts — Gestión de parámetros de búsqueda (URL)

## Resumen
Abstrae operaciones comunes sobre `URLSearchParams` integradas con React Router: lectura, set, actualización múltiple, eliminación y reseteo con soporte de navegación condicional.

## Ubicación
`app/shared/hooks/use-search-params-manager.ts`

## Responsabilidades
- Leer valores de parámetros.
- Actualizar un parámetro y navegar opcionalmente a otra ruta.
- Actualizar múltiples parámetros a la vez.
- Eliminar un parámetro.
- Resetear todos o conservar algunos (`resetAllExcept`).

## API pública
- `useSearchParamsManager()`
  - Retorno:
    - `getParamValue(key): string | null`
    - `handleSearchParams(key, value, path?)`
    - `updateMultipleParams(params: Record<string, string>)`
    - `removeParam(key)`
    - `resetAllParams()`
    - `resetAndSetParam(key, value)`
    - `resetAllExcept(keys: string[])`
    - `searchParams: URLSearchParams`

## Componentes involucrados
- React Router: `useLocation`, `useNavigate`, `useSearchParams`.

## Ejemplo de uso
```tsx
import { useSearchParamsManager } from "~/shared/hooks/use-search-params-manager";

export function Filters() {
  const { handleSearchParams, getParamValue, resetAllExcept } =
    useSearchParamsManager();

  const current = getParamValue("q") || "";

  return (
    <div>
      <input
        defaultValue={current}
        onChange={(e) => handleSearchParams("q", e.target.value)}
      />
      <button onClick={() => resetAllExcept(["page"])}>Reset filtros</button>
    </div>
  );
}
```

## Consideraciones y errores
- `handleSearchParams` usa `setSearchParams` si se mantiene la misma ruta; si cambias `path`, navega.
- Valores vacíos eliminan el parámetro, útil para limpiar la URL.
- Estandariza claves como `page`, `sortBy`, `sortOrder`, `q`.

## Mantenimiento
- Centraliza la lógica de parámetros aquí para evitar duplicaciones.
- Documenta las claves que tu app soporta y su semántica.