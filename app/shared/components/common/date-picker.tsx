import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { Button } from "~/shared/components/ui/button";
import { Calendar } from "~/shared/components/ui/calendar";
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
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  className,
  name,
  onInputChange,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? (typeof value === "string" ? new Date(value) : value) : undefined
  );
  const [open, setOpen] = React.useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onChange?.(selectedDate);

    if (onInputChange && name) {
      const event = {
        target: {
          name,
          value: selectedDate ? selectedDate.toISOString().split("T")[0] : "",
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onInputChange(event);
    }

    // Solo cerrar automáticamente si NO es un formulario (no tiene name)
    if (!name) {
      setOpen(false);
    }
  };

  React.useEffect(() => {
    if (value) {
      const newDate = typeof value === "string" ? new Date(value) : value;
      setDate(newDate);
    }
  }, [value]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            data-empty={!date}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className
            )}
            name={name}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, "PPP", { locale: es })
            ) : (
              <span>{placeholder}</span>
            )}
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
          </div>
        </PopoverContent>
      </Popover>
      {/* Hidden input for form submission */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={date ? date.toISOString().split("T")[0] : ""}
        />
      )}
    </>
  );
}
