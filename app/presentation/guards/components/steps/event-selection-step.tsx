import type { EventEntity } from "~/domain/entities/event.entity";
import { PageHeader } from "~/shared/components/common/page-header";
import { EventCombobox } from "../../../registrations/components/event-combobox";

interface EventSelectionStepProps {
  events: EventEntity[];
  selectedEventId?: string;
  onEventSelect: (eventId: string) => void;
  title?: string;
  description?: string;
}

export function EventSelectionStep({
  events,
  selectedEventId,
  onEventSelect,
  title = "Seleccionar evento",
  description = "Selecciona un evento para continuar",
}: EventSelectionStepProps) {
  return (
    <div>
      <PageHeader title={title} description={description} />

      <div className="mt-8">
        <EventCombobox
          events={events ?? []}
          selectedEventId={selectedEventId}
          onEventSelect={onEventSelect}
          searchKey="eventSearch"
        />
      </div>
    </div>
  );
}
