import type { EventEntity } from "~/domain/entities/event.entity";
import { SelectInput } from "~/shared/components/common/select-input";
import { Card, CardContent } from "~/shared/components/ui/card";

export function EventSelector({
  events,
  handleEventSelect,
}: {
  events: EventEntity[];
  handleEventSelect: (eventId: string) => void;
}) {
  return (
    <Card>
      <CardContent>
        <SelectInput
          label="Seleccionar evento"
          placeholder="Elige un evento..."
          options={events.map((event) => ({
            value: event.id,
            label: event.name,
          }))}
          onValueChange={handleEventSelect}
          className="w-full"
        />
      </CardContent>
    </Card>
  );
}
