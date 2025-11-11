import { RegistrationStatus } from "@prisma/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertTriangle,
  Calendar,
  FileText,
  Mail,
  Ticket,
  User,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { useEffect } from "react";
import { Link, useFetcher } from "react-router";
import { toast } from "sonner";
import type { EventEntityWithEventForm } from "~/domain/entities/event.entity";
import type { RegistrationWithFullRelations } from "~/domain/entities/registration.entity";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { getStatusBadgeVariant, getStatusLabel } from "~/shared/lib/utils";

interface RegistrationInfoCardProps {
  registration: RegistrationWithFullRelations;
  selectedEvent: EventEntityWithEventForm;
  selectedEmail: string;
  showAlert?: boolean;
  alertMessage?: string;
  updateRoute?: string;
  actionType?: "create" | "update";
}

export function RegistrationInfoCard({
  selectedEvent,
  selectedEmail,
  registration,
  showAlert = true,
  alertMessage = "Este usuario ya tiene un registro para este evento. Si necesitas actualizar la información, utiliza la función de actualización de registros.",
  updateRoute = "/actualizar-registro",
  actionType = "create",
}: RegistrationInfoCardProps) {
  const checkInFetcher = useFetcher();

  const showUpdateButton =
    (registration &&
      (registration.status === RegistrationStatus.PENDING ||
        registration.status === RegistrationStatus.REGISTERED)) ||
    registration.status === RegistrationStatus.CHECKED_IN;

  const showCheckInButton =
    actionType === "update" &&
    registration.status === RegistrationStatus.REGISTERED;

  useEffect(() => {
    if (checkInFetcher.state === "idle" && checkInFetcher.data) {
      toast[checkInFetcher.data.success ? "success" : "error"](
        checkInFetcher.data.success
          ? checkInFetcher.data.message || "Check-in registrado exitosamente"
          : checkInFetcher.data.error || "Error al hacer check-in"
      );
    }
  }, [checkInFetcher.state, checkInFetcher.data]);

  const handleCheckIn = () => {
    if (registration.qrCode) {
      checkInFetcher.submit(
        {},
        {
          action: `/api/check-in/${registration.qrCode}`,
          method: "post",
        }
      );
    }
  };

  const formatFieldValue = (value: any, fieldType: string) => {
    if (value === null || value === undefined || value === "") {
      return "Sin respuesta";
    }

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Información del registro
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAlert && actionType === "create" && (
          <div className="flex items-start gap-3 p-4 bg-primary/35 border border-primary-200 rounded-lg">
            <AlertTriangle className="size-4 text-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground mb-1">
                Registro existente encontrado
              </p>
              <p className="text-sm text-foreground">{alertMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Usuario
              </p>
              <p className="text-sm font-semibold">{registration.user.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-sm font-semibold">{registration.user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="h-4 w-4 flex items-center justify-center">
              <Badge
                variant={getStatusBadgeVariant(registration.status)}
                className="h-4 w-4 p-0 rounded-full"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Estado
              </p>
              <Badge variant={getStatusBadgeVariant(registration.status)}>
                {getStatusLabel(registration.status)}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Fecha de registro
              </p>
              <p className="text-sm font-semibold">
                {registration.registeredAt
                  ? new Date(registration.registeredAt).toLocaleDateString(
                      "es-ES",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "Pendiente"}
              </p>
            </div>
          </div>

          {actionType === "update" &&
            registration.purchasedTickets &&
            registration.purchasedTickets > 0 && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Ticket className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Pases registrados
                  </p>
                  <p className="text-sm font-semibold">
                    {registration.purchasedTickets} Pase
                    {registration.purchasedTickets > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            )}
        </div>

        {actionType === "update" &&
          registration.FormResponse &&
          registration.FormResponse.fieldResponses.length > 0 && (
            <div className="space-y-3 mt-6">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Respuestas del formulario
              </h3>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Formulario completado</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {format(
                        new Date(registration.FormResponse.submittedAt),
                        "PPp",
                        {
                          locale: es,
                        }
                      )}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {registration.FormResponse.fieldResponses
                    .sort((a, b) => a.field.order - b.field.order)
                    .map((fieldResponse) => (
                      <div key={fieldResponse.id} className="space-y-1">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">
                              {fieldResponse.field.label}
                              {fieldResponse.field.required && (
                                <span className="text-destructive ml-1">*</span>
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {formatFieldValue(
                                fieldResponse.value,
                                fieldResponse.field.type
                              )}
                            </p>
                          </div>
                        </div>
                        {fieldResponse !==
                          registration?.FormResponse?.fieldResponses[
                            registration?.FormResponse?.fieldResponses.length -
                              1
                          ] && (
                          <div className="border-b border-border/50 pt-2" />
                        )}
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          )}
      </CardContent>
      <CardFooter>
        {showUpdateButton && (
          <div className="pt-4 border-t w-full">
            <div
              className={`flex gap-2 ${showCheckInButton ? "flex-col sm:flex-row" : ""}`}
            >
              <Button
                asChild
                className={showCheckInButton ? "flex-1" : "w-full"}
              >
                <Link
                  to={`${updateRoute}?eventId=${selectedEvent.id}&email=${selectedEmail}&action=update`}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {actionType === "create"
                    ? "Actualizar registro"
                    : "Continuar actualización"}
                </Link>
              </Button>

              {/* Check-in button for registered users when updating */}
              {showCheckInButton && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCheckIn}
                  disabled={checkInFetcher.state === "submitting"}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  {checkInFetcher.state === "submitting"
                    ? "Procesando..."
                    : "Check-in"}
                </Button>
              )}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
