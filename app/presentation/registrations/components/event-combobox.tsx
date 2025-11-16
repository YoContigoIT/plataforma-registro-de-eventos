import { Calendar, Check, ChevronsUpDown } from "lucide-react";
import { useMemo, useState } from "react";
import type {
  EventEntity,
  EventEntityWithEventForm,
} from "~/domain/entities/event.entity";
import { Badge } from "~/shared/components/ui/badge";
import { Button } from "~/shared/components/ui/button";
import { Card, CardContent } from "~/shared/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/shared/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "~/shared/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/shared/components/ui/popover";
import { useIsMobile } from "~/shared/hooks/use-mobile";
import { useSearchableCombobox } from "~/shared/hooks/use-searchable-combobox.hook";
import {
  cn,
  getEventStatusBadgeVariant,
  getEventStatusLabel,
} from "~/shared/lib/utils";

const formatEventDates = (event: EventEntity): string => {
  const startDate = new Date(event.start_date);
  const endDate = new Date(event.end_date);

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  const startFormatted = startDate.toLocaleDateString("es-MX", formatOptions);
  const endFormatted = endDate.toLocaleDateString("es-MX", formatOptions);

  if (startDate.toDateString() === endDate.toDateString()) {
    return startFormatted;
  }

  return `${startFormatted} - ${endFormatted}`;
};

export function EventCombobox({
  events,
  selectedEventId,
  onEventSelect,
  searchKey = "search",
}: {
  events: EventEntity[] | EventEntityWithEventForm[];
  selectedEventId?: string;
  onEventSelect: (eventId: string) => void;
  searchKey?: string;
}) {
  const isMobile = useIsMobile();

  const [open, setOpen] = useState(false);

  const { handleSearch, handleClearSearchOnClose } = useSearchableCombobox({
    searchParamKey: searchKey,
  });

  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId),
    [events, selectedEventId]
  );

  const handleEventSelect = (eventId: string) => {
    onEventSelect(eventId);
    setOpen(false);
  };

  return (
    <Card>
      <CardContent>
        <div className="space-y-2">
          <label
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="eventSearch"
          >
            Seleccionar evento
          </label>
          {isMobile ? (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {selectedEvent ? selectedEvent.name : "Elige un evento..."}
                </Button>
              </DialogTrigger>

              <DialogContent className="p-0 max-h-[80vh] overflow-y-auto">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Buscar eventos..."
                    onValueChange={handleSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No se encontraron eventos.</CommandEmpty>
                    <CommandGroup>
                      {events.map((event) => (
                        <CommandItem
                          key={event.id}
                          value={event.id}
                          onSelect={() => {
                            handleEventSelect(event.id);
                            setOpen(false);
                          }}
                          className="p-3"
                        >
                          <p>{event.name}</p>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </DialogContent>
            </Dialog>
          ) : (
            <Popover
              open={open}
              onOpenChange={(newOpen) => {
                setOpen(newOpen);
                if (!newOpen) {
                  handleClearSearchOnClose();
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedEvent ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{selectedEvent.name}</span>
                      <Badge
                        variant={getEventStatusBadgeVariant(
                          selectedEvent.status
                        )}
                        className="ml-2 shrink-0"
                      >
                        {getEventStatusLabel(selectedEvent.status)}
                      </Badge>
                    </div>
                  ) : (
                    "Elige un evento..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="center">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Buscar eventos..."
                    onValueChange={handleSearch}
                  />
                  <CommandList className="md:min-w-2xl overflow-auto">
                    <CommandEmpty>No se encontraron eventos.</CommandEmpty>
                    <CommandGroup>
                      {events.map((event) => (
                        <CommandItem
                          key={event.id}
                          value={event.id}
                          onSelect={() => handleEventSelect(event.id)}
                          className="flex items-center justify-between p-3 cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Check
                                className={cn(
                                  "h-4 w-4",
                                  selectedEventId === event.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">
                                  {event.name}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>{formatEventDates(event)}</span>
                                  </div>
                                  {/* <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {new Date(
                                      event.start_date
                                    ).toLocaleTimeString("es-ES", {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div> */}
                                </div>
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant={getEventStatusBadgeVariant(event.status)}
                            className="ml-2 shrink-0"
                          >
                            {getEventStatusLabel(event.status)}
                          </Badge>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
