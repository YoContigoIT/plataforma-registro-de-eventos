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
  Copy,
  FileText,
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
import type { RegistrationWithFullRelations } from "~/domain/entities/registration.entity";
import { ConfirmationDialog } from "~/shared/components/common/confirmation-dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { copyToClipboard } from "~/shared/lib/utils";

interface RegistrationDetailsSheetProps {
  registration: RegistrationWithFullRelations | null;
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

  const { user, FormResponse } = registration;

  // Helper function to format field response value
  const formatFieldValue = (value: any, fieldType: string) => {
    if (value === null || value === undefined || value === "") {
      return "Sin respuesta";
    }

    // Handle different field types
    switch (fieldType) {
      case "DATE":
        try {
          return format(new Date(value), "PP", { locale: es });
        } catch {
          return value;
        }
      case "CHECKBOX":
        if (Array.isArray(value)) {
          return value.join(", ");
        }
        if (
          typeof value === "string" &&
          value.startsWith("[") &&
          value.endsWith("]")
        ) {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              return parsed.join(", ");
            }
          } catch {}
        }
        return value;
      case "SELECT":
      case "RADIO":
        return value;
      default:
        return value;
    }
  };

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
    setCustomMessage("");
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
        <SheetContent className="w-full md:min-w-2xl overflow-y-auto p-6">
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
                    <div className="flex items-start gap-3">
                      <QrCode className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium font-mono break-all">
                            {registration.qrCode}
                          </p>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-muted"
                            onClick={() =>
                              copyToClipboard(registration.qrCode, "Código QR")
                            }
                          >
                            <Copy className="h-3 w-3" />
                            <span className="sr-only">Copiar código QR</span>
                          </Button>
                        </div>
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

            {/* Form Response Information */}
            {FormResponse && FormResponse.fieldResponses.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Respuestas del formulario
                </h3>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Formulario completado</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        {format(new Date(FormResponse.submittedAt), "PPp", {
                          locale: es,
                        })}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {FormResponse.fieldResponses
                      .sort((a, b) => a.field.order - b.field.order)
                      .map((fieldResponse) => (
                        <div key={fieldResponse.id} className="space-y-1">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">
                                {fieldResponse.field.label}
                                {fieldResponse.field.required && (
                                  <span className="text-destructive ml-1">
                                    *
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {formatFieldValue(
                                  fieldResponse.value,
                                  fieldResponse.field.type
                                )}
                              </p>
                            </div>
                          </div>
                          {fieldResponse !==
                            FormResponse.fieldResponses[
                              FormResponse.fieldResponses.length - 1
                            ] && (
                            <div className="border-b border-border/50 pt-2" />
                          )}
                        </div>
                      ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* No Form Response Message */}
            {(!FormResponse || FormResponse.fieldResponses.length === 0) && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Respuestas del formulario
                </h3>
                <Card>
                  <CardContent className="py-8 text-center">
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Este usuario aún no ha completado el formulario de
                      registro
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Actions Card */}
            {canSendInvite && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Acciones de invitación
                </h3>
                <Card>
                  <CardContent className="space-y-3">
                    {isPending && (
                      <Button
                        onClick={handleResendInvite}
                        disabled={isResending}
                        variant="default"
                        className="w-full justify-start bg-blue-600 hover:bg-blue-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {isResending ? "Reenviando..." : "Reenviar invitación"}
                      </Button>
                    )}
                    <Button
                      variant="destructive"
                      onClick={handleDeleteClick}
                      disabled={isDeleting}
                      className="w-full justify-start"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {isDeleting ? "Revocando..." : "Revocar invitación"}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Al revocar la invitación, se eliminará este registro y se
                      enviará una notificación al usuario.
                    </p>
                  </CardContent>
                </Card>
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
