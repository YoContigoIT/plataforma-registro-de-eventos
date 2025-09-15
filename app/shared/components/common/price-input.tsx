import { cn } from "@/lib/utils";
import { type FC, type ReactNode, useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface Props
  extends Omit<
    React.ComponentProps<"input">,
    "type" | "value" | "defaultValue"
  > {
  label?: string;
  error?: string;
  darkLabel?: boolean;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  value?: string | number;
  defaultValue?: string | number;
  allowDecimals?: boolean;
  onValueChange?: (formatted: string, numeric: number) => void;
}

export const PriceInput: FC<Props> = ({
  label,
  error,
  darkLabel,
  icon,
  iconPosition = "start",
  className,
  onChange,
  value,
  defaultValue,
  name,
  allowDecimals = false,
  onValueChange,
  onFocus,
  onBlur,
  ...props
}) => {
  const [inputValue, setInputValue] = useState(value?.toString() || "");
  const [hiddenValue, setHiddenValue] = useState(value?.toString() || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      const formatted = Number(value).toLocaleString("es-MX", {
        maximumFractionDigits: 0,
      });
      setInputValue(formatted);
      setHiddenValue(value.toString());
    } else if (defaultValue !== undefined) {
      const formatted = Number(defaultValue).toLocaleString("es-MX", {
        maximumFractionDigits: 0,
      });
      setInputValue(formatted);
      setHiddenValue(defaultValue.toString());
    }
  }, [value, defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const cleanedValue = rawValue.replace(/,/g, "");
    const numberValue = Number(cleanedValue);

    if (
      /^\d*$/.test(cleanedValue) &&
      !isNaN(numberValue) &&
      numberValue >= 0 &&
      numberValue <= 999999999999
    ) {
      const cursorPosition = e.target.selectionStart;

      const formattedValue = numberValue.toLocaleString("es-MX", {
        maximumFractionDigits: allowDecimals ? 2 : 0,
      });
      setInputValue(formattedValue);
      setHiddenValue(cleanedValue);

      if (cursorPosition !== null) {
        requestAnimationFrame(() => {
          if (inputRef.current) {
            const newCursorPosition =
              cursorPosition + (formattedValue.length - rawValue.length);
            inputRef.current.setSelectionRange(
              newCursorPosition,
              newCursorPosition
            );
          }
        });
      }

      onChange?.(e);
      onValueChange?.(formattedValue, numberValue);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const cleanValue = inputValue.replace(/,/g, "");
    setInputValue(cleanValue);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (inputValue) {
      const numberValue = Number(inputValue.replace(/,/g, ""));
      if (!isNaN(numberValue)) {
        const formatted = numberValue.toLocaleString("es-MX", {
          maximumFractionDigits: allowDecimals ? 2 : 0,
        });
        setInputValue(formatted);
        setHiddenValue(numberValue.toString());
        onValueChange?.(formatted, numberValue);
      }
    }
    onBlur?.(e);
  };

  return (
    <div className="w-full space-y-1">
      {label && (
        <Label
          htmlFor={name}
          className={cn(
            darkLabel
              ? "text-white text-sm font-medium"
              : "text-sm font-medium",
            label ? "text-sm font-medium" : "text-sm font-medium"
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
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={cn(
            icon && iconPosition === "start" ? "pl-10" : "",
            icon && iconPosition === "end" ? "pr-10" : "",
            className
          )}
          {...props}
        />
        <input type="hidden" name={name} value={hiddenValue} />
        {icon && iconPosition === "end" && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {icon}
          </div>
        )}
      </div>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
};
