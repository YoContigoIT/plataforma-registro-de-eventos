import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Mail,
  MapPin,
  Phone,
  QrCode,
  User,
} from "lucide-react";
import { useLoaderData } from "react-router";

export function RegistrationInfo() {
  const loaderData = useLoaderData();
  const { invite, event, user } = loaderData?.data || {};

  // Formatear fecha y hora
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      time: date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      fullDate: date.toLocaleDateString("es-ES", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
  };

  const eventDate = formatDateTime(event.start_date);
  const eventEndTime = formatDateTime(event.end_date).time;

  // Generar iniciales para el avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Simular descarga de QR
  const handleDownloadQR = () => {
    // Lógica para descargar QR
    console.log("Descargando código QR...");
  };

  return (
    <div>
      <div className="w-full  bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-100">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-4 -left-4 w-24 h-24 rounded-full bg-white"></div>
            <div className="absolute bottom-2 -right-4 w-32 h-32 rounded-full bg-white"></div>
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm border border-white/30">
              <QrCode className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Verificación de Invitación
            </h1>
            <p className="text-blue-100 font-light">
              Sistema de confirmación de asistencia
            </p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Tarjeta de estado */}
          <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-blue-50/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div
                  className={`rounded-full p-3 ${invite.status === "REGISTERED" ? "bg-green-100" : "bg-red-100"} shadow-inner`}
                >
                  <CheckCircle
                    className={`h-10 w-10 ${invite.status === "REGISTERED" ? "text-green-600" : "text-red-600"}`}
                  />
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-xl font-semibold text-slate-800 mb-2">
                  {invite.status === "REGISTERED"
                    ? "INVITACIÓN VÁLIDA"
                    : "INVITACIÓN NO VÁLIDA"}
                </h2>
                <p className="text-slate-600">
                  {invite.status === "REGISTERED"
                    ? "Puede ingresar al evento"
                    : "No puede ingresar al evento"}
                </p>

                <div className="mt-4">
                  <Badge
                    variant={
                      invite.status === "REGISTERED" ? "default" : "destructive"
                    }
                    className="text-sm px-3 py-1"
                  >
                    {invite.status === "REGISTERED"
                      ? "Confirmado"
                      : "Cancelado"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información del asistente */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-slate-800">
                  <User className="h-5 w-5 mr-2 text-blue-600" />
                  Información del Asistente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-14 w-14 border-2 border-blue-100">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-lg font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">
                      {user.name}
                    </h3>
                    <div className="flex items-center text-sm text-slate-600 mt-1">
                      <Mail className="h-4 w-4 mr-1" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {user.phone && (
                    <div className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-2 text-slate-500" />
                      <span className="text-slate-700">{user.phone}</span>
                    </div>
                  )}

                  {user.company && (
                    <div className="flex items-center text-sm">
                      <Building className="h-4 w-4 mr-2 text-slate-500" />
                      <span className="text-slate-700">{user.company}</span>
                    </div>
                  )}

                  {user.title && (
                    <div className="flex items-center text-sm">
                      <Briefcase className="h-4 w-4 mr-2 text-slate-500" />
                      <span className="text-slate-700">{user.title}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-sm font-medium text-slate-500">
                    Tickets adquiridos
                  </p>
                  <p className="text-lg font-semibold text-blue-700">
                    {invite.purchasedTickets}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Información del evento */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-slate-800">
                  <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                  Información del Evento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-slate-800 text-lg">
                    {event.name}
                  </h3>
                  {event.description && (
                    <p className="text-slate-600 text-sm mt-1">
                      {event.description}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 text-slate-500 mr-2 flex-shrink-0" />
                    <span className="text-slate-700">{eventDate.fullDate}</span>
                  </div>

                  <div className="flex items-center text-sm">
                    <Clock className="h-4 w-4 text-slate-500 mr-2 flex-shrink-0" />
                    <span className="text-slate-700">
                      {eventDate.time} - {eventEndTime}
                    </span>
                  </div>

                  <div className="flex items-start text-sm">
                    <MapPin className="h-4 w-4 text-slate-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{event.location}</span>
                  </div>
                </div>

                {event.capacity && (
                  <div className="pt-3 border-t border-slate-100">
                    <p className="text-sm font-medium text-slate-500">
                      Capacidad del evento
                    </p>
                    <p className="text-slate-700">{event.capacity} personas</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Código QR y Check-in */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Código QR */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg flex items-center text-slate-800">
                  <QrCode className="h-5 w-5 mr-2 text-blue-600" />
                  Código de Registro
                </CardTitle>
                <CardDescription>
                  Presente este código en la entrada del evento
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                  <div className="w-40 h-40 bg-white flex items-center justify-center rounded border overflow-hidden mx-auto">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent("http://localhost:3000/verificar-registro/" + invite.qrCode)}`}
                      alt="QR Code"
                      className="w-full h-full object-contain"
                      width={150}
                      height={150}
                      loading="lazy"
                    />
                  </div>
                  <p className="text-xs text-slate-500 text-center mt-2">
                    ID: {invite.qrCode}
                  </p>
                </div>
              </CardContent>
              {/* <CardFooter>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleDownloadQR}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar QR
                </Button>
              </CardFooter> */}
            </Card>
            {/* Check-in y detalles adicionales */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg text-slate-800">
                  Detalles de Registro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Estado del check-in</span>
                  <Badge variant={invite.checkedInAt ? "default" : "secondary"}>
                    {invite.checkedInAt ? "Realizado" : "Pendiente"}
                  </Badge>
                </div>

                {invite.checkedInAt && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">
                        Check-in realizado
                      </span>
                    </div>
                    <p className="text-green-700 text-sm mt-1">
                      {formatDateTime(invite.checkedInAt).date} a las{" "}
                      {formatDateTime(invite.checkedInAt).time}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm font-medium text-slate-500">
                    Fecha de registro
                  </p>
                  <p className="text-slate-700">
                    {formatDateTime(invite.registeredAt).date}
                  </p>
                </div>
              </CardContent>

              {invite.status === "REGISTERED" && !invite.checkedInAt && (
                <CardFooter>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Realizar Check-in
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>

          {/* Notificaciones de estado */}
          {invite.status !== "REGISTERED" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-800 font-medium">Invitación no válida</p>
              <p className="text-red-600">
                No puede ingresar al evento con esta invitación
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
