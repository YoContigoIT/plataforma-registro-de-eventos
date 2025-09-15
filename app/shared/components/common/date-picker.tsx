/** biome-ignore-all lint/a11y/noStaticElementInteractions: <needed in order to work correctly> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <needed in order to work correctly> */

import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { Button } from "~/shared/components/ui/button";
import { Calendar } from "~/shared/components/ui/calendar";
import { Input } from "~/shared/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/shared/components/ui/popover";

interface DatePickerProps {
  value?: Date | string;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  name?: string;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  includeTime?: boolean;
  timeFormat?: "12h" | "24h";
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  className,
  name,
  onInputChange,
  includeTime = false,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? (typeof value === "string" ? new Date(value) : value) : undefined
  );
  const [open, setOpen] = React.useState(false);
  const [timeValue, setTimeValue] = React.useState<string>(
    date ? format(date, "HH:mm") : "00:00"
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate && includeTime) {
      const [hours, minutes] = timeValue.split(":").map(Number);
      selectedDate.setHours(hours, minutes, 0, 0);
    }

    setDate(selectedDate);
    onChange?.(selectedDate);

    if (onInputChange && name) {
      const event = {
        target: {
          name,
          value: selectedDate ? selectedDate.toISOString() : "",
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onInputChange(event);
    }

    if (!name) {
      setOpen(false);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);

    if (date) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const newDate = new Date(date);
      newDate.setHours(hours, minutes, 0, 0);

      setDate(newDate);
      onChange?.(newDate);

      if (onInputChange && name) {
        const event = {
          target: {
            name,
            value: newDate.toISOString(),
          },
        } as React.ChangeEvent<HTMLInputElement>;
        onInputChange(event);
      }
    }
  };

  React.useEffect(() => {
    if (value) {
      const newDate = typeof value === "string" ? new Date(value) : value;
      setDate(newDate);
      if (includeTime) {
        setTimeValue(format(newDate, "HH:mm"));
      }
    }
  }, [value, includeTime]);

  const formatDisplayDate = (date: Date) => {
    if (includeTime) {
      return format(date, "PPP 'a las' HH:mm", { locale: es });
    }
    return format(date, "PPP", { locale: es });
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            data-empty={!date}
            className={cn(
              "w-full justify-start bg-input/30 dark:bg-input/30 text-left font-normal shadow-none",
              !date && "text-muted-foreground",
              className
            )}
            name={name}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? formatDisplayDate(date) : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 !z-[100] pointer-events-auto"
          align="start"
        >
          <div onClick={(e) => e.stopPropagation()}>
            <Calendar
              captionLayout="dropdown"
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              defaultMonth={date}
              locale={es}
            />
            {includeTime && (
              <div className="p-3 border-t">
                <label
                  className="text-sm font-medium mb-2 block"
                  htmlFor="time"
                >
                  Hora:
                </label>
                <Input
                  type="time"
                  value={timeValue}
                  onChange={handleTimeChange}
                  className="w-full appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                />
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {name && (
        <input
          type="hidden"
          name={name}
          value={date ? date.toISOString() : ""}
        />
      )}
    </>
  );
}
