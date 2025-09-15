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
  BadgeAlert,
  Building2,
  Calendar,
  CalendarCheck,
  Mail,
  Phone,
  QrCode,
  Send,
  Trash2,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { toast } from "sonner";
import type { RegistrationWithRelations } from "~/domain/entities/registration.entity";
import { ConfirmationDialog } from "~/shared/components/common/confirmation-dialog";
import { Card, CardContent } from "~/shared/components/ui/card";

/* import { Separator } from "~/shared/components/ui/separator"; */

interface RegistrationDetailsSheetProps {
  registration: RegistrationWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  getStatusBadgeVariant: (status: string) => string;
  getStatusLabel: (status: string) => string;
  canSendInvite: boolean;
}

export function RegistrationDetailsSheet({
  registration,
  isOpen,
  onClose,
  getStatusBadgeVariant,
  getStatusLabel,
  canSendInvite = false,
}: RegistrationDetailsSheetProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const fetcher = useFetcher();
  const resendFetcher = useFetcher();

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      toast[fetcher.data.success ? "success" : "error"](
        fetcher.data.success
          ? fetcher.data.message || "Registro eliminado exitosamente"
          : fetcher.data.error || "Error al eliminar el registro"
      );
    }
  }, [fetcher.state, fetcher.data]);

  useEffect(() => {
    if (resendFetcher.state === "idle" && resendFetcher.data) {
      toast[resendFetcher.data.success ? "success" : "error"](
        resendFetcher.data.success
          ? resendFetcher.data.message || "Invitación reenviada exitosamente"
          : resendFetcher.data.error || "Error al reenviar la invitación"
      );
    }
  }, [resendFetcher.state, resendFetcher.data]);

  if (!registration) return null;

  const { user } = registration;

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    fetcher.submit(
      {
        registrationId: registration.id,
        customMessage: customMessage,
      },
      {
        action: "/registros/delete-registration",
        method: "post",
      }
    );
    setIsDeleteDialogOpen(false);
    setCustomMessage(""); // Reset the message
    onClose();
  };

  const handleResendInvite = () => {
    resendFetcher.submit(
      { registrationId: registration.id },
      {
        action: "/registros/resend-invite",
        method: "post",
      }
    );
  };

  const isDeleting = fetcher.state === "submitting";
  const isResending = resendFetcher.state === "submitting";
  const isPending = registration.status === "PENDING";

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="min-w-2xl overflow-y-auto p-6">
          <SheetHeader className="flex flex-row justify-between items-center px-0">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Detalles del registro
              </SheetTitle>
              <SheetDescription>
                Información completa del registro y usuario
              </SheetDescription>
            </div>
            {canSendInvite && isPending && (
              <Button onClick={handleResendInvite} disabled={isResending}>
                <Send className="h-3 w-3 mr-1" />
                {isResending ? "Enviando..." : "Reenviar invitación"}
              </Button>
            )}
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <QrCode className="h-4 w-4" />
                Detalles del Registro
              </h3>
              <Card>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3">
                      <QrCode className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium font-mono">
                          {registration.qrCode}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Código QR
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <BadgeAlert className="size-4 text-muted-foreground" />
                      <div>
                        <Badge
                          variant={
                            getStatusBadgeVariant(
                              registration.status
                            ) as BadgeVariants
                          }
                          className="text-sm"
                        >
                          {getStatusLabel(registration.status)}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Estatus del registro
                        </p>
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
                            {format(
                              new Date(registration.registeredAt),
                              "PPp",
                              {
                                locale: es,
                              }
                            )}
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
            </div>

            {/* User Information */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Información del asistente
              </h3>
              <Card>
                <CardContent className=" space-y-4">
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
                          <p className="text-xs text-muted-foreground">
                            Empresa
                          </p>
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
            </div>

            {/* Action Buttons */}
            {canSendInvite && (
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
            )}
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setCustomMessage(""); // Reset message when closing
        }}
        onConfirm={handleConfirmDelete}
        title="Revocar invitación"
        description={`¿Estás seguro de que quieres revocar la invitación de ${user.name}? Esta acción eliminará el registro y permitirá enviar una nueva invitación.`}
        confirmText="Revocar invitación"
        cancelText="Cancelar"
        variant="destructive"
        showTextarea={true}
        textareaLabel="Mensaje personalizado (opcional)"
        textareaPlaceholder="Escribe un mensaje personalizado que se incluirá en el email de revocación..."
        textareaValue={customMessage}
        onTextareaChange={setCustomMessage}
      />
    </>
  );
}
