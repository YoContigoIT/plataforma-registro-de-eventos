import { Badge, type BadgeVariants } from "@/ui/badge";
import { Card } from "@/ui/card";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { EventEntity } from "~/domain/entities/event.entity";

type EventListViewProps = {
  events: EventEntity[];
  getStatusBadgeVariant: (status: string) => string;
  getStatusLabel: (status: string) => string;
  onSelectEvent: (event: EventEntity) => void;
};

export function EventListView({
  events,
  getStatusBadgeVariant,
  getStatusLabel,
  onSelectEvent,
}: EventListViewProps) {
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
    <div className="flex flex-col gap-4 mt-6">
      {events.map((event) => (
        <Card
          key={event.id}
          className="hover:shadow-md transition-all hover:scale-[1.01] cursor-pointer"
          onClick={() => onSelectEvent(event)}
        >
          <div className="flex flex-col md:flex-row">
            <div className="flex-1 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{event.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {format(new Date(event.start_date), "PPP", {
                      locale: es,
                    })}
                  </p>
                </div>
                <Badge
                  variant={getStatusBadgeVariant(event.status) as BadgeVariants}
                >
                  {getStatusLabel(event.status)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-4 line-clamp-2">
                {event.description || "Sin descripción"}
              </p>
            </div>
            <div className="border-t md:border-t-0 md:border-l p-6 flex flex-row md:flex-col justify-between gap-4">
              <div className="text-sm">
                <span className="font-medium block">Ubicación</span>
                {event.location}
              </div>
              <div className="text-sm">
                <span className="font-medium block">Capacidad</span>
                {event.capacity} personas
              </div>
              <div className="text-sm">
                <span className="font-medium block">Disponibles</span>
                {event.remainingCapacity || 0} lugares
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
