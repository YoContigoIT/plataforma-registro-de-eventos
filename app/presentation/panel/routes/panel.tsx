import { UserRole } from "@prisma/client";
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
import type { EventEntityWithEventForm } from "~/domain/entities/event.entity";
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
  const { eventStats, ongoingEvents, upcomingEvents, userRole } =
    useLoaderData<typeof loader>();

  const [selectedEvent, setSelectedEvent] =
    useState<EventEntityWithEventForm | null>(null);
  const [isEventSheetOpen, setIsEventSheetOpen] = useState(false);

  const handleOpenEventSheet = (event: EventEntityWithEventForm) => {
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

  if (userRole === UserRole.GUARD) {
    return (
      <div className="space-y-8">
        <PageHeader
          title="Panel de administración"
          description="Administra invitaciones y registros"
        />

        <section className="space-y-4 md:col-span-2">
          <div className="flex items-center gap-2">
            <Zap className="size-6 text-primary" />
            <h2 className="text-2xl font-bold">Acciones rápidas</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link
              to="/crear-registro"
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border p-6 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:bg-accent/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <span className="text-lg font-medium text-center">
                Registrar sin invitación
              </span>
              <p className="text-sm text-muted-foreground text-center">
                Registra a un asistente sin necesidad de invitación
              </p>
            </Link>
            <Link
              to="/actualizar-registro"
              className="flex flex-col items-center justify-center gap-3 rounded-2xl border p-6 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md hover:bg-accent/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <span className="text-lg font-medium text-center">
                Registrar con invitación
              </span>
              <p className="text-sm text-muted-foreground text-center">
                Registra a un asistente con invitación
              </p>
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Panel de administración"
        description="Administra eventos, usuarios y registros"
      />

      {/* Event Status Cards */}
      <div className="overflow-x-auto mb-8">
        <div className="flex gap-4 min-w-max">
          {Object.entries(eventStats).map(([status, count]) => {
            const percentage =
              totalEvents > 0 ? Math.round((count / totalEvents) * 100) : 0;

            return (
              <Link
                key={status}
                to={`/eventos?status=${status.toUpperCase()}`}
                className="block flex-none"
              >
                <Card className="relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow p-0 flex-none min-w-[220px]">
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

        {userRole === UserRole.ADMIN && (
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <Zap className="size-5" />
              <h2 className="text-xl font-semibold">Acciones rápidas</h2>
            </div>
            <Card>
              <CardContent>
                <div className="grid gap-3">
                  <Link
                    to="/usuarios/crear"
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/20 transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Agregar nuevo usuario</span>
                  </Link>

                  <Link
                    to="/eventos"
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
        )}
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
