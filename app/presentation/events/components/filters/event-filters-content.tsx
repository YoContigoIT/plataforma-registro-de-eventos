import { Button } from "@/ui/button";
import { Calendar } from "@/ui/calendar";
import { Label } from "@/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Separator } from "@/ui/separator";
import { Switch } from "@/ui/switch";
import { Toggle } from "@/ui/toggle";
import { EventStatus } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "~/shared/lib/utils";

import type { FilterState } from "../../hooks/event-filters.hook";

type FilterContent = {
  startDate?: Date;
  endDate?: Date;
  activeFilterCount: number;
  clearAllFilters: () => void;
  currentFilters: FilterState;
  handleFilterChange: (key: string, value: string | boolean) => void;
  handleToggleFilter: (filterKey: string, isPressed: boolean) => void;
  isThisMonthActive: () => boolean;
  handleThisMonthToggle: (pressed: boolean) => void;
  handleDateChange: (
    type: "startDate" | "endDate",
    date: Date | undefined
  ) => void;
};

export const EventFilterContent = ({
  startDate,
  endDate,
  activeFilterCount,
  clearAllFilters,
  currentFilters,
  handleFilterChange,
  handleToggleFilter,
  isThisMonthActive,
  handleThisMonthToggle,
  handleDateChange,
}: FilterContent) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <h4 className="hidden md:block font-medium">Filtros de eventos</h4>
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-xs"
        >
          <X className="h-3 w-3"></X>
          <span className="hidden md:block">Limpiar</span>
        </Button>
      )}
    </div>

    <div>
      <Label className="text-sm font-medium">Filtros rápidos</Label>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <Toggle
          variant="outline"
          pressed={currentFilters.isUpcoming}
          onPressedChange={(pressed) =>
            handleToggleFilter("isUpcoming", pressed)
          }
          size="sm"
          className="text-xs h-8"
        >
          Próximos eventos
        </Toggle>
        <Toggle
          variant="outline"
          pressed={isThisMonthActive()}
          onPressedChange={handleThisMonthToggle}
          size="sm"
          className="text-xs h-8"
        >
          Este mes
        </Toggle>
        <Toggle
          variant="outline"
          pressed={currentFilters.hasAvailableSpots}
          onPressedChange={(pressed) =>
            handleToggleFilter("hasAvailableSpots", pressed)
          }
          size="sm"
          className="text-xs h-8"
        >
          Con espacios disponibles
        </Toggle>
        <Toggle
          variant="outline"
          pressed={currentFilters.isActive}
          onPressedChange={(pressed) => handleToggleFilter("isActive", pressed)}
          size="sm"
          className="text-xs h-8"
        >
          Activos
        </Toggle>
      </div>
    </div>

    <Separator />

    <div>
      <Label className="text-sm font-medium">Estado</Label>
      <Select
        value={currentFilters.status || ""}
        onValueChange={(value) => handleFilterChange("status", value)}
      >
        <SelectTrigger className="mt-2">
          <SelectValue placeholder="Seleccionar estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos los estados</SelectItem>
          <SelectItem value={EventStatus.DRAFT}>Borrador</SelectItem>
          <SelectItem value={EventStatus.UPCOMING}>Próximo</SelectItem>
          <SelectItem value={EventStatus.ONGOING}>En curso</SelectItem>
          <SelectItem value={EventStatus.ENDED}>Finalizado</SelectItem>
          <SelectItem value={EventStatus.CANCELLED}>Cancelado</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div>
      <Label className="text-sm font-medium">Rango de fechas</Label>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate
                ? format(startDate, "dd/MM/yyyy", { locale: es })
                : "Fecha inicio"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={startDate}
              onSelect={(date) => handleDateChange("startDate", date)}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {endDate
                ? format(endDate, "dd/MM/yyyy", { locale: es })
                : "Fecha fin"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={endDate}
              onSelect={(date) => handleDateChange("endDate", date)}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>

    <Separator />

    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">Mostrar eventos archivados</Label>
        <Switch
          checked={currentFilters.archived}
          onCheckedChange={(checked) => handleFilterChange("archived", checked)}
        />
      </div>
    </div>
  </div>
);
