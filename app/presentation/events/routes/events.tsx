import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/ui/button";
import { Pagination } from "@/ui/pagination";
import { CalendarPlus, Grid, List } from "lucide-react";
import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import { eventsLoader } from "../api/loaders";
import { EventGridView } from "../components/event-grid-view";
import { EventListView } from "../components/event-list-view";

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "UPCOMING":
      return "sky";
    case "ONGOING":
      return "emerald";
    case "ENDED":
      return "slate";
    case "CANCELLED":
      return "destructive";
    case "DRAFT":
      return "secondary";
    default:
      return "secondary";
  }
};

// Función para traducir el estado del evento
const getStatusLabel = (status: string) => {
  switch (status) {
    case "UPCOMING":
      return "Próximo";
    case "ONGOING":
      return "En curso";
    case "ENDED":
      return "Finalizado";
    case "CANCELLED":
      return "Cancelado";
    case "DRAFT":
      return "Borrador";
    default:
      return status;
  }
};

export const loader = eventsLoader;

export default function Events() {
  const { events, pagination } = useLoaderData<typeof loader>();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  return (
    <div>
      <PageHeader
        title="Eventos"
        description="Crea y administra eventos"
        actions={
          <div className="flex gap-2">
            <div className="hidden bg-card border rounded-md md:flex items-center p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="size-8"
              >
                <Grid className="size-4" />
                <span className="sr-only">Vista de cuadrícula</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="size-8"
              >
                <List className="size-4" />
                <span className="sr-only">Vista de lista</span>
              </Button>
            </div>
            <Link to="/eventos/crear">
              <Button size="lg">
                <CalendarPlus className="size-5 md:mr-2" />
                <span className="hidden md:block">Crear evento</span>
              </Button>
            </Link>
          </div>
        }
      />

      <div>
        {viewMode === "grid" ? (
          <EventGridView
            events={events}
            getStatusBadgeVariant={getStatusBadgeVariant}
            getStatusLabel={getStatusLabel}
          />
        ) : (
          <>
            {/* List view only on md+ screens */}
            <div className="hidden md:block">
              <EventListView
                events={events}
                getStatusBadgeVariant={getStatusBadgeVariant}
                getStatusLabel={getStatusLabel}
              />
            </div>
            {/* Fallback to grid on smaller screens */}
            <div className="block md:hidden">
              <EventGridView
                events={events}
                getStatusBadgeVariant={getStatusBadgeVariant}
                getStatusLabel={getStatusLabel}
              />
            </div>
          </>
        )}
      </div>

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        itemName={"evento"}
      />
    </div>
  );
}
