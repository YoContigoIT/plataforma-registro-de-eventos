import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/ui/button";
import { Pagination } from "@/ui/pagination";
import { EventStatus } from "@prisma/client";
import {
  Download,
  Eye,
  Filter,
  MoreHorizontal,
  RefreshCw,
  UserPlus,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useFetcher, useLoaderData } from "react-router";
import { toast } from "sonner";
import { SearchBar } from "~/shared/components/common/search-bar";
import { Card, CardContent } from "~/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/shared/components/ui/dropdown-menu";
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
import { eventsLoader } from "../../events/api/loaders/get-events.loader";
import { EventDetailsSheet } from "../../events/components/views/event-details-sheet";
import { exportXLSXAction } from "../api/actions/export-xlsx.action";
import { registrationsLoader } from "../api/loaders/registrations.loaders";
import { EventCombobox } from "../components/event-combobox";
import { MassActions } from "../components/mass-actions";
import { RegistrationFilters } from "../components/registration-filters";
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

export const action = exportXLSXAction;
export default function Registrations() {
  const { registrations, pagination, events, selectedEvent, statusCounts } =
    useLoaderData<typeof loader>();
  const {
    updateMultipleParams,
    getParamValue,
    resetAllParams,
    handleSearchParams,
    removeParam,
  } = useSearchParamsManager();
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>(
    []
  );

  const [selectAllAcrossPages, setSelectAllAcrossPages] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);

  const [isEventSheetOpen, setIsEventSheetOpen] = useState(false);

  const { sort, handleSort } = useTableSorting("invitedAt", "desc");

  const eventId = getParamValue("eventId");
  const [loading, setLoading] = useState(false);

  const handleEventSelect = useCallback(
    (eventId: string) => {
      updateMultipleParams({ eventId });
    },
    [updateMultipleParams]
  );

  const handleClearEvent = useCallback(() => {
    resetAllParams();
  }, [resetAllParams]);

  const fetcherExport = useFetcher();

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      // Crear parametro para seleccionar todos los registros a través de todas las páginas
      if (checked) {
        handleSearchParams("selectAll", "true");
      } else {
        removeParam("selectAll");
      }
      setSelectAllAcrossPages(checked);
      setSelectedRegistrations(checked ? registrations.map((r) => r.id) : []);
    },
    [registrations, handleSearchParams, removeParam]
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

  const handleExport = async () => {
    if (!selectedEvent?.id) return;

    setLoadingExport(true);
    fetcherExport.submit(
      {
        eventId: selectedEvent.id,
        selectAll: selectAllAcrossPages,
        selectedRegistrations,
      },
      { method: "post" }
    );
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: <works as expected>
  useEffect(() => {
    if (fetcherExport.state === "idle" && fetcherExport.data) {
      const data = fetcherExport.data;

      if (data.success && data.message) {
        // Convertir base64 a Blob
        const byteCharacters = atob(data.message);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.filename;
        a.click();
        window.URL.revokeObjectURL(url);

        setLoadingExport(false);
        setSelectedRegistrations([]);
        removeParam("selectAll");
        setSelectAllAcrossPages(false);

        toast.success("Archivo XLSX generado correctamente");
      } else if (!data.success) {
        toast.error(data.error || "Error exportando XLSX");
      }
    }
  }, [fetcherExport.state, fetcherExport.data]);

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
      {/* Overlay loader */}
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-primary/10 backdrop-blur-sm">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
      )}
      <PageHeader
        title={`Registros - ${selectedEvent.name}`}
        description={`${formatDate(selectedEvent.start_date)} de ${formatTime(selectedEvent.start_date)} a ${formatTime(selectedEvent.end_date)}`}
        actions={
          <>
            {/* Desktop buttons */}
            <div className="hidden md:flex flex-row gap-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenEventSheet}
                >
                  <Eye className="size-5 mr-2" />
                  Ver evento
                </Button>
                <Button variant="outline" size="sm" onClick={handleClearEvent}>
                  <RefreshCw className="size-5 mr-2" />
                  Cambiar evento
                </Button>
              </div>
              {selectedRegistrations.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={loadingExport}
                  >
                    <Download className="size-5 mr-2" />
                    {loadingExport ? "Exportando..." : "Exportar"} (
                    {selectAllAcrossPages
                      ? pagination.totalItems
                      : selectedRegistrations.length}
                    )
                  </Button>
                  <MassActions
                    selectedRegistrations={selectedRegistrations}
                    onLoadingChange={setLoading}
                  />
                </div>
              )}

              {canSendInvitations && (
                <Link to={`/registros/enviar-invitaciones/${selectedEvent.id}`}>
                  <Button size="sm">
                    <UserPlus className="size-5 mr-2" />
                    Invitar asistentes
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile dropdown */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Abrir menú de acciones</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleOpenEventSheet}>
                    <Eye className="size-4 mr-2" />
                    Ver evento
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleClearEvent}>
                    <RefreshCw className="size-4 mr-2" />
                    Cambiar evento
                  </DropdownMenuItem>
                  {selectedRegistrations.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Download className="size-4 mr-2" />
                        Exportar ({selectedRegistrations.length})
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Filter className="size-4 mr-2" />
                        Acciones masivas
                      </DropdownMenuItem>
                    </>
                  )}
                  {canSendInvitations && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link
                          to={`/registros/enviar-invitaciones/${selectedEvent.id}`}
                        >
                          <UserPlus className="size-4 mr-2" />
                          Invitar asistentes
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
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
            remainingCapacity={selectedEvent.remainingCapacity || 0}
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <Card className="flex-1">
              <CardContent>
                <div className="flex gap-2 items-center">
                  <SearchBar
                    searchParamKey="search"
                    placeholder="Buscar registros por nombre usuario, correo"
                    className="w-full"
                  />
                  <RegistrationFilters />
                </div>
              </CardContent>
            </Card>
          </div>
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
