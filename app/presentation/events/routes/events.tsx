import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/ui/button";
import { Pagination } from "@/ui/pagination";
import { CalendarPlus, Grid, List } from "lucide-react";
import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import type { EventEntity } from "~/domain/entities/event.entity";
import { SearchBar } from "~/shared/components/common/search-bar";
import { Card, CardContent } from "~/shared/components/ui/card";
import {
  getEventStatusBadgeVariant,
  getEventStatusLabel,
} from "~/shared/lib/utils";
import { eventsLoader } from "../api/loaders";
import { EventDetailsSheet } from "../components/event-details-sheet";
import { EventGridView } from "../components/event-grid-view";
import { EventListView } from "../components/event-list-view";

export const loader = eventsLoader;

export default function Events() {
  const { events, pagination } = useLoaderData<typeof loader>();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedEvent, setSelectedEvent] = useState<EventEntity | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSelectEvent = (event: EventEntity) => {
    setSelectedEvent(event);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedEvent(null);
  };

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

      <Card>
        <CardContent>
          <SearchBar
            searchParamKey="eventSearch"
            placeholder="Buscar eventos por nombre"
            className="w-full"
          />
        </CardContent>
      </Card>

      <div>
        {viewMode === "grid" ? (
          <EventGridView
            events={events}
            getStatusBadgeVariant={getEventStatusBadgeVariant}
            getStatusLabel={getEventStatusLabel}
            onSelectEvent={handleSelectEvent}
          />
        ) : (
          <>
            {/* List view only on md+ screens */}
            <div className="hidden md:block">
              <EventListView
                events={events}
                getStatusBadgeVariant={getEventStatusBadgeVariant}
                getStatusLabel={getEventStatusLabel}
                onSelectEvent={handleSelectEvent}
              />
            </div>
            {/* Fallback to grid on smaller screens */}
            <div className="block md:hidden">
              <EventGridView
                events={events}
                getStatusBadgeVariant={getEventStatusBadgeVariant}
                getStatusLabel={getEventStatusLabel}
                onSelectEvent={handleSelectEvent}
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

      <EventDetailsSheet
        event={selectedEvent}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        getStatusBadgeVariant={getEventStatusBadgeVariant}
        getStatusLabel={getEventStatusLabel}
      />
    </div>
  );
}
