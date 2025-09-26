import { Badge, type BadgeVariants } from "@/ui/badge";
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
import { AtSign, Calendar, CalendarCheck, User } from "lucide-react";
import { useState } from "react";
import type { RegistrationWithFullRelations } from "~/domain/entities/registration.entity";
import { SortableHeader } from "~/shared/components/common/sortable-header";
import { Checkbox } from "~/shared/components/ui/checkbox";
import type { SortState } from "~/shared/types";
import { RegistrationDetailsSheet } from "./registration-details-sheet";

interface RegistrationTableProps {
  registrations: RegistrationWithFullRelations[];
  selectedRegistrations: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectRegistration: (registrationId: string, checked: boolean) => void;
  getStatusBadgeVariant: (status: string) => string;
  getStatusLabel: (status: string) => string;
  currentSort: SortState;
  onSort: (column: string) => void;
  canSendInvite: boolean;
}

export function RegistrationTable({
  registrations,
  selectedRegistrations,
  onSelectAll,
  onSelectRegistration,
  getStatusBadgeVariant,
  getStatusLabel,
  currentSort,
  onSort,
  canSendInvite,
}: RegistrationTableProps) {
  const [selectedRegistration, setSelectedRegistration] =
    useState<RegistrationWithFullRelations | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleRowClick = (
    registration: RegistrationWithFullRelations,
    event: React.MouseEvent
  ) => {
    if ((event.target as HTMLElement).closest('input[type="checkbox"]')) {
      return;
    }
    setSelectedRegistration(registration);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSelectedRegistration(null);
  };

  const allSelected =
    registrations.length > 0 &&
    selectedRegistrations.length === registrations.length;
  const someSelected =
    selectedRegistrations.length > 0 &&
    selectedRegistrations.length < registrations.length;

  if (registrations.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-card rounded-xl border mt-6 overflow-hidden">
        <div className="overflow-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={someSelected ? "indeterminate" : allSelected}
                    onCheckedChange={(checked) => onSelectAll(!!checked)}
                  />
                </TableHead>
                <SortableHeader
                  headerName="Usuario"
                  propName="user.name"
                  currentSort={currentSort}
                  onSort={onSort}
                  Icon={User}
                />
                <SortableHeader
                  headerName="Contacto"
                  propName="user.email"
                  currentSort={currentSort}
                  onSort={onSort}
                  Icon={AtSign}
                />
                <SortableHeader
                  headerName="Estado"
                  propName="status"
                  currentSort={currentSort}
                  onSort={onSort}
                  Icon={User}
                />
                <SortableHeader
                  headerName="Invitado"
                  propName="invitedAt"
                  currentSort={currentSort}
                  onSort={onSort}
                  Icon={Calendar}
                />
                <SortableHeader
                  headerName="Respondió"
                  propName="respondedAt"
                  currentSort={currentSort}
                  onSort={onSort}
                  Icon={CalendarCheck}
                />
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
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={(event) => handleRowClick(registration, event)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          onSelectRegistration(registration.id, !!checked)
                        }
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
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <RegistrationDetailsSheet
        registration={selectedRegistration}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        getStatusBadgeVariant={getStatusBadgeVariant}
        getStatusLabel={getStatusLabel}
        canSendInvite={canSendInvite}
      />
    </>
  );
}
