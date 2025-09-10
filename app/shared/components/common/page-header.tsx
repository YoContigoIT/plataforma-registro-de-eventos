import { cn } from "@/shared/lib/utils";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { Button } from "../ui/button";

interface PageHeaderProps {
  title: string | React.ReactNode;
  description?: string | React.ReactNode;
  actions?: React.ReactNode;
  showSearchBar?: boolean;
  searchPlaceholder?: string;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  actionsClassName?: string;
  filtersPeriods?: React.ReactNode;
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
        "flex flex-col gap-4 md:flex-row items-center justify-between backdrop-blur-sm sticky top-0 z-10 py-4",
        className
      )}
    >
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          {goBack && (
            <Button variant="outline" size="icon" asChild>
              <Link to={goBack}>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
          )}
          <h1 className={cn("text-3xl font-bold", titleClassName)}>{title}</h1>
        </div>
        {description && (
          <p className={cn("text-muted-foreground", descriptionClassName)}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className={cn("", actionsClassName)}>{actions}</div>}
    </div>
  );
}
