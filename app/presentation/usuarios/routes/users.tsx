import { Grid, List, UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import type { UserEntity } from "~/domain/entities/user.entity";
import { PageHeader } from "~/shared/components/common/page-header";
import { SearchBar } from "~/shared/components/common/search-bar";
import { Button } from "~/shared/components/ui/button";
import { Card, CardContent } from "~/shared/components/ui/card";
import { Pagination } from "~/shared/components/ui/pagination";
import { getUserRoleBadge } from "~/shared/lib/badge-utils";
import { getAllUsersPagination } from "../api/get-all-users.loader";
import { UserDetailsSheet } from "../components/views/user-details-sheet";
import { UserGridView } from "../components/views/users-grid-view";
import { UsersListView } from "../components/views/users-list-view";

export function meta() {
  return [
    { title: "Lista de usuarios - Gestor de eventos" },
    {
      name: "description",
      content: "Página de lista de usuarios de Gestor de Eventos",
    },
  ];
}

export const loader = getAllUsersPagination;
export default function UsersPage() {
  const { users, pagination } = useLoaderData<typeof loader>();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const [selectedUser, setselectedUser] = useState<UserEntity | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleSelectEvent = (user: UserEntity) => {
    setselectedUser(user);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setselectedUser(null);
  };
  return (
    <div>
      <PageHeader
        title="Usuarios"
        description="Crea y administra usuarios"
        actions={
          <div className="flex justify-end gap-4">
            <div className="bg-card border rounded-md flex items-center p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="size-8"
              >
                <Grid className="size-4" />
                <span className="sr-only">Vista de cuadrícula</span>
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="size-8"
              >
                <List className="size-4" />
                <span className="sr-only">Vista de lista</span>
              </Button>
            </div>
            <Link to="/usuarios/crear">
              <Button size="lg">
                <UserPlus className="w-5 h-5 mr-2" />
                Crear usuario
              </Button>
            </Link>
          </div>
        }
      />

      <Card>
        <CardContent>
          <SearchBar
            searchParamKey="userSearch"
            placeholder="Buscar usuarios por nombre"
            className="w-full"
          />
        </CardContent>
      </Card>
      <div>
        {viewMode === "grid" ? (
          <UserGridView
            users={users}
            getStatusBadgeVariant={getUserRoleBadge}
            getStatusLabel={getUserRoleBadge}
            onSelectUser={handleSelectEvent}
          />
        ) : (
          <UsersListView
            users={users}
            getStatusBadgeVariant={getUserRoleBadge}
            getStatusLabel={getUserRoleBadge}
            onSelectUser={handleSelectEvent}
          />
        )}
      </div>

      <Pagination
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        itemsPerPage={pagination.itemsPerPage}
        itemName={"usuario"}
      />

      <UserDetailsSheet
        user={selectedUser}
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
      />
    </div>
  );
}
