import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Edit,
  Loader2,
  MoreHorizontal,
  Trash2,
  User,
} from "lucide-react";
import { useState } from "react";
import { Link, useFetcher } from "react-router";
import type { UserEntity } from "~/domain/entities/user.entity";
import { ConfirmationDialog } from "~/shared/components/common/confirmation-dialog";
import { Button } from "~/shared/components/ui/button";
import { Card, CardContent } from "~/shared/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/shared/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/shared/components/ui/sheet";
import { formatName, getUserRoleBadge } from "~/shared/lib/utils";

interface UserDetailsSheetProps {
  user: UserEntity | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailsSheet({
  user,
  isOpen,
  onClose,
}: UserDetailsSheetProps) {
  if (!user) return null;

  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const fetcher = useFetcher();

  const handleCloseDialog = () => setIsArchiveDialogOpen(false);

  const handleArchiveClick = () => {
    setIsArchiveDialogOpen(true);
  };

  const handleConfirmArchive = () => {
    fetcher.submit(
      {},
      {
        method: "post",
        action: `/usuarios/eliminar/${user.id}`,
      }
    );
    setIsArchiveDialogOpen(false);
    onClose();
  };
  const { label, variant } = getUserRoleBadge(user.role);
  const isArchiving = fetcher.state === "submitting";

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full md:min-w-2xl overflow-y-auto p-6">
          <SheetHeader className="flex flex-row justify-between items-center px-0">
            <div>
              <SheetTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {formatName(user)}
              </SheetTitle>
              <SheetDescription>
                Detalles del usuario • {label}
              </SheetDescription>
            </div>

            {/* Desktop buttons */}
            <div className="hidden md:flex gap-2">
              <Link to={`/usuarios/editar/${user.id}`}>
                <Button variant="default" size="sm">
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
                {isArchiving ? "Eliminando..." : "Eliminar"}
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
                    <Link to={`/usuarios/editar/${user.id}`}>
                      <Edit className="size-4 mr-2" />
                      Editar
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleConfirmArchive}
                    disabled={isArchiveDialogOpen}
                    className="text-destructive focus:text-destructive"
                  >
                    {isArchiving ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <Trash2 className="size-4 mr-2" />
                    )}
                    {isArchiving ? "Eliminando..." : "Eliminar"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SheetHeader>

          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Estadísticas del usuario
            </h3>
            <Card>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {/* Registrations */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        <span className="text-sm text-muted-foreground">
                          Registros
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-semibold">
                        {(user?.registrations || []).length ||
                          "No especificado"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Registros a eventos
                      </p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded-lg">
                      <p className="text-lg font-semibold">
                        {(user?.createdEvents || []).length ||
                          "No especificado"}
                      </p>
                      <p className="text-xs text-muted-foreground">Eventos</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 space-y-6">
            {/* User Overview */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Información de la cuenta
              </h3>
              <Card>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">
                          Fecha de creación: •{" "}
                          {format(new Date(user.createdAt), "PPP", {
                            locale: es,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Departamento • {user.company || "No especificado"}
                        </p>
                      </div>
                    </div>
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
                  <Link to={`/usuarios/editar/${user.id}`} className="block">
                    <Button
                      variant="secondary"
                      className="w-full justify-start"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Editar usuario
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
                    {isArchiving ? "Eliminando..." : "Eliminar usuario"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isArchiveDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmArchive}
        title="Eliminar usuario"
        description="¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        icon={<AlertTriangle className="h-6 w-6 text-destructive" />}
        variant="destructive"
      />
    </>
  );
}
