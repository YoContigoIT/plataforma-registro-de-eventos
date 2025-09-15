import { AlertTriangle, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, redirect, useFetcher } from "react-router";
import type { UserEntity } from "~/domain/entities/user.entity";
import { ConfirmationDialog } from "~/shared/components/common/confirmation-dialog";
import { PageHeader } from "~/shared/components/common/page-header";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { getUserRoleBadge } from "~/shared/lib/badge-utils";
import { formatName } from "~/shared/lib/utils";
import { AccountInfo } from "./account-info";
import { UserHeader } from "./user-header";
import { UserStats } from "./user-stats";

export function UserDetails({ user }: { user: Omit<UserEntity, "password"> }) {
  const fetcher = useFetcher();
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);

  const handleCloseDialog = () => setIsArchiveDialogOpen(false);

  const handleConfirmArchive = () => {
    if (user?.id) {
      fetcher.submit({ id: user.id }, { method: "post" });
    }
    redirect("/usuarios");
    setIsArchiveDialogOpen(false);
  };

  const { label, variant } = getUserRoleBadge(user.role);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={formatName(user)}
        description="Detalles y gestión del usuario"
        goBack="/usuarios"
        actions={
          <div className="flex gap-2">
            <Link to={`/usuarios/editar/${user.id}`}>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setIsArchiveDialogOpen(true)}
              disabled={fetcher.state === "submitting"}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {fetcher.state === "submitting" ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        }
      />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Header Card */}
          <UserHeader user={user} />

          {/* Account Info Card */}
          <AccountInfo user={user} />
        </div>

        {/* Right Column - Quick Actions & Stats */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones rápidas</CardTitle>
              <CardDescription>Gestiona este usuario</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to={`/usuarios/editar/${user.id}`} className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Edit className="w-4 h-4 mr-2" />
                  Editar usuario
                </Button>
              </Link>
              <Button
                variant="destructive"
                className="w-full justify-start"
                onClick={() => setIsArchiveDialogOpen(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar usuario
              </Button>
            </CardContent>
          </Card>

          {/* User Stats */}
          <UserStats user={user} />
        </div>
      </div>

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
    </div>
  );
}
