import { Skeleton } from "~/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/shared/components/ui/table";

interface DataTableSkeletonProps {
  columns: number;
  rows?: number;
  showSearch?: boolean;
  showCounter?: boolean;
  showPagination?: boolean;
}

export function DataTableSkeleton({
  columns,
  rows = 5,
  showSearch = true,
  showCounter = true,
  showPagination = true,
}: DataTableSkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Search bar and counter skeleton */}
      {(showSearch || showCounter) && (
        <div className="flex items-center justify-between">
          {showSearch && <Skeleton className="h-10 w-80" />}
          {showCounter && <Skeleton className="h-5 w-32" />}
        </div>
      )}

      {/* Table skeleton */}
      <div className="bg-card rounded-xl border">
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b bg-muted/50">
                {Array.from({ length: columns }).map((_, index) => (
                  <TableHead key={index} className="font-semibold text-foreground">
                    <Skeleton className="h-5 w-20" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-muted/50 transition-colors">
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <TableCell key={colIndex} className="py-4">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination skeleton */}
      {showPagination && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      )}
    </div>
  );
}
