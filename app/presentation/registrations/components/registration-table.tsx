import { Badge, type BadgeVariants } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Eye, Mail, MoreHorizontal, QrCode } from "lucide-react";
import type { RegistrationWithRelations } from "~/domain/entities/registration.entity";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/shared/components/ui/dropdown-menu";

interface RegistrationTableProps {
  registrations: RegistrationWithRelations[];
  selectedRegistrations: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectRegistration: (registrationId: string, checked: boolean) => void;
  getStatusBadgeVariant: (status: string) => string;
  getStatusLabel: (status: string) => string;
}

export function RegistrationTable({
  registrations,
  selectedRegistrations,
  onSelectAll,
  onSelectRegistration,
  getStatusBadgeVariant,
  getStatusLabel,
}: RegistrationTableProps) {
  const allSelected =
    registrations.length > 0 &&
    selectedRegistrations.length === registrations.length;
  const someSelected =
    selectedRegistrations.length > 0 &&
    selectedRegistrations.length < registrations.length;

  if (registrations.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No hay registros</h3>
        <p className="text-muted-foreground mt-2">
          Este evento aún no tiene registros.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border mt-6">
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b bg-muted/50">
              <TableHead className="w-12">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha de invitación</TableHead>
              <TableHead>Fecha de respuesta</TableHead>
              <TableHead>QR Code</TableHead>
              <TableHead className="w-12">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrations.map((registration) => {
              const isSelected = selectedRegistrations.includes(
                registration.id
              );

              return (
                <TableRow
                  key={registration.id}
                  className="hover:bg-muted/50 transition-colors"
                >
                  <TableCell>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) =>
                        onSelectRegistration(registration.id, e.target.checked)
                      }
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {registration.user.name || "Sin nombre"}
                    </div>
                    {registration.user.company && (
                      <div className="text-sm text-muted-foreground">
                        {registration.user.company}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{registration.user.email}</div>
                    {registration.user.phone && (
                      <div className="text-xs text-muted-foreground">
                        {registration.user.phone}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        getStatusBadgeVariant(
                          registration.status
                        ) as BadgeVariants
                      }
                    >
                      {getStatusLabel(registration.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(registration.invitedAt), "PPp", {
                        locale: es,
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {registration.respondedAt ? (
                      <div className="text-sm">
                        {format(new Date(registration.respondedAt), "PPp", {
                          locale: es,
                        })}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Sin respuesta
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {registration.qrCode.slice(0, 8)}...
                      </code>
                      <Button variant="ghost" size="sm">
                        <QrCode className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="size-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="size-4 mr-2" />
                          Enviar recordatorio
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <QrCode className="size-4 mr-2" />
                          Descargar QR
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
