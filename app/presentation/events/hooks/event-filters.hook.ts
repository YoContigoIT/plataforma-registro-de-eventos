import type { EventStatus } from "@prisma/client";
import { useMemo, useState } from "react";
import { useSearchParamsManager } from "~/shared/hooks/use-search-params-manager";

export interface FilterState {
  status?: EventStatus;
  startDate?: string;
  endDate?: string;
  isUpcoming?: boolean;
  hasAvailableSpots?: boolean;
  isActive?: boolean;
  archived?: boolean;
}

export const useEventFilters = () => {
  const {
    getParamValue,
    handleSearchParams,
    updateMultipleParams,
    removeParam,
    resetAllParams,
  } = useSearchParamsManager();

  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const currentFilters: FilterState = useMemo<FilterState>(
    () => ({
      status: getParamValue("status") as EventStatus,
      startDate: getParamValue("startDate") || undefined,
      endDate: getParamValue("endDate") || undefined,
      isUpcoming: getParamValue("isUpcoming") === "true",
      hasAvailableSpots: getParamValue("hasAvailableSpots") === "true",
      isActive: getParamValue("isActive") === "true",
      archived: getParamValue("archived") === "true",
    }),
    [getParamValue]
  );
  // Memoize active filter count
  const activeFilterCount = useMemo(
    () =>
      Object.values(currentFilters).filter(
        (value) =>
          value !== undefined && value !== null && value !== false && value !== ""
      ).length,
    [currentFilters]
  );

  const currentMonthBounds = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return { startOfMonth, endOfMonth };
  }, []);

  const handleFilterChange = (key: string, value: string | boolean) => {
    if (value === false || value === "" || value === "todos") {
      removeParam(key);
    } else {
      handleSearchParams(key, String(value));
    }
  };

  const handleDateChange = (
    type: "startDate" | "endDate",
    date: Date | undefined
  ) => {
    if (type === "startDate") {
      setStartDate(date);
    } else {
      setEndDate(date);
    }

    if (date) {
      handleSearchParams(type, date.toISOString());
    } else {
      removeParam(type);
    }
  };

  const clearAllFilters = () => {
    resetAllParams();
    setStartDate(undefined);
    setEndDate(undefined);
  };

  const handleToggleFilter = (filterKey: string, isPressed: boolean) => {
    if (isPressed) {
      handleSearchParams(filterKey, "true");
    } else {
      removeParam(filterKey);
    }
  };

  const handleThisMonthToggle = (isPressed: boolean) => {
    if (isPressed) {
      const { startOfMonth, endOfMonth } = currentMonthBounds;
      updateMultipleParams({
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
      });
      setStartDate(startOfMonth);
      setEndDate(endOfMonth);
    } else {
      removeParam("startDate");
      removeParam("endDate");
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };

  const isThisMonthActive = useMemo(() => {
    return () => {
      if (!currentFilters.startDate || !currentFilters.endDate) return false;

      const { startOfMonth, endOfMonth } = currentMonthBounds;
      const filterStart = new Date(currentFilters.startDate);
      const filterEnd = new Date(currentFilters.endDate);

      return (
        filterStart.toDateString() === startOfMonth.toDateString() &&
        filterEnd.toDateString() === endOfMonth.toDateString()
      );
    };
  }, [currentFilters.startDate, currentFilters.endDate, currentMonthBounds]);

  return {
    activeFilterCount,
    currentFilters,
    handleFilterChange,
    handleDateChange,
    clearAllFilters,
    handleToggleFilter,
    handleThisMonthToggle,
    isThisMonthActive,
    startDate,
    endDate,
  };
};