import type { UserEntity } from "~/domain/entities/user.entity";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";

export function UserStats({ user }: { user: Omit<UserEntity, "password"> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estadísticas</CardTitle>
        <CardDescription>Información del usuario</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Registros</span>
          <span className="font-medium">
            {(user?.registrations || []).length || "No especificado"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Eventos</span>
          <span className="font-medium text-sm">
            {(user?.createdEvents || []).length || "No especificado"}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
