import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { type ReactNode, useState } from "react";
import { Link } from "react-router";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface Props extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
  darkLabel?: boolean;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  forgetPassword?: boolean;
}

export function PasswordInput({
  label,
  error,
  darkLabel,
  icon,
  iconPosition = "start",
  forgetPassword,
  className,
  ...props
}: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="grid w-full items-center gap-1.5">
      <div className="flex items-center">
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
        {forgetPassword && (
          <Link
            to="#"
            className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        )}
      </div>
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
          type={!showPassword ? "password" : "text"}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-3 lg:cursor-pointer"
        >
          {showPassword ? (
            <Eye size={18} className="text-muted-foreground" />
          ) : (
            <EyeOff size={18} className="text-muted-foreground" />
          )}
        </button>
      </div>
      {error && <span className="text-sm text-destructive">{error}</span>}
    </div>
  );
}
