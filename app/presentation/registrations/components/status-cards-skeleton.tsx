import { Card, CardContent } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";

interface StatusCardsSkeletonProps {
  count?: number;
}

export function StatusCardsSkeleton({ count = 7 }: StatusCardsSkeletonProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2 md:gap-3">
      {Array.from({ length: count }).map((_, index) => (
        <Card
          key={`skeleton-card-${crypto.randomUUID()}`}
          className="relative overflow-hidden"
        >
          <CardContent className="p-2 md:p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="space-y-0.5">
                  <Skeleton className="h-5 md:h-6 w-8" />
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-8" />
                </div>
              </div>
              <div className="ml-2">
                <div className="p-1.5 rounded-lg bg-slate-50">
                  <Skeleton className="h-4 w-4" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
