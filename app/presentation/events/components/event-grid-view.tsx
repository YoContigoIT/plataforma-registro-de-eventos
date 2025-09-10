import { Badge, type BadgeVariants } from "@/ui/badge";
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
import type { EventEntity } from "~/domain/entities/event.entity";

type EventGridViewProps = {
  events: EventEntity[];
  getStatusBadgeVariant: (status: string) => BadgeVariants;
  getStatusLabel: (status: string) => string;
};

export function EventGridView({
  events,
  getStatusBadgeVariant,
  getStatusLabel,
}: EventGridViewProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">No hay eventos disponibles</h3>
        <p className="text-muted-foreground mt-2">
          Crea un nuevo evento para comenzar.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
      {events.map((event) => (
        <Link key={event.id} to={`/eventos/detalle/${event.id}`}>
          <Card className="h-full hover:shadow-md transition-all hover:scale-[1.01]">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{event.name}</CardTitle>
                <Badge
                  variant={getStatusBadgeVariant(event.status) as BadgeVariants}
                >
                  {getStatusLabel(event.status)}
                </Badge>
              </div>
              <CardDescription>
                {format(new Date(event.start_date), "PPP", { locale: es })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.description || "Sin descripción"}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm">
                <span className="font-medium">Ubicación:</span> {event.location}
              </div>
              <div className="text-sm">
                <span className="font-medium">Capacidad:</span> {event.capacity}
              </div>
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
