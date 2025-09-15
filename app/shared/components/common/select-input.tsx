import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface SelectOption {
  value: string;
  label: string;
}

interface Props {
  label?: string;
  error?: string;
  darkLabel?: boolean;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  options: SelectOption[];
  placeholder?: string;
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
  size?: "sm" | "default" | "lg";
}

export function SelectInput({
  label,
  error,
  darkLabel,
  icon,
  iconPosition = "start",
  options,
  placeholder,
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
  size = "default",
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
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="relative">
        {icon && iconPosition === "start" && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none z-10">
            {icon}
          </div>
        )}
        <Select
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          name={name}
          disabled={disabled}
        >
          <SelectTrigger
            id={id || name}
            size={size}
            className={cn(
              "w-full",
              icon && iconPosition === "start" ? "pl-10" : "",
              icon && iconPosition === "end" ? "pr-10" : "",
              className
            )}
            aria-invalid={ariaInvalid}
            aria-describedby={ariaDescribedBy}
          >
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {icon && iconPosition === "end" && (
          <div className="absolute inset-y-0 right-8 flex items-center pr-3 pointer-events-none">
            {icon}
          </div>
        )}
      </div>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
}
