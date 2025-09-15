import { cn } from "@/shared/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../ui/button";

interface PageHeaderProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionsClassName?: string;
  goBack?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  className,
  titleClassName,
  descriptionClassName,
  actionsClassName,
  goBack = undefined,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 backdrop-blur-sm sticky top-0 z-10 px-8 py-4 -mx-8",
        className
      )}
    >
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {goBack && (
          <Button variant="outline" size="icon" asChild>
            <Link to={goBack}>
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
        )}
        <div className="flex flex-col gap-1 min-w-0">
          <h1
            className={cn(
              "text-xl md:text-3xl font-bold truncate",
              titleClassName
            )}
          >
            {title}
          </h1>
          {description && (
            <p
              className={cn(
                "text-muted-foreground text-sm md:text-base truncate",
                descriptionClassName
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      {actions && (
        <div className={cn("flex-shrink-0", actionsClassName)}>{actions}</div>
      )}
    </div>
  );
}
