import {
  Calendar,
  Clock,
  Play,
  Plus,
  UserPlus,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import type { EventEntity } from "~/domain/entities/event.entity";
import { EventDetailsSheet } from "~/presentation/events/components/event-details-sheet";
import { PageHeader } from "~/shared/components/common/page-header";
import { Badge } from "~/shared/components/ui/badge";
import { Card, CardContent } from "~/shared/components/ui/card";
import {
  getEventStatusBadgeVariant,
  getEventStatusLabel,
} from "~/shared/lib/utils";
import { dashboardLoader } from "../api/dashboard.loader";

export const loader = dashboardLoader;

export default function Panel() {
  const { eventStats, ongoingEvents, upcomingEvents } =
    useLoaderData<typeof loader>();

  const [selectedEvent, setSelectedEvent] = useState<EventEntity | null>(null);
  const [isEventSheetOpen, setIsEventSheetOpen] = useState(false);

  const handleOpenEventSheet = (event: EventEntity) => {
    setSelectedEvent(event);
    setIsEventSheetOpen(true);
  };

  const handleCloseEventSheet = () => {
    setIsEventSheetOpen(false);
    setSelectedEvent(null);
  };

  const totalEvents = Object.values(eventStats).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel de administración"
        description="Administra eventos, usuarios y registros"
      />

      {/* Event Status Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {Object.entries(eventStats).map(([status, count]) => {
          const percentage =
            totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0;

          return (
            <Link
              key={status}
              to={`/events?status=${status}`}
              className="block"
            >
              <Card className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow p-0">
                <CardContent className="p-2 px-4 md:p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="space-y-1">
                        <p className="text-xs">
                          {getEventStatusLabel(status.toUpperCase())}
                        </p>
                        <p className="text-lg md:text-xl font-bold">{count}</p>
                        {totalEvents > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {percentage}% del total
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="ml-2">
                      <div className="p-1.5 rounded-lg bg-slate-50">
                        <Calendar className="h-4 w-4 text-slate-600" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid md:grid-cols-10 gap-6">
        <div className="space-y-4 md:col-span-4">
          <div className="flex items-center gap-2">
            <Play className="size-5" />
            <h2 className="text-xl font-semibold">Eventos en Curso</h2>
          </div>
          <Card>
            <CardContent>
              <div className="space-y-3">
                {ongoingEvents.length > 0 ? (
                  ongoingEvents.map((event) => (
                    // biome-ignore lint/a11y/useSemanticElements: <its needed>
                    <div
                      key={event.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleOpenEventSheet(event)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleOpenEventSheet(event);
                        }
                      }}
                      className="flex items-center justify-between hover:bg-accent/20 transition-colors p-3 rounded-lg cursor-pointer border border-transparent hover:border-accent"
                    >
                      <div>
                        <h4 className="font-medium">{event.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.start_date).toLocaleDateString()} -{" "}
                          {new Date(event.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getEventStatusBadgeVariant(event.status)}
                        >
                          {getEventStatusLabel(event.status)}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No hay eventos en curso actualmente
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 md:col-span-4">
          <div className="flex items-center gap-2">
            <Clock className="size-5" />
            <h2 className="text-xl font-semibold">
              Próximos eventos (30 días)
            </h2>
          </div>
          <Card>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => (
                    // biome-ignore lint/a11y/useSemanticElements: <its needed>
                    <div
                      key={event.id}
                      onClick={() => handleOpenEventSheet(event)}
                      className="flex items-center justify-between hover:bg-accent/20 transition-colors p-3 rounded-lg cursor-pointer border border-transparent hover:border-accent"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleOpenEventSheet(event);
                        }
                      }}
                    >
                      <div>
                        <h4 className="font-medium">{event.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Inicia:{" "}
                          {new Date(event.start_date).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Estado: {getEventStatusLabel(event.status)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getEventStatusBadgeVariant(event.status)}
                        >
                          {getEventStatusLabel(event.status)}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    No hay eventos próximos en los siguientes 30 días
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-2">
            <Zap className="size-5" />
            <h2 className="text-xl font-semibold">Acciones rápidas</h2>
          </div>
          <Card>
            <CardContent>
              <div className="grid gap-3">
                <Link
                  to="/events/new"
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/20 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Crear nuevo evento</span>
                </Link>
                <Link
                  to="/usuarios/crear"
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/20 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Agregar nuevo usuario</span>
                </Link>
                <Link
                  to="/events"
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/20 transition-colors"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Gestionar eventos</span>
                </Link>
                <Link
                  to="/usuarios"
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/20 transition-colors"
                >
                  <Users className="h-4 w-4" />
                  <span>Gestionar usuarios</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <EventDetailsSheet
        event={selectedEvent}
        isOpen={isEventSheetOpen}
        onClose={handleCloseEventSheet}
        getStatusBadgeVariant={getEventStatusBadgeVariant}
        getStatusLabel={getEventStatusLabel}
      />
    </div>
  );
}
