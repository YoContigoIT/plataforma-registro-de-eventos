import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router";
import type { UserEntity } from "~/domain/entities/user.entity";
import { Badge } from "~/shared/components/ui/badge";
import type { BadgeConfig } from "~/shared/lib/badge-utils";

type UserFridViewProps = {
  users: UserEntity[];
  getStatusBadgeVariant: (rol: string) => BadgeConfig;
  getStatusLabel: (rol: string) => BadgeConfig;
};

export function UserGridView({
  users,
  getStatusBadgeVariant,
  getStatusLabel,
}: UserFridViewProps) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {users.map((user) => (
        <Link key={user.id} to={`/usuarios/ver/${user.id}`}>
          <Card className="h-full hover:shadow-md transition-all hover:scale-[1.01]">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{user.name}</CardTitle>
                <Badge variant={getStatusBadgeVariant(user.role).variant}>
                  {getStatusLabel(user.role).label}
                </Badge>
              </div>
              <CardDescription>
                {format(new Date(user.createdAt), "PPP", { locale: es })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {user.company || "Sin compañía"}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm">
                <span className="font-medium">Cargo:</span> {user.title}
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
