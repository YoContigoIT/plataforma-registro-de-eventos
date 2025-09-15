import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface PhoneInputProps
  extends Omit<
    React.ComponentProps<"input">,
    "type" | "maxLength" | "pattern"
  > {
  label?: string;
  error?: string;
  darkLabel?: boolean;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
}

export function PhoneInput({
  label,
  error,
  darkLabel,
  icon,
  iconPosition = "start",
  className,
  onChange,
  ...props
}: PhoneInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Solo permitir números y limitar a 10 dígitos
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);

    // Crear un nuevo evento con el valor filtrado
    const newEvent = {
      ...e,
      target: {
        ...e.target,
        value,
      },
    };

    onChange?.(newEvent as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <div className="grid w-full items-center gap-1.5">
      {label && (
        <Label
          htmlFor={props.name}
          className={cn(
            darkLabel
              ? "text-white text-sm font-medium"
              : "text-sm font-medium",
            label ? "text-sm font-medium" : "text-sm font-medium",
          )}
        >
          {label}
          {props.required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="relative">
        {icon && iconPosition === "start" && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            {icon}
          </div>
        )}
        <Input
          type="tel"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          placeholder="1234567890"
          className={cn(
            icon && iconPosition === "start" ? "pl-10" : "",
            icon && iconPosition === "end" ? "pr-10" : "",
            className,
          )}
          onChange={handleChange}
          {...props}
        />
        {icon && iconPosition === "end" && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {icon}
          </div>
        )}
      </div>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
}
