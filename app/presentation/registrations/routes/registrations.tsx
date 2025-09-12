import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/ui/button";
import { Pagination } from "@/ui/pagination";
import { Download, Filter, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useLoaderData, useSearchParams } from "react-router";
import { eventsLoader } from "../../events/api/loaders";
import { registrationsLoader } from "../api/loaders";
import { EventSelector } from "../components/event-selector";
import { RegistrationTable } from "../components/registration-table";
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
    };
  }

  const registrationsData = await registrationsLoader(args);

  const selectedEvent =
    await context.repositories.eventRepository.findUnique(eventId);

  return {
    ...registrationsData,
    events: [],
    selectedEvent,
  };
};

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "REGISTERED":
      return "emerald";
    case "PENDING":
      return "amber";
    case "WAITLISTED":
      return "sky";
    case "CANCELLED":
      return "destructive";
    case "DECLINED":
      return "slate";
    default:
      return "secondary";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "REGISTERED":
      return "Registrado";
    case "PENDING":
      return "Pendiente";
    case "WAITLISTED":
      return "En lista de espera";
    case "CANCELLED":
      return "Cancelado";
    case "DECLINED":
      return "Rechazado";
    default:
      return status;
  }
};

export default function Registrations() {
  const { registrations, pagination, events, selectedEvent } =
    useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedRegistrations, setSelectedRegistrations] = useState<string[]>(
    []
  );

  const eventId = searchParams.get("eventId");

  const handleEventSelect = (eventId: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("eventId", eventId);
    newSearchParams.delete("page");
    setSearchParams(newSearchParams);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRegistrations(registrations.map((r) => r.id));
    } else {
      setSelectedRegistrations([]);
    }
  };

  const handleSelectRegistration = (
    registrationId: string,
    checked: boolean
  ) => {
    if (checked) {
      setSelectedRegistrations((prev) => [...prev, registrationId]);
    } else {
      setSelectedRegistrations((prev) =>
        prev.filter((id) => id !== registrationId)
      );
    }
  };

  if (!eventId || !selectedEvent) {
    return (
      <div>
        <PageHeader
          title="Registros"
          description="Selecciona un evento para ver sus registros"
        />

        <div className="mt-8">
          <EventSelector
            events={events}
            handleEventSelect={handleEventSelect}
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
    <div>
      <PageHeader
        title={`Registros - ${selectedEvent.name}`}
        description={`Gestiona los registros para el evento "${selectedEvent.name}"`}
        actions={
          <div className="flex gap-2">
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
            <Link to={`/registros/enviar-invitaciones/${selectedEvent.id}`}>
              <Button size="sm">
                <UserPlus className="size-4 mr-2" />
                Invitar asistentes
              </Button>
            </Link>
          </div>
        }
      />

      <RegistrationTable
        registrations={registrations}
        selectedRegistrations={selectedRegistrations}
        onSelectAll={handleSelectAll}
        onSelectRegistration={handleSelectRegistration}
        getStatusBadgeVariant={getStatusBadgeVariant}
        getStatusLabel={getStatusLabel}
      />

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        itemName={"registro"}
      />
    </div>
  );
}
