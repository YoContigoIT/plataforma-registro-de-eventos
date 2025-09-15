import { cn } from "@/lib/utils";
import { Label } from "../ui/label";
import { DatePicker } from "./date-picker";

interface DateInputProps {
  label?: string;
  error?: string;
  darkLabel?: boolean;
  value?: Date | string;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  includeTime?: boolean;
  timeFormat?: "12h" | "24h";
}

export function DateInput({
  label,
  error,
  darkLabel,
  value,
  onChange,
  placeholder,
  name,
  id,
  required,
  className,
  onInputChange,
  includeTime = false,
  timeFormat = "24h",
}: DateInputProps) {
  return (
    <div className="grid w-full items-center gap-1.5">
      {label && (
        <Label
          htmlFor={id || name}
          className={cn(
            darkLabel
              ? "text-white text-sm font-medium"
              : "text-sm font-medium",
            label ? "text-sm font-medium" : "text-sm font-medium"
          )}
        >
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="relative">
        <DatePicker
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          name={name}
          onInputChange={onInputChange}
          className={className}
          includeTime={includeTime}
          timeFormat={timeFormat}
        />
      </div>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
}
