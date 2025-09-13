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
  Mail,
  MapPin,
  Phone,
  QrCode,
  Trash2,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useFetcher } from "react-router";
import type { RegistrationWithRelations } from "~/domain/entities/registration.entity";
import { ConfirmationDialog } from "~/shared/components/common/confirmation-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";

/* import { Separator } from "~/shared/components/ui/separator"; */

interface RegistrationDetailsSheetProps {
  registration: RegistrationWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  getStatusBadgeVariant: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

export function RegistrationDetailsSheet({
  registration,
  isOpen,
  onClose,
  getStatusBadgeVariant,
  getStatusLabel,
}: RegistrationDetailsSheetProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const fetcher = useFetcher();

  if (!registration) return null;

  const { user, event } = registration;

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    fetcher.submit(
      { registrationId: registration.id },
      {
        action: "/registros/delete-registration",
        method: "post",
      }
    );
    setIsDeleteDialogOpen(false);
    onClose();
  };

  const isDeleting = fetcher.state === "submitting";

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="min-w-2xl overflow-y-auto p-4">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Detalles del registro
            </SheetTitle>
            <SheetDescription>
              Información completa del registro y usuario
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Registration Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Estado del registro
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Badge
                  variant={
                    getStatusBadgeVariant(registration.status) as BadgeVariants
                  }
                  className="text-sm"
                >
                  {getStatusLabel(registration.status)}
                </Badge>
              </CardContent>
            </Card>

            {/* User Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Información del aistente
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {user.name || "Sin nombre"}
                      </p>
                      <p className="text-xs text-muted-foreground">Nombre</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Correo electrónico
                      </p>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{user.phone}</p>
                        <p className="text-xs text-muted-foreground">
                          Teléfono
                        </p>
                      </div>
                    </div>
                  )}

                  {user.company && (
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{user.company}</p>
                        <p className="text-xs text-muted-foreground">Empresa</p>
                      </div>
                    </div>
                  )}

                  {user.title && (
                    <div className="flex items-center gap-3">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{user.title}</p>
                        <p className="text-xs text-muted-foreground">Cargo</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Event Information */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Información del evento
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{event.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Nombre del evento
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{event.location}</p>
                      <p className="text-xs text-muted-foreground">Ubicación</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(event.start_date), "PPp", {
                          locale: es,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Fecha de inicio
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(event.end_date), "PPp", {
                          locale: es,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Fecha de fin
                      </p>
                    </div>
                  </div>

                  {event.description && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">
                          {event.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Descripción
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Registration Details */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  Detalles del Registro
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3">
                    <QrCode className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium font-mono">
                        {registration.qrCode}
                      </p>
                      <p className="text-xs text-muted-foreground">Código QR</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        {format(new Date(registration.invitedAt), "PPp", {
                          locale: es,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Fecha de invitación
                      </p>
                    </div>
                  </div>

                  {registration.respondedAt && (
                    <div className="flex items-center gap-3">
                      <CalendarCheck className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {format(new Date(registration.respondedAt), "PPp", {
                            locale: es,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Fecha de respuesta
                        </p>
                      </div>
                    </div>
                  )}

                  {registration.registeredAt && (
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {format(new Date(registration.registeredAt), "PPp", {
                            locale: es,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Fecha de registro
                        </p>
                      </div>
                    </div>
                  )}

                  {registration.checkedInAt && (
                    <div className="flex items-center gap-3">
                      <UserCheck className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          {format(new Date(registration.checkedInAt), "PPp", {
                            locale: es,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Fecha de check-in
                        </p>
                      </div>
                    </div>
                  )}

                  {registration.inviteToken && (
                    <div className="flex items-start gap-3">
                      <QrCode className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium font-mono break-all">
                          {registration.inviteToken}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Token de invitación
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col gap-1 justify-end w-full mt-12">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="self-start"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Eliminando..." : "Revocar invitación"}
              </Button>
              <p className="text-xs text-muted-foreground mt-2 self-start">
                Al revocar la invitación, se eliminará este registro y se
                enviará una notificación al usuario.
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Revocar invitación"
        description={`¿Estás seguro de que quieres revocar la invitación de ${user.name}? Esta acción eliminará el registro y permitirá enviar una nueva invitación.`}
        confirmText="Revocar invitación"
        cancelText="Cancelar"
        variant="destructive"
      />
    </>
  );
}
