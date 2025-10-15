import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, Mail, Phone } from "lucide-react";
import { useLoaderData } from "react-router";
import { getInitials, getUserRoleBadge } from "~/shared/lib/utils";

export default function ProfileHeader() {
  const { user } = useLoaderData();
  const { label, variant } = getUserRoleBadge(user.role);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-2xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <Badge variant={variant}>{label}</Badge>
            </div>
            <p className="text-muted-foreground">{user.title}</p>
            <div className="text-muted-foreground flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Mail className="size-4" />
                {user.email}
              </div>
              <div className="flex items-center gap-1">
                <Phone className="size-4" />
                {user.phone}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="size-4" />
                Fecha de creación:{" "}
                {format(new Date(user.createdAt), "PPP", {
                  locale: es,
                })}
              </div>
            </div>
          </div>
          {/* <Button variant="default">Editar</Button> */}
        </div>
      </CardContent>
    </Card>
  );
}
