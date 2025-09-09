import { Link } from "react-router";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface ActionButtonProps {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
  variant: string;
  href?: string;
  pending?: boolean;
  pendingText?: string;
}

export function ActionButton({
  icon,
  text,
  onClick,
  variant = "default",
  href,
  pending = false,
  pendingText,
}: ActionButtonProps) {
  const button = (
    <Button
      type="submit"
      onClick={onClick}
      variant="outline"
      disabled={pending}
      className={`flex w-full items-center justify-center px-4 py-2.5 border rounded-lg transition-all duration-200 ${variant}`}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {pendingText || `Procesando...`}
        </>
      ) : (
        <>
          {icon}
          <span className="ml-2">{text}</span>
        </>
      )}
    </Button>
  );

  return href ? <Link to={href}>{button}</Link> : button;
}
