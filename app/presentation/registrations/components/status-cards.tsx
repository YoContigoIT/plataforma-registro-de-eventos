import { Card, CardContent } from "@/shared/components/ui/card";
import { Progress } from "@/shared/components/ui/progress";
import type { RegistrationStatus } from "@prisma/client";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  UserX,
  XCircle,
} from "lucide-react";

interface StatusCardsProps {
  statusCounts: Record<RegistrationStatus, number>;
  getStatusLabel: (status: string) => string;
  getStatusBadgeVariant: (status: string) => string;
  eventCapacity: number;
  remainingCapacity: number;
}

const statusConfig = {
  PENDING: {
    icon: Clock,
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  REGISTERED: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
  },
  WAITLISTED: {
    icon: Users,
    color: "text-sky-600",
    bgColor: "bg-sky-50",
  },
  CHECKED_IN: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  CANCELLED: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
  },
  DECLINED: {
    icon: UserX,
    color: "text-slate-600",
    bgColor: "bg-slate-50",
  },
};

export function StatusCards({
  statusCounts,
  getStatusLabel,
  eventCapacity,
  remainingCapacity,
}: StatusCardsProps) {
  const statuses = Object.keys(statusCounts) as RegistrationStatus[];
  const totalRegistrations = Object.values(statusCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  // Calculate occupancy percentage using the remaining capacity
  const occupiedSpots = eventCapacity - remainingCapacity;
  const occupancyPercentage = (occupiedSpots / eventCapacity) * 100;

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2 md:gap-3 min-w-max">
        <Card className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow p-0 flex-none min-w-[220px]">
          <CardContent className="p-2 px-4 md:p-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="space-y-1">
                    <p className="text-xs truncate">Disponibles</p>
                    <p className="text-lg md:text-xl font-bold">
                      {remainingCapacity}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      de {eventCapacity} lugares
                    </p>
                  </div>
                </div>
                <div className="ml-2">
                  <div className="p-1.5 rounded-lg bg-green-50">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </div>
              <Progress value={occupancyPercentage} className="w-full h-2" />
            </div>
          </CardContent>
        </Card>

        {statuses.map((status) => {
          const count = statusCounts[status] || 0;
          const config = statusConfig[status];
          const Icon = config?.icon || AlertCircle;

          return (
            <Card
              key={status}
              className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow p-0 flex-none min-w-[220px]"
            >
              <CardContent className="p-2 px-4 md:p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="space-y-1">
                      <p className="text-xs">{getStatusLabel(status)}</p>
                      <p className="text-lg md:text-xl font-bold">{count}</p>
                      {totalRegistrations > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {((count / totalRegistrations) * 100).toFixed(0)}% del
                          total
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="ml-2">
                    <div
                      className={`p-1.5 rounded-lg ${
                        config?.bgColor || "bg-slate-50"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          config?.color || "text-slate-600"
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <Card className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow p-0 flex-none min-w-[220px]">
          <CardContent className="p-2 px-4 md:p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="space-y-1">
                  <p className="text-xs truncate">Total</p>
                  <p className="text-lg md:text-xl font-bold">
                    {totalRegistrations}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Total de registros
                  </p>
                </div>
              </div>
              <div className="ml-2">
                <div className="p-1.5 rounded-lg bg-blue-50">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
