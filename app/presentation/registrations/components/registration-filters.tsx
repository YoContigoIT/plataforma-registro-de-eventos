import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import { Filter, X } from "lucide-react";
import { useState } from "react";
import { useRegistrationFilters } from "../hooks/registration-filters.hook";
import { RegistrationFilterContent } from "./registration-filters-content";

export function RegistrationFilters() {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    activeFilterCount,
    currentFilters,
    clearAllFilters,
    handleToggleFilter,
    handleThisMonthToggle,
    invitedAt,
    respondedAt,
    registeredAt,
    checkedInAt,
    handleDateChange,
    handleFilterChange,
    isThisMonthActive,
  } = useRegistrationFilters();

  return (
    <div className="flex items-center gap-2">
      <div className="hidden md:block">
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              <span className="hidden md:block">Filtros</span>
              {activeFilterCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <RegistrationFilterContent
              activeFilterCount={activeFilterCount}
              clearAllFilters={clearAllFilters}
              currentFilters={currentFilters}
              handleFilterChange={handleFilterChange}
              handleToggleFilter={handleToggleFilter}
              handleDateChange={handleDateChange}
              isThisMonthActive={isThisMonthActive}
              handleThisMonthToggle={handleThisMonthToggle}
              invitedAt={invitedAt}
              respondedAt={respondedAt}
              registeredAt={registeredAt}
              checkedInAt={checkedInAt}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="md:hidden">
        <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Filter className="h-4 w-4" />
              {activeFilterCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs flex items-center justify-center"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="p-4 max-h-[85vh] overflow-y-auto">
            <DrawerHeader className="px-0">
              <DrawerTitle>Filtros de registros</DrawerTitle>
            </DrawerHeader>
            <div className="py-2">
              <RegistrationFilterContent
                activeFilterCount={activeFilterCount}
                clearAllFilters={clearAllFilters}
                currentFilters={currentFilters}
                handleFilterChange={handleFilterChange}
                handleToggleFilter={handleToggleFilter}
                handleDateChange={handleDateChange}
                isThisMonthActive={isThisMonthActive}
                handleThisMonthToggle={handleThisMonthToggle}
                invitedAt={invitedAt}
                respondedAt={respondedAt}
                registeredAt={registeredAt}
                checkedInAt={checkedInAt}
              />
            </div>
            <DrawerFooter className="px-0 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full"
              >
                Cerrar
              </Button>
              {activeFilterCount > 0 && (
                <Button
                  onClick={() => {
                    clearAllFilters();
                    setIsDrawerOpen(false);
                  }}
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-1" />
                  Limpiar ({activeFilterCount})
                </Button>
              )}
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </div>
  );
}
