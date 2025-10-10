import { Badge, type BadgeVariants } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/ui/sheet";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  BarChart3,
  Calendar,
  CalendarCheck,
  Clock,
  Copy,
  Edit,
  FileText,
  FormInput,
  Link2,
  List,
  Loader2,
  MapPin,
  MoreHorizontal,
  Power,
  Trash2,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useFetcher } from "react-router";
import { toast } from "sonner";
import type { EventEntityWithEventForm } from "~/domain/entities/event.entity";

import { ConfirmationDialog } from "~/shared/components/common/confirmation-dialog";
import { Card, CardContent } from "~/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/shared/components/ui/dropdown-menu";
import { Progress } from "~/shared/components/ui/progress";

interface EventDetailsSheetProps {
  event: EventEntityWithEventForm | null;
  isOpen: boolean;
  onClose: () => void;
  getStatusBadgeVariant: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

export function EventDetailsSheet({
  event,
  isOpen,
  onClose,
  getStatusBadgeVariant,
  getStatusLabel,
}: EventDetailsSheetProps) {
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const fetcher = useFetcher();
  const emailFetcher = useFetcher();

  const getFieldTypeLabel = (type: string): string => {
    const typeLabels: Record<string, string> = {
      TEXT: "Texto",
      EMAIL: "Email",
      PHONE: "Teléfono",
      NUMBER: "Número",
      TEXTAREA: "Área de texto",
      SELECT: "Selección",
      RADIO: "Opción única",
      CHECKBOX: "Casillas",
      DATE: "Fecha",
      FILE: "Archivo",
    };
    return typeLabels[type] || type;
  };

  // Calculate capacity statistics
  const registeredCount = event
    ? event.capacity - (event.remainingCapacity || 0)
    : 0;
  const capacityPercentage = event
    ? Math.round((registeredCount / event.capacity) * 100)
    : 0;

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      toast[fetcher.data.success ? "success" : "error"](
        fetcher.data.success
          ? fetcher.data.message || "Evento archivado exitosamente"
          : fetcher.data.error || "Error al archivar el evento"
      );
    }
  }, [fetcher.state, fetcher.data]);

  useEffect(() => {
    if (emailFetcher.data) {
      if (emailFetcher.data.success) {
        toast.success(
          emailFetcher.data.message || "Email enviado correctamente",
          {
            description: "El correo de confirmación ha sido enviado.",
            duration: 4000,
          }
        );
      } else {
        toast.error(emailFetcher.data.message || "Error al enviar email", {
          description:
            "Hubo un problema al enviar el correo. Inténtalo de nuevo.",
          duration: 5000,
        });
      }
    }
  }, [emailFetcher.data]);

  if (!event) return null;

  const handleArchiveClick = () => {
    setIsArchiveDialogOpen(true);
  };

  // Generate full public invite URL if available
  const invitePath =
    event.isPublic && event.publicInviteToken
      ? `/inscripcion/${event.publicInviteToken}`
      : "";

  const publicInviteUrl =
    invitePath &&
    (typeof window !== "undefined"
      ? `${window.location.origin}${invitePath}`
      : invitePath);

  const handleCopyPublicInvite = async () => {
    if (!publicInviteUrl) return;
    try {
      await navigator.clipboard.writeText(publicInviteUrl);
      toast.success("Enlace de invitación copiado");
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  };

  const handleConfirmArchive = () => {
    fetcher.submit(
      {},
      {
        method: "post",
        action: `/eventos/archivar/${event.id}`,
      }
    );
    setIsArchiveDialogOpen(false);
    onClose();
  };

  const isArchiving = fetcher.state === "submitting";

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full md:min-w-2xl overflow-y-auto p-6">
          <SheetHeader className="flex flex-row justify-between items-center px-0">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {event.name}
              </SheetTitle>
              <SheetDescription>
                Detalles del evento • {getStatusLabel(event.status)}
              </SheetDescription>
            </div>

            {/* Desktop buttons */}
            <div className="hidden md:flex gap-2">
              <Link to={`/eventos/actualizar/${event.id}`}>
                <Button variant="default" size="sm">
                  <Edit className="size-5 mr-2" />
                  Editar
                </Button>
              </Link>
              <Link to={`/registros?eventId=${event.id}`} className="block">
                <Button variant="secondary" size="sm">
                  <Users className="size-5 mr-2" />
                  Ver registros
                </Button>
              </Link>
              {/* <Button
                variant="destructive"
                size="sm"
                onClick={handleArchiveClick}
                disabled={isArchiving}
              >
                {isArchiving ? (
                  <Loader2 className="size-5 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="size-5 mr-2" />
                )}
                {isArchiving ? "Archivando..." : "Archivar"}
              </Button> */}
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
                  <DropdownMenuItem asChild>
                    <Link to={`/eventos/actualizar/${event.id}`}>
                      <Edit className="size-4 mr-2" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to={`/registros?eventId=${event.id}`}>
                      <Users className="size-4 mr-2" />
                      Ver registros
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleArchiveClick}
                    disabled={isArchiving}
                    className="text-destructive focus:text-destructive"
                  >
                    {isArchiving ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="size-4 mr-2" />
                    )}
                    {isArchiving ? "Archivando..." : "Archivar"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Estadísticas del evento
            </h3>
            <Card>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* Capacity Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Ocupación</span>
                      <span className="text-sm text-muted-foreground">
                        {registeredCount} / {event.capacity} (
                        {capacityPercentage}%)
                      </span>
                    </div>
                    <Progress
                      value={capacityPercentage}
                      className="w-full h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{registeredCount} registrados</span>
                      <span>{event.remainingCapacity || 0} disponibles</span>
                    </div>
                  </div>

                  {/* Other Statistics */}
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-semibold">{event.capacity}</p>
                      <p className="text-xs text-muted-foreground">
                        Capacidad total
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-semibold">{registeredCount}</p>
                      <p className="text-xs text-muted-foreground">
                        Registrados
                      </p>
                    </div>
                  </div>

                  {event.maxTickets && (
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm text-muted-foreground">
                        Máximo tickets por persona
                      </span>
                      <span className="font-medium">{event.maxTickets}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-sm text-muted-foreground">
                      Estado del evento
                    </span>
                    <Badge
                      variant={
                        getStatusBadgeVariant(event.status) as BadgeVariants
                      }
                    >
                      {getStatusLabel(event.status)}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Fecha de creación
                    </span>
                    <span className="font-medium text-sm">
                      {format(new Date(event.createdAt), "PP", {
                        locale: es,
                      })}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 space-y-6">
            {/* Event Overview */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Información del evento
              </h3>
              <Card>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {format(new Date(event.start_date), "PPP", {
                            locale: es,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Fecha de inicio •{" "}
                          {format(new Date(event.start_date), "p", {
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {format(new Date(event.end_date), "PPP", {
                            locale: es,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Fecha de finalización •{" "}
                          {format(new Date(event.end_date), "p", {
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{event.location}</p>
                        <p className="text-xs text-muted-foreground">
                          Ubicación
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Power className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <Badge
                          variant={
                            getStatusBadgeVariant(event.status) as BadgeVariants
                          }
                          className="text-sm"
                        >
                          {getStatusLabel(event.status)}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Estado del evento
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {event.capacity} personas
                          {event.maxTickets && (
                            <span className="text-xs text-muted-foreground ml-2">
                              • Máx. {event.maxTickets} tickets por persona
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Capacidad
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {event.remainingCapacity || 0} lugares disponibles
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Disponibilidad
                        </p>
                      </div>
                    </div>

                    {event.isPublic && event.publicInviteToken && (
                      <div className="flex items-center gap-3">
                        <Link2 className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              Acceso público
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {event.publicInviteToken}
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleCopyPublicInvite}
                              className="h-7 px-2"
                              type="button"
                            >
                              <Copy className="h-3 w-3 mr-1" />
                              Copiar URL
                            </Button>
                          </div>
                          <span className="text-xs text-muted-foreground mt-1">
                            {publicInviteUrl}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            {event.description && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Descripción
                </h3>
                <Card>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {event.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Agenda */}
            {event.agenda && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <List className="h-4 w-4" />
                  Agenda
                </h3>
                <Card>
                  <CardContent className="space-y-4">
                    <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">
                      {event.agenda}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Event Form */}
            {event.EventForm && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <FormInput className="h-4 w-4" />
                  Formulario de registro
                </h3>
                <Card>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium">
                          {event.EventForm.title}
                        </h4>
                        {event.EventForm.description && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {event.EventForm.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Estado
                        </span>
                        <Badge
                          variant={
                            event.EventForm.isActive ? "default" : "secondary"
                          }
                        >
                          {event.EventForm.isActive ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>

                      {event.EventForm.fields &&
                        event.EventForm.fields.length > 0 && (
                          <div className="space-y-2">
                            <h5 className="text-xs font-medium text-muted-foreground">
                              Campos del formulario (
                              {event.EventForm.fields.length})
                            </h5>
                            <div className="space-y-2">
                              {event.EventForm.fields.map((field) => (
                                <div
                                  key={field.id}
                                  className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium">
                                      {field.label}
                                      {field.required && (
                                        <span className="text-red-500 ml-1">
                                          *
                                        </span>
                                      )}
                                    </span>
                                    {field.placeholder && (
                                      <span className="text-xs text-muted-foreground">
                                        • {field.placeholder}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {getFieldTypeLabel(field.type)}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Estadísticas
              </h3>
              <Card>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Estado
                    </span>
                    <Badge
                      variant={
                        getStatusBadgeVariant(event.status) as BadgeVariants
                      }
                    >
                      {getStatusLabel(event.status)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Capacidad
                    </span>
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
                    <span className="text-sm text-muted-foreground">
                      Creado
                    </span>
                    <span className="font-medium text-sm">
                      {format(new Date(event.createdAt), "PP", { locale: es })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div> */}

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Acciones rápidas
              </h3>
              <Card>
                <CardContent className="space-y-3">
                  <Link
                    to={`/eventos/actualizar/${event.id}`}
                    className="block"
                  >
                    <Button
                      variant="secondary"
                      className="w-full justify-start"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar evento
                    </Button>
                  </Link>
                  <Link to={`/registros?eventId=${event.id}`} className="block">
                    <Button
                      variant="secondary"
                      className="w-full justify-start"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Ver registros
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    className="w-full justify-start"
                    onClick={handleArchiveClick}
                    disabled={isArchiving}
                  >
                    {isArchiving ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    {isArchiving ? "Archivando..." : "Archivar evento"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmationDialog
        isOpen={isArchiveDialogOpen}
        onClose={() => setIsArchiveDialogOpen(false)}
        onConfirm={handleConfirmArchive}
        title="Archivar evento"
        description={`¿Estás seguro de que quieres archivar el evento "${event.name}"? Esta acción marcará el evento como cancelado y archivado.`}
        confirmText="Archivar evento"
        cancelText="Cancelar"
        variant="destructive"
      />
    </>
  );
}
