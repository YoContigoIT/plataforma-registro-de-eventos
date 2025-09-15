import { useCallback, useEffect, useState } from "react";
import type { SortState } from "~/shared/types";
import { useSearchParamsManager } from "./use-search-params-manager";

export function useTableSorting(
  defaultColumn = "createdAt",
  defaultDirection: SortState["direction"] = "desc",
) {
  const { updateMultipleParams, getParamValue } = useSearchParamsManager();

  // Initialize sort state from URL params
  const [sort, setSort] = useState<SortState>(() => {
    const sortBy = getParamValue("sortBy");
    const sortOrder = getParamValue("sortOrder") as SortState["direction"];
    return {
      column: sortBy || defaultColumn,
      direction: sortOrder || defaultDirection,
    };
  });

  // Handle sorting with immediate URL update
  const handleSort = useCallback((column: string) => {
    setSort((prevSort) => {
      let newDirection: "asc" | "desc" | null = "asc";
      
      // If clicking the same column, cycle through: asc -> desc -> null
      if (prevSort.column === column) {
        if (prevSort.direction === "asc") {
          newDirection = "desc";
        } else if (prevSort.direction === "desc") {
          newDirection = null;
        }
      }

      const newSort: SortState = {
        column: newDirection ? column : null,
        direction: newDirection,
      };

      // Update URL immediately
      const paramsToUpdate: Record<string, string> = {};
      if (newSort.direction && newSort.column) {
        paramsToUpdate.sortBy = newSort.column;
        paramsToUpdate.sortOrder = newSort.direction;
      } else {
        paramsToUpdate.sortBy = "";
        paramsToUpdate.sortOrder = "";
      }
      paramsToUpdate.page = "1"; // Reset to first page
      
      updateMultipleParams(paramsToUpdate);
      
      return newSort;
    });
  }, [updateMultipleParams]);

  return { sort, handleSort };
}
