import { Building, Calendar, Clock, MapPin, Timer, Users } from "lucide-react";
import type { EventEntity } from "~/domain/entities/event.entity";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";
import { Progress } from "~/shared/components/ui/progress";
import { Separator } from "~/shared/components/ui/separator";

export default function InviteDetailsPage({ event }: { event: EventEntity }) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="relative px-6 py-16 text-primary-foreground overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-secondary/70" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-4">
            {/*  <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
              {status === "PENDING"
                ? "Invitado"
                : status === "REGISTERED"
                  ? "Registrado"
                  : "Pendiente"}
            </Badge> */}
          </div>

          <h1 className="mb-6 text-5xl foknt-bold leading-tight text-primary-foreground">
            {event.name}
          </h1>
          <p className="mb-8 max-w-2xl text-xl text-primary-foreground/90">
            {event.description || "Te han invitado a este evento especial"}
          </p>
          <div className="flex flex-wrap gap-6 text-primary-foreground/80">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>
                {new Date(event.start_date).toLocaleDateString("es-MX", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>
                {new Date(event.start_date).toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -
                {new Date(event.end_date).toLocaleTimeString("es-MX", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-12">
        {/* Highlighted Personalized Greeting - Outside Banner */}
        {/* <div className="border-l-4 border-primary p-6 rounded-lg shadow-lg bg-card mb-12">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">
                ¡Hola {user.name}! 👋
              </h2>
              <p className="text-lg text-muted-foreground">
                {status === "PENDING"
                  ? "Has sido invitado a este evento especial"
                  : status === "REGISTERED"
                    ? "Ya estás registrado para este evento"
                    : "Aquí tienes los detalles del evento"}
              </p>
            </div>
          </div>
        </div>
 */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* About This Event */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  Acerca de este evento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {event.description ||
                    "¡Has sido invitado a este evento especial! Únete a nosotros para una experiencia única."}
                </p>
              </CardContent>
            </Card>

            {/* Event Agenda */}
            {event.agenda && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    Agenda del evento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {event.agenda.split("\n").map((item) => (
                      <div
                        key={`agenda-item-${item}`}
                        className="flex items-center gap-4"
                      >
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="font-medium text-foreground">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Venue & Location */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-foreground mb-2">
                  {event.location}
                </h3>
                <p className="text-muted-foreground mb-4">
                  Ubicación del evento. Te esperamos en este lugar para
                  compartir una experiencia increíble.
                </p>
                <Button
                  variant="outline"
                  className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Ver en el mapa
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Registration Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">
                  Aforo del evento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>Asistentes</span>
                  </div>
                  <span className="font-semibold text-foreground">
                    {event.remainingCapacity} / {event.capacity}
                  </span>
                </div>
                {/* Replaced with shadcn Progress component */}
                <Progress
                  value={(event?.remainingCapacity || 0) / event.capacity}
                  className="w-full h-3"
                />
                <p className="text-sm text-primary font-medium">
                  {event.remainingCapacity} lugares disponibles
                </p>
                {event.maxTickets && (
                  <p className="text-sm text-muted-foreground">
                    Máximo {event.maxTickets} tickets por persona
                  </p>
                )}
                {/* {status === "PENDING" ? (
                  <Link to={`/inscripcion/${event.id}`}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Registrar asistencia
                    </Button>
                  </Link>
                ) : status === "REGISTERED" ? (
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    disabled
                  >
                    ✓ Registrado
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-muted text-muted-foreground"
                    disabled
                  >
                    No disponible
                  </Button>
                )} */}
              </CardContent>
            </Card>

            {/* Event Details Card with Icons */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <span className="text-sm text-muted-foreground">Fecha</span>
                    <p className="font-medium text-foreground">
                      {new Date(event.start_date).toLocaleDateString("es-MX", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <span className="text-sm text-muted-foreground">Hora</span>
                    <p className="font-medium text-foreground">
                      {new Date(event.start_date).toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      -
                      {new Date(event.end_date).toLocaleTimeString("es-MX", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Timer className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <span className="text-sm text-muted-foreground">
                      Duración
                    </span>
                    <p className="font-medium text-foreground">
                      {Math.ceil(
                        (new Date(event.end_date).getTime() -
                          new Date(event.start_date).getTime()) /
                          (1000 * 60 * 60)
                      )}{" "}
                      horas
                    </p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <span className="text-sm text-muted-foreground">
                      Formato
                    </span>
                    <p className="font-medium text-foreground">Presencial</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
