import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  FileText,
  List,
  MapPin,
} from "lucide-react";
import type { EventEntity } from "~/domain/entities/event.entity";

interface EventDetailsPanelProps {
  event: EventEntity;
  isVisible: boolean;
  onToggle: () => void;
}

export function EventDetailsPanel({
  event,
  isVisible,
  onToggle,
}: EventDetailsPanelProps) {
  return (
    <>
      <button
        onClick={onToggle}
        className="absolute left-2 top-1/2 -translate-y-1/2 md:block hidden bg-primary/80 hover:bg-primary transition-colors rounded-full p-2 z-20 shadow-lg"
        type="button"
        aria-label={
          isVisible
            ? "Ocultar detalles del evento"
            : "Mostrar detalles del evento"
        }
      >
        {isVisible ? (
          <ChevronLeft className="h-4 w-4 text-white" />
        ) : (
          <ChevronRight className="h-4 w-4 text-white" />
        )}
      </button>

      <div
        className={`bg-gradient-to-br md:pl-12 from-primary to-secondary text-white md:pr-0 px-4 py-8 transition-all duration-500 ease-in-out ${
          isVisible
            ? "md:w-2/5 translate-x-0"
            : "md:w-0 md:-translate-x-full md:overflow-hidden"
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          className="md:hidden w-full flex items-center justify-center py-2 bg-white/20 hover:bg-white/30 transition-colors rounded-lg"
          aria-label={
            isVisible
              ? "Ocultar detalles del evento"
              : "Mostrar detalles del evento"
          }
        >
          <span className="text-sm font-medium mr-2">
            {isVisible ? "Ocultar detalles" : "Mostrar detalles"}
          </span>
          {isVisible ? (
            <ChevronLeft className="h-4 w-4 text-white rotate-90" />
          ) : (
            <ChevronRight className="h-4 w-4 text-white rotate-90" />
          )}
        </button>

        <div
          className={`transition-all duration-300 ${
            isVisible ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
          }`}
        >
          <div className="mb-8">
            <h2 className="text-3xl font-extrabold mb-6 leading-snug mt-2">
              {event?.name || "Nombre del Evento"}
            </h2>

            <div className="space-y-6">
              {/* Fecha y hora */}
              <div className="flex items-start">
                <div className="bg-white/20 p-2 rounded-lg mr-3">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm uppercase tracking-wide">
                    Fecha y Hora
                  </p>
                  <p className="text-sm opacity-90">
                    {event?.start_date
                      ? new Date(event.start_date).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Fecha del evento"}
                  </p>
                  <p className="text-xs opacity-75">
                    {event?.start_date
                      ? new Date(event.start_date).toLocaleTimeString("es-MX", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                      : "Hora del evento"}
                  </p>
                </div>
              </div>
              {/* Ubicación */}
              {event?.location && (
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-lg mr-3">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm uppercase tracking-wide">
                      Ubicación
                    </p>
                    <p className="text-sm opacity-90">{event.location}</p>
                  </div>
                </div>
              )}
              {/* Descripción */}
              {event?.description && (
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-lg mr-3">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm uppercase tracking-wide">
                      Descripción
                    </p>
                    <p className="text-sm opacity-90 whitespace-pre-line">
                      {event.description}
                    </p>
                  </div>
                </div>
              )}
              {/* Agenda */}
              {event?.agenda && (
                <div className="flex items-start">
                  <div className="bg-white/20 p-2 rounded-lg mr-3">
                    <List className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm uppercase tracking-wide">
                      Agenda
                    </p>
                    <p className="text-sm opacity-90 whitespace-pre-line">
                      {event.agenda}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
