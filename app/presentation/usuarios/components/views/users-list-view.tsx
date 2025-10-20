import { Badge } from "@/ui/badge";
import { Card } from "@/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { UserEntity } from "~/domain/entities/user.entity";
import type { BadgeConfig } from "~/shared/lib/badge-utils";

type UsersListViewProps = {
  users: UserEntity[];
  getStatusBadgeVariant: (rol: string) => BadgeConfig;
  getStatusLabel: (rol: string) => BadgeConfig;
  onSelectUser: (user: UserEntity) => void;
};

export function UsersListView({
  users,
  getStatusBadgeVariant,
  getStatusLabel,
  onSelectUser,
}: UsersListViewProps) {
  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No hay usuarios disponibles</h3>
        <p className="text-muted-foreground mt-2">
          Crea un nuevo usuario para comenzar.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-6">
      {users.map((user) => (
        <Card
          key={user.id}
          className="hover:shadow-md transition-all hover:scale-[1.01]"
          onClick={() => onSelectUser(user)}
        >
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(user.createdAt), "PPP", {
                      locale: es,
                    })}
                  </p>
                </div>
                <Badge variant={getStatusBadgeVariant(user.role).variant}>
                  {getStatusLabel(user.role).label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
                {user.company || "Sin compañía"}
              </p>
            </div>
            <div className="border-t md:border-t-0 md:border-l p-6 flex flex-row md:flex-col justify-between gap-4">
              <div className="text-sm">
                <span className="font-medium block">Cargo</span>
                {user.title}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
