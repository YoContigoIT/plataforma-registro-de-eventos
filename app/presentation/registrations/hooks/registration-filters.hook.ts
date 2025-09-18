import type { RegistrationStatus } from "@prisma/client";
import { useMemo, useState } from "react";
import { useSearchParamsManager } from "~/shared/hooks/use-search-params-manager";

export interface RegistrationFilterState {
  status?: RegistrationStatus;
  invitedAt?: string;
  respondedAt?: string;
  registeredAt?: string;
  checkedInAt?: string;
  hasResponded?: boolean;
  isCheckedIn?: boolean;
  isPending?: boolean;
  isRegistered?: boolean;
  isWaitlisted?: boolean;
  isCancelled?: boolean;
  isDeclined?: boolean;
}

export const useRegistrationFilters = () => {
  const {
    getParamValue,
    handleSearchParams,
    removeParam,
    resetAllParams,
  } = useSearchParamsManager();

  const [invitedAt, setInvitedAt] = useState<Date | undefined>();
  const [respondedAt, setRespondedAt] = useState<Date | undefined>();
  const [registeredAt, setRegisteredAt] = useState<Date | undefined>();
  const [checkedInAt, setCheckedInAt] = useState<Date | undefined>();

  const currentFilters: RegistrationFilterState = useMemo<RegistrationFilterState>(
    () => ({
      status: getParamValue("status") as RegistrationStatus,
      invitedAt: getParamValue("invitedAt") || undefined,
      respondedAt: getParamValue("respondedAt") || undefined,
      registeredAt: getParamValue("registeredAt") || undefined,
      checkedInAt: getParamValue("checkedInAt") || undefined,
      hasResponded: getParamValue("hasResponded") === "true",
      isCheckedIn: getParamValue("isCheckedIn") === "true",
      isPending: getParamValue("isPending") === "true",
      isRegistered: getParamValue("isRegistered") === "true",
      isWaitlisted: getParamValue("isWaitlisted") === "true",
      isCancelled: getParamValue("isCancelled") === "true",
      isDeclined: getParamValue("isDeclined") === "true",
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
    type: "invitedAt" | "respondedAt" | "registeredAt" | "checkedInAt",
    date: Date | undefined
  ) => {
    if (type === "invitedAt") {
      setInvitedAt(date);
    } else if (type === "respondedAt") {
      setRespondedAt(date);
    } else if (type === "registeredAt") {
      setRegisteredAt(date);
    } else if (type === "checkedInAt") {
      setCheckedInAt(date);
    }

    if (date) {
      handleSearchParams(type, date.toISOString());
    } else {
      removeParam(type);
    }
  };

  const clearAllFilters = () => {
    resetAllParams();
    setInvitedAt(undefined);
    setRespondedAt(undefined);
    setRegisteredAt(undefined);
    setCheckedInAt(undefined);
  };

  const handleToggleFilter = (filterKey: string, isPressed: boolean) => {
    if (isPressed) {
      handleSearchParams(filterKey, "true");
    } else {
      removeParam(filterKey);
    }
  };

  const handleThisMonthToggle = (isPressed: boolean, dateType: "invitedAt" | "respondedAt" | "registeredAt" | "checkedInAt") => {
    if (isPressed) {
      const { startOfMonth, endOfMonth } = currentMonthBounds;
      handleSearchParams(dateType, startOfMonth.toISOString());
      if (dateType === "invitedAt") setInvitedAt(startOfMonth);
      else if (dateType === "respondedAt") setRespondedAt(startOfMonth);
      else if (dateType === "registeredAt") setRegisteredAt(startOfMonth);
      else if (dateType === "checkedInAt") setCheckedInAt(startOfMonth);
    } else {
      removeParam(dateType);
      if (dateType === "invitedAt") setInvitedAt(undefined);
      else if (dateType === "respondedAt") setRespondedAt(undefined);
      else if (dateType === "registeredAt") setRegisteredAt(undefined);
      else if (dateType === "checkedInAt") setCheckedInAt(undefined);
    }
  };

  const isThisMonthActive = useMemo(() => {
    return (dateType: "invitedAt" | "respondedAt" | "registeredAt" | "checkedInAt") => {
      const dateValue = currentFilters[dateType];
      if (!dateValue) return false;

      const { startOfMonth } = currentMonthBounds;
      const filterDate = new Date(dateValue);

      return filterDate.toDateString() === startOfMonth.toDateString();
    };
  }, [currentFilters, currentMonthBounds]);

  return {
    activeFilterCount,
    currentFilters,
    handleFilterChange,
    handleDateChange,
    clearAllFilters,
    handleToggleFilter,
    handleThisMonthToggle,
    isThisMonthActive,
    invitedAt,
    respondedAt,
    registeredAt,
    checkedInAt,
  };
};