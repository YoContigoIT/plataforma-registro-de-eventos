import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import type { ComponentType } from "react";
import { memo } from "react";
import { TableHead } from "~/shared/components/ui/table";
import { cn } from "~/shared/lib/utils";
import type { SortState } from "~/shared/types";

interface SortableHeaderProps {
  headerName: string;
  propName: string;
  currentSort: SortState;
  onSort: (column: string) => void;
  className?: string;
  Icon?: ComponentType<{ className?: string }>;
}

export const SortableHeader = memo(
  ({
    headerName,
    propName,
    currentSort,
    onSort,
    className,
    Icon,
  }: SortableHeaderProps) => {
    const isSorted = currentSort.column === propName;

    const getSortIcon = () => {
      if (!isSorted || currentSort.direction === null)
        return <ChevronsUpDown size={12} />;
      return currentSort.direction === "asc" ? (
        <ChevronUp size={12} />
      ) : (
        <ChevronDown size={12} />
      );
    };

    return (
      <TableHead
        className={cn(
          "cursor-pointer select-none",
          isSorted && "text-primary",
          className
        )}
        onClick={() => onSort(propName)}
      >
        <div className="flex items-center space-x-1">
          {Icon && <Icon className="size-4 mr-2 text-muted-foreground" />}
          <span>{headerName}</span>
          {getSortIcon()}
        </div>
      </TableHead>
    );
  }
);

SortableHeader.displayName = "SortableHeader";
