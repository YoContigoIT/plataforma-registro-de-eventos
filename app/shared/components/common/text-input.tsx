import type { ReactNode } from "react";
import { cn } from "~/shared/lib/utils";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface Props extends React.ComponentProps<"input"> {
  label?: string;
  error?: string;
  darkLabel?: boolean;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
}

export function TextInput({
  label,
  error,
  darkLabel,
  icon,
  iconPosition = "start",
  className,
  ...props
}: Props) {
  return (
    <div className="grid w-full items-center gap-1.5">
      {label && (
        <Label
          htmlFor={props.name}
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
          className={cn(
            icon && iconPosition === "start" ? "pl-10" : "",
            icon && iconPosition === "end" ? "pr-10" : "",
            className
          )}
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
