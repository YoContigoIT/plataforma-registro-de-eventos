import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/ui/button";
import { Pagination } from "@/ui/pagination";
import { EventStatus } from "@prisma/client";
import { Download, Eye, Filter, RefreshCw, UserPlus } from "lucide-react";
import { useCallback, useState } from "react";
import { Link, useLoaderData } from "react-router";
import { SearchBar } from "~/shared/components/common/search-bar";
import { Card, CardContent } from "~/shared/components/ui/card";
import { useSearchParamsManager } from "~/shared/hooks/use-search-params-manager";
import { useTableSorting } from "~/shared/hooks/use-table-sorting";
import {
  formatDate,
  formatTime,
  getEventStatusBadgeVariant,
  getEventStatusLabel,
  getStatusBadgeVariant,
  getStatusLabel,
} from "~/shared/lib/utils";
import { eventsLoader } from "../../events/api/loaders";
import { EventDetailsSheet } from "../../events/components/event-details-sheet";
import { registrationsLoader } from "../api/loaders";
import { EventCombobox } from "../components/event-combobox";
import { RegistrationTable } from "../components/registration-table";
import { StatusCards } from "../components/status-cards";
import type { Route } from "./+types/registrations";

export const loader = async (args: Route.LoaderArgs) => {
  const { request, context, params } = args;

  const url = new URL(request.url);
  const eventId = url.searchParams.get("eventId");

  if (!eventId) {
    const eventsData = await eventsLoader({ request, context, params });
    return {
      registrations: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        totalItems: 0,
        itemsPerPage: 10,
      },
      events: eventsData.events,
      selectedEvent: null,
      statusCounts: {},
    };
  }

  const [registrationsData, selectedEvent, statusCounts] = await Promise.all([
    registrationsLoader(args),
    context.repositories.eventRepository.findUnique(eventId),
    context.repositories.registrationRepository.countAllStatusesByEvent(
      eventId
    ),
  ]);

  return {
    ...registrationsData,
    events: [],
    selectedEvent,
    statusCounts,
  };
};

