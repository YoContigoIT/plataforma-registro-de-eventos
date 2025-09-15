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
  Building2,
  Calendar,
  CalendarCheck,
  Clock,
  Edit,
  FileText,
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
import type { EventEntity } from "~/domain/entities/event.entity";
import { ConfirmationDialog } from "~/shared/components/common/confirmation-dialog";
import { Card, CardContent } from "~/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/shared/components/ui/dropdown-menu";

interface EventDetailsSheetProps {
  event: EventEntity | null;
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
                <Button variant="outline" size="sm">
                  <Edit className="size-5 mr-2" />
                  Editar
                </Button>
              </Link>
              <Button
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
              </Button>
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

            <div className="space-y-3">
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
            </div>

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
                      variant="default"
                      className="w-full justify-start bg-blue-600 hover:bg-blue-700"
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
