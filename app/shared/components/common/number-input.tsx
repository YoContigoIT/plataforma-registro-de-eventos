import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { forwardRef, useEffect, useState } from "react";
import { Input } from "~/shared/components/ui/input";
import { Label } from "~/shared/components/ui/label";

interface NumberInputProps
  extends Omit<ComponentProps<"input">, "type" | "value" | "onChange"> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  value?: number | string;
  onChange?: (value: number | undefined) => void;
  allowDecimals?: boolean;
  allowNegative?: boolean;
  min?: number;
  max?: number;
  placeholder?: string;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      label,
      error,
      icon,
      value,
      onChange,
      allowDecimals = true,
      allowNegative = true,
      min,
      max,
      placeholder,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState<string>(
      value !== undefined && value !== null ? String(value) : ""
    );

    // Sincronizar el valor interno cuando cambia el prop value
    useEffect(() => {
      if (value !== undefined && value !== null) {
        setDisplayValue(String(value));
      } else {
        setDisplayValue("");
      }
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Permitir vacío
      if (inputValue === "") {
        setDisplayValue("");
        onChange?.(undefined);
        return;
      }

      // Solo números (sin puntos ni negativos)
      const numberRegex = /^\d*$/;
      if (!numberRegex.test(inputValue)) {
        return; // Ignorar si no es numérico
      }

      // Validar longitud máxima
      if (max && inputValue.length > max) {
        return;
      }

      // ✅ Actualizar el valor visible del input
      setDisplayValue(inputValue);

      // ✅ Llamar al onChange con el string completo convertido a número
      const numericValue = Number(inputValue);
      if (!Number.isNaN(numericValue)) {
        onChange?.(numericValue);
      } else {
        onChange?.(undefined);
      }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Limpiar formato al perder el foco
      if (displayValue && !Number.isNaN(parseFloat(displayValue))) {
        const numericValue = parseFloat(displayValue);
        setDisplayValue(String(numericValue));
      }
      props.onBlur?.(e);
    };

    return (
      <div className="space-y-2">
        {label && (
          <Label
            htmlFor={props.id}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </Label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          <Input
            {...props}
            ref={ref}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className={cn(
              icon && "pl-10",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500",
              className
            )}
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";

export { NumberInput };
export type { NumberInputProps };