export default function Registrations() {
  const { registrations, pagination, events, selectedEvent, statusCounts } =
    useLoaderData<typeof loader>();
  const { updateMultipleParams, getParamValue, resetAllParams } =
    useSearchParamsManager();
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>(
    []
  );
  const [isEventSheetOpen, setIsEventSheetOpen] = useState(false);

  const { sort, handleSort } = useTableSorting("invitedAt", "desc");

  const eventId = getParamValue("eventId");

  const handleEventSelect = useCallback(
    (eventId: string) => {
      updateMultipleParams({ eventId });
    },
    [updateMultipleParams]
  );

  const handleClearEvent = useCallback(() => {
    resetAllParams();
  }, [resetAllParams]);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      setSelectedRegistrations(checked ? registrations.map((r) => r.id) : []);
    },
    [registrations]
  );

  const handleSelectRegistration = useCallback(
    (registrationId: string, checked: boolean) => {
      setSelectedRegistrations((prev) =>
        checked
          ? [...prev, registrationId]
          : prev.filter((id) => id !== registrationId)
      );
    },
    []
  );

  const handleOpenEventSheet = () => {
    setIsEventSheetOpen(true);
  };

  const handleCloseEventSheet = () => {
    setIsEventSheetOpen(false);
  };

  const getEventStatusMessage = (status: EventStatus) => {
    switch (status) {
      case EventStatus.DRAFT:
        return {
          title:
            "No se pueden ver registros de este evento porque es un borrador",
          description:
            "Cambia el estado del evento a Próximo o En curso para ver sus registros.",
        };
      case EventStatus.CANCELLED:
        return {
          title: "Este evento ha sido cancelado",
          description:
            "No se pueden ver registros ni invitar asistentes a eventos cancelados.",
        };
      default:
        return null;
    }
  };

  const canViewRegistrations =
    selectedEvent?.status === EventStatus.UPCOMING ||
    selectedEvent?.status === EventStatus.ONGOING ||
    selectedEvent?.status === EventStatus.ENDED; // Add ENDED status

  const canSendInvitations =
    selectedEvent?.status === EventStatus.UPCOMING ||
    selectedEvent?.status === EventStatus.ONGOING;

  const statusMessage = getEventStatusMessage(
    selectedEvent?.status || EventStatus.DRAFT
  );

  if (!eventId || !selectedEvent) {
    return (
      <div>
        <PageHeader
          title="Registros"
          description="Selecciona un evento para ver sus registros"
        />

        <div className="mt-8">
          <EventCombobox
            events={events}
            selectedEventId={eventId || undefined}
            onEventSelect={handleEventSelect}
            searchKey="eventSearch"
          />
        </div>

        {events.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No hay eventos disponibles</h3>
            <p className="text-muted-foreground mt-2">
              Crea un nuevo evento para comenzar a gestionar registros.
            </p>
            <Link to="/eventos/crear" className="mt-4 inline-block">
              <Button>
                <UserPlus className="size-4 mr-2" />
                Crear evento
              </Button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Registros - ${selectedEvent.name}`}
        description={`${formatDate(selectedEvent.start_date)} de ${formatTime(selectedEvent.start_date)} a ${formatTime(selectedEvent.end_date)}`}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleOpenEventSheet}>
              <Eye className="size-4 mr-2" />
              Ver evento
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearEvent}>
              <RefreshCw className="size-4 mr-2" />
              Cambiar evento
            </Button>
            {selectedRegistrations.length > 0 && (
              <>
                <Button variant="outline" size="sm">
                  <Download className="size-4 mr-2" />
                  Exportar ({selectedRegistrations.length})
                </Button>
                <Button variant="outline" size="sm">
                  <Filter className="size-4 mr-2" />
                  Acciones masivas
                </Button>
              </>
            )}
            {canSendInvitations && ( //WE CAN only send invitations to upcoming or ongoing events
              <Link to={`/registros/enviar-invitaciones/${selectedEvent.id}`}>
                <Button size="sm">
                  <UserPlus className="size-4 mr-2" />
                  Invitar asistentes
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {selectedEvent.status === EventStatus.ENDED && (
        <div className="bg-muted/50 border border-muted rounded-lg p-4 mb-6">
          <h4 className="font-medium text-sm mb-1">Evento finalizado</h4>
          <p className="text-sm text-muted-foreground">
            Este evento ha finalizado. Puedes ver los registros pero no enviar
            nuevas invitaciones.
          </p>
        </div>
      )}

      {statusMessage && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">{statusMessage.title}</h3>
          <p className="text-muted-foreground mt-2">
            {statusMessage.description}
          </p>
        </div>
      )}

      {canViewRegistrations && (
        <>
          <StatusCards
            statusCounts={statusCounts}
            getStatusLabel={getStatusLabel}
            getStatusBadgeVariant={getStatusBadgeVariant}
            eventCapacity={selectedEvent.capacity}
          />

          <Card>
            <CardContent>
              <SearchBar
                searchParamKey="search"
                placeholder="Buscar registros por nombre usuario, correo"
                className="w-full"
              />
            </CardContent>
          </Card>
        </>
      )}

      {canViewRegistrations && registrations.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium">
            No hay registros para este evento
          </h3>
          <p className="text-muted-foreground mt-2">
            {selectedEvent.status === EventStatus.ENDED
              ? "Este evento no tuvo registros."
              : "Los registros aparecerán aquí"}
          </p>
        </div>
      )}

      {canViewRegistrations && (
        <>
          <RegistrationTable
            registrations={registrations}
            selectedRegistrations={selectedRegistrations}
            onSelectAll={handleSelectAll}
            onSelectRegistration={handleSelectRegistration}
            getStatusBadgeVariant={getStatusBadgeVariant}
            getStatusLabel={getStatusLabel}
            currentSort={sort}
            onSort={handleSort}
            canSendInvite={canSendInvitations}
          />

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.itemsPerPage}
            itemName={"registro"}
          />
        </>
      )}

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
