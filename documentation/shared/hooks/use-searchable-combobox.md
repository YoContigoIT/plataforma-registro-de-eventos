# use-searchable-combobox.hook.ts — Búsqueda debounced en combobox

## Resumen
Gestiona la búsqueda de un combobox mediante parámetros en la URL con `debounce`, facilitando la sincronización del término y su limpieza al cerrar.

## Ubicación
`app/shared/hooks/use-searchable-combobox.hook.ts`

## Responsabilidades
- Actualizar el término de búsqueda en la URL con retardo (`300ms`).
- Leer el valor actual del parámetro.
- Limpiar el parámetro al cerrar el combobox.

## API pública
- `useSearchableCombobox({ searchParamKey })`
  - Props:
    - `searchParamKey: string`
  - Retorno:
    - `handleSearch(term: string)`
    - `handleClearSearchOnClose()`
    - `currentValue?: string`

## Componentes involucrados
- `useSearchParamsManager` para manipular parámetros.
- `use-debounce` (`useDebouncedCallback`) para debounce.

## Ejemplo de uso
```tsx
import { useSearchableCombobox } from "~/shared/hooks/use-searchable-combobox.hook";

export function UserCombobox() {
  const { handleSearch, handleClearSearchOnClose, currentValue } =
    useSearchableCombobox({ searchParamKey: "userSearch" });

  return (
    <div>
      <input
        defaultValue={currentValue}
        onChange={(e) => handleSearch(e.target.value)}
      />
      <button onClick={handleClearSearchOnClose}>Cerrar</button>
    </div>
  );
}
```

## Consideraciones y errores
- `currentValue` proviene de la URL, útil para hidratación del filtro.
- Evita saturar el backend con debounce adecuado.
- Limpia el parámetro al cerrar para evitar estados persistentes.

## Mantenimiento
- Ajusta el tiempo de debounce según UX.
- Unifica la clave `searchParamKey` por pantalla/componente.