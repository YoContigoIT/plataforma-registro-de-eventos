import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface Props {
  label?: string;
  error?: string;
  darkLabel?: boolean;
  icon?: ReactNode;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  orientation?: "horizontal" | "vertical";
}

export function RadioGroupInput({
  label,
  error,
  darkLabel,
  icon,
  options,
  value,
  defaultValue,
  onValueChange,
  name,
  id,
  required,
  disabled,
  className,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedBy,
  orientation = "vertical",
}: Props) {
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
          {icon && <span className="mr-2">{icon}</span>}
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <RadioGroup
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        name={name}
        id={id}
        disabled={disabled}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedBy}
        className={cn(
          orientation === "horizontal" ? "flex flex-row gap-6" : "grid gap-3",
          className
        )}
      >
        {options.map((option) => (
          <div key={option.value} className="flex items-center space-x-2">
            <RadioGroupItem
              value={option.value}
              id={`${name || id}-${option.value}`}
            />
            <Label
              htmlFor={`${name || id}-${option.value}`}
              className="text-sm font-normal cursor-pointer"
            >
              <div>
                <div>{option.label}</div>
                {option.description && (
                  <div className="text-xs text-muted-foreground">
                    {option.description}
                  </div>
                )}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
}
