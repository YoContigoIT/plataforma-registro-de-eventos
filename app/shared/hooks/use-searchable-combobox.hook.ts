import { useCallback } from "react";
import { useDebouncedCallback } from "use-debounce";
import { useSearchParamsManager } from "./use-search-params-manager";

export function useSearchableCombobox({
  searchParamKey,
}: {
  searchParamKey: string;
}) {
  const { handleSearchParams, removeParam, getParamValue } = useSearchParamsManager();

  const handleSearch = useDebouncedCallback(
    useCallback(
      (term: string) => {
        handleSearchParams(searchParamKey, term);
      },
      [handleSearchParams, searchParamKey],
    ),
    300,
  );

  const handleClearSearchOnClose = useCallback(() => {
    removeParam(searchParamKey);
  }, [removeParam, searchParamKey]);

  const currentValue = getParamValue(searchParamKey) || undefined;

  return {
    handleSearch,
    handleClearSearchOnClose,
    currentValue,
  };
}
