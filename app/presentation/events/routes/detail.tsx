import { PageHeader } from "@/components/common/page-header";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertTriangle,
  Calendar,
  Clock,
  Edit,
  FileText,
  List,
  Loader2,
  MapPin,
  Power,
  Trash2,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, redirect, useFetcher, useLoaderData } from "react-router";
import type { EventEntity } from "~/domain/entities/event.entity";
import { ConfirmationDialog } from "~/shared/components/common/confirmation-dialog";
import type { LoaderData } from "~/shared/types";
import { archiveEventAction } from "../api/actions";
import { getEventByIdLoader } from "../api/loaders";

export const loader = getEventByIdLoader;
export const action = archiveEventAction;

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

export default function EventDetails() {
  const fetcher = useFetcher();
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

  const { data: event } = useLoaderData<LoaderData<EventEntity>>();

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-muted-foreground">
            Evento no encontrado
          </h2>
          <p className="text-muted-foreground mt-2">
            El evento que buscas no existe o ha sido eliminado.
          </p>
          <Link to="/eventos">
            <Button className="mt-4">Volver a eventos</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleArchiveClick = () => {
    setIsArchiveDialogOpen(true);
  };

  const handleConfirmArchive = () => {
    if (event?.id) {
      fetcher.submit(
        { id: event.id },
        {
          method: "post",
        }
      );
    }
    redirect("/eventos");
    setIsArchiveDialogOpen(false);
  };

  const handleCloseDialog = () => {
    setIsArchiveDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={event.name}
        description={`Detalles del evento • ${getStatusLabel(event.status)}`}
        goBack="/eventos"
        actions={
          <div className="flex flex-col md:flex-row gap-2">
            <Link to={`/eventos/actualizar/${event.id}`}>
              <Button variant="outline" size="sm">
                <Edit className="size-5 md:mr-2" />
                <span className="hidden md:block">Editar</span>
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleArchiveClick}
              disabled={fetcher.state === "submitting"}
            >
              {fetcher.state === "submitting" ? (
                <Loader2 className="size-5 md:mr-2 animate-spin" />
              ) : (
                <Trash2 className="size-5 md:mr-2" />
              )}
              <span className="hidden md:inline">
                {fetcher.state === "submitting" ? "Archivando..." : "Eliminar"}
              </span>
            </Button>
          </div>
        }
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Información del evento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">
                      Fecha de inicio
                    </p>
                    <p className="text-lg font-semibold">
                      {format(new Date(event.start_date), "PPP", {
                        locale: es,
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.start_date), "p", { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">
                      Fecha de finalización
                    </p>
                    <p className="text-lg font-semibold">
                      {format(new Date(event.end_date), "PPP", { locale: es })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.end_date), "p", { locale: es })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">
                      Ubicación
                    </p>
                    <p className="text-lg">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Power className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium text-sm text-muted-foreground">
                      Estatus del evento
                    </p>
                    <Badge
                      variant={getStatusBadgeVariant(event.status)}
                      className="text-sm px-3 py-1 mt-1"
                    >
                      {getStatusLabel(event.status)}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Capacity */}
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-sm text-muted-foreground">
                    Capacidad
                  </p>
                  <p className="text-lg">
                    {event.capacity} personas
                    {event.maxTickets && (
                      <span className="text-sm text-muted-foreground ml-2">
                        • Máx. {event.maxTickets} tickets por persona
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description Card */}
          {event.description && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Descripción
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {event.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Agenda Card */}
          {event.agenda && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="w-5 h-5 text-primary" />
                  Agenda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-line text-muted-foreground leading-relaxed">
                  {event.agenda}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones rápidas</CardTitle>
              <CardDescription>Gestiona este evento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to={`/eventos/actualizar/${event.id}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar evento
                </Button>
              </Link>
              <Button variant="outline" className="w-full justify-start">
                <Users className="w-4 h-4 mr-2" />
                Ver registros
              </Button>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={handleArchiveClick}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar evento
              </Button>
            </CardContent>
          </Card>

          {/* Event Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
              <CardDescription>Información del evento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Estado</span>
                <Badge variant={getStatusBadgeVariant(event.status)}>
                  {getStatusLabel(event.status)}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Capacidad</span>
                <span className="font-medium">{event.capacity}</span>
              </div>
              {event.maxTickets && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Máx. tickets
                  </span>
                  <span className="font-medium">{event.maxTickets}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Creado</span>
                <span className="font-medium text-sm">
                  {format(new Date(event.createdAt), "PP", { locale: es })}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <ConfirmationDialog
        isOpen={isArchiveDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmArchive}
        title="Archivar evento"
        description="¿Estás seguro de que quieres archivar este evento? Esta acción marcará el evento como cancelado y archivado."
        confirmText="Archivar"
        cancelText="Cancelar"
        icon={<AlertTriangle className="h-6 w-6 text-destructive" />}
        variant="destructive"
      />
    </div>
  );
}
