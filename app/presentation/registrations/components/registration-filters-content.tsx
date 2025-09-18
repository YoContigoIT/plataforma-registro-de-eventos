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
import { Toggle } from "@/ui/toggle";
import { RegistrationStatus } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "~/shared/lib/utils";

import type { RegistrationFilterState } from "../hooks/registration-filters.hook";

type FilterContent = {
  invitedAt?: Date;
  respondedAt?: Date;
  registeredAt?: Date;
  checkedInAt?: Date;
  activeFilterCount: number;
  clearAllFilters: () => void;
  currentFilters: RegistrationFilterState;
  handleFilterChange: (key: string, value: string | boolean) => void;
  handleToggleFilter: (filterKey: string, isPressed: boolean) => void;
  isThisMonthActive: (
    dateType: "invitedAt" | "respondedAt" | "registeredAt" | "checkedInAt"
  ) => boolean;
  handleThisMonthToggle: (
    pressed: boolean,
    dateType: "invitedAt" | "respondedAt" | "registeredAt" | "checkedInAt"
  ) => void;
  handleDateChange: (
    type: "invitedAt" | "respondedAt" | "registeredAt" | "checkedInAt",
    date: Date | undefined
  ) => void;
};

export const RegistrationFilterContent = ({
  invitedAt,
  respondedAt,
  registeredAt,
  checkedInAt,
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
      <h4 className="hidden md:block font-medium">Filtros de registros</h4>
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
          pressed={currentFilters.isPending}
          onPressedChange={(pressed) =>
            handleToggleFilter("isPending", pressed)
          }
          size="sm"
          className="text-xs h-8"
        >
          Pendientes
        </Toggle>
        <Toggle
          variant="outline"
          pressed={currentFilters.isRegistered}
          onPressedChange={(pressed) =>
            handleToggleFilter("isRegistered", pressed)
          }
          size="sm"
          className="text-xs h-8"
        >
          Registrados
        </Toggle>
        <Toggle
          variant="outline"
          pressed={currentFilters.hasResponded}
          onPressedChange={(pressed) =>
            handleToggleFilter("hasResponded", pressed)
          }
          size="sm"
          className="text-xs h-8"
        >
          Han respondido
        </Toggle>
        <Toggle
          variant="outline"
          pressed={currentFilters.isCheckedIn}
          onPressedChange={(pressed) =>
            handleToggleFilter("isCheckedIn", pressed)
          }
          size="sm"
          className="text-xs h-8"
        >
          Check-in hecho
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
          <SelectItem value={RegistrationStatus.PENDING}>Pendiente</SelectItem>
          <SelectItem value={RegistrationStatus.REGISTERED}>
            Registrado
          </SelectItem>
          <SelectItem value={RegistrationStatus.WAITLISTED}>
            En lista de espera
          </SelectItem>
          <SelectItem value={RegistrationStatus.CANCELLED}>
            Cancelado
          </SelectItem>
          <SelectItem value={RegistrationStatus.DECLINED}>Rechazado</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div>
      <Label className="text-sm font-medium">Fecha de invitación</Label>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !invitedAt && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {invitedAt
                ? format(invitedAt, "dd/MM/yyyy", { locale: es })
                : "Fecha invitación"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={invitedAt}
              onSelect={(date) => handleDateChange("invitedAt", date)}
            />
          </PopoverContent>
        </Popover>

        <Toggle
          variant="outline"
          pressed={isThisMonthActive("invitedAt")}
          onPressedChange={(pressed) =>
            handleThisMonthToggle(pressed, "invitedAt")
          }
          size="sm"
          className="text-xs h-10"
        >
          Este mes
        </Toggle>
      </div>
    </div>

    <div>
      <Label className="text-sm font-medium">Fecha de respuesta</Label>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal",
                !respondedAt && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {respondedAt
                ? format(respondedAt, "dd/MM/yyyy", { locale: es })
                : "Fecha respuesta"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={respondedAt}
              onSelect={(date) => handleDateChange("respondedAt", date)}
            />
          </PopoverContent>
        </Popover>

        <Toggle
          variant="outline"
          pressed={isThisMonthActive("respondedAt")}
          onPressedChange={(pressed) =>
            handleThisMonthToggle(pressed, "respondedAt")
          }
          size="sm"
          className="text-xs h-10"
        >
          Este mes
        </Toggle>
      </div>
    </div>

    <Separator />

    {/* <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm">En lista de espera</Label>
        <Switch
          checked={currentFilters.isWaitlisted}
          onCheckedChange={(checked) =>
            handleFilterChange("isWaitlisted", checked)
          }
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-sm">Cancelados</Label>
        <Switch
          checked={currentFilters.isCancelled}
          onCheckedChange={(checked) =>
            handleFilterChange("isCancelled", checked)
          }
        />
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-sm">Rechazados</Label>
        <Switch
          checked={currentFilters.isDeclined}
          onCheckedChange={(checked) =>
            handleFilterChange("isDeclined", checked)
          }
        />
      </div>
    </div> */}
  </div>
);
