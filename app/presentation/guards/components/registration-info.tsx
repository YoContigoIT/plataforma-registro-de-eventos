// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Briefcase,
//   Building,
//   Calendar,
//   CheckCircle,
//   Clock,
//   Download,
//   Mail,
//   MapPin,
//   Phone,
//   QrCode,
//   User,
//   Users,
//   XCircle,
// } from "lucide-react";

import { Avatar } from "@radix-ui/react-avatar";
import { Calendar, CheckCircle, Clock, MapPin, User } from "lucide-react";
import { useLoaderData } from "react-router";
import { AvatarFallback } from "~/shared/components/ui/avatar";
import { Button } from "~/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/shared/components/ui/card";

// import { useLoaderData } from "react-router";
// export function RegistrationInfo() {
//   const { registration } = useLoaderData();
//   // Formatear fechas
//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString("es-ES", {
//       weekday: "long",
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };

//   const formatTime = (dateString) => {
//     return new Date(dateString).toLocaleTimeString("es-ES", {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   // Calcular si el evento ya pasó
//   const isPastEvent = new Date(registration.event.end_date) < new Date();

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
//       <div className="max-w-5xl mx-auto">
//         {/* Header */}
//         <div className="flex items-center mb-6">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
//               Verificación de Registro
//             </h1>
//             <p className="text-gray-600 dark:text-gray-400">
//               Sistema de confirmación de asistencia
//             </p>
//           </div>
//         </div>

//         {/* Columna principal */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Tarjeta de estado */}
//           <Card
//             className={`
//               border-2
//               ${
//                 registration.status === "REGISTERED"
//                   ? "border-green-500 bg-green-50 dark:bg-green-950/20"
//                   : registration.status === "CANCELLED"
//                     ? "border-red-500 bg-red-50 dark:bg-red-950/20"
//                     : "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
//               }
//             `}
//           >
//             <CardContent className="p-6">
//               <div className="flex items-center">
//                 <div className="flex-shrink-0">
//                   {registration.status === "REGISTERED" ? (
//                     <CheckCircle className="h-8 w-8 text-green-500" />
//                   ) : registration.status === "CANCELLED" ? (
//                     <XCircle className="h-8 w-8 text-red-500" />
//                   ) : (
//                     <Clock className="h-8 w-8 text-blue-500" />
//                   )}
//                 </div>
//                 <div className="ml-4">
//                   <h3 className="text-lg font-medium">
//                     {registration.status === "REGISTERED"
//                       ? "Registro Confirmado"
//                       : registration.status === "CANCELLED"
//                         ? "Registro Cancelado"
//                         : "Registro Pendiente"}
//                   </h3>
//                   <p className="text-sm mt-1">
//                     {registration.status === "REGISTERED"
//                       ? "Este registro está confirmado y listo para el evento."
//                       : registration.status === "CANCELLED"
//                         ? "Este registro ha sido cancelado y no es válido para el evento."
//                         : "Este registro está pendiente de confirmación."}
//                   </p>
//                 </div>
//               </div>

//               {registration.checkedInAt && (
//                 <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 rounded-md">
//                   <div className="flex items-center">
//                     <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
//                     <span className="font-medium">Check-in realizado</span>
//                   </div>
//                   <p className="text-sm text-green-700 dark:text-green-300 mt-1">
//                     {formatDate(registration.checkedInAt)} a las{" "}
//                     {formatTime(registration.checkedInAt)}
//                   </p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Información del evento */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center">
//                 <Calendar className="h-5 w-5 mr-2" />
//                 Información del Evento
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div>
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                   {registration.event.name}
//                 </h3>
//                 {registration.event.description && (
//                   <p className="text-gray-600 dark:text-gray-400 mt-1">
//                     {registration.event.description}
//                   </p>
//                 )}
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                 <div className="flex items-start">
//                   <Calendar className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
//                   <div>
//                     <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
//                       Fecha
//                     </p>
//                     <p className="text-gray-900 dark:text-white">
//                       {formatDate(registration.event.start_date)}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-start">
//                   <Clock className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
//                   <div>
//                     <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
//                       Horario
//                     </p>
//                     <p className="text-gray-900 dark:text-white">
//                       {formatTime(registration.event.start_date)} -{" "}
//                       {formatTime(registration.event.end_date)}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-start">
//                   <MapPin className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
//                   <div>
//                     <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
//                       Ubicación
//                     </p>
//                     <p className="text-gray-900 dark:text-white">
//                       {registration.event.location}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-start">
//                   <Users className="h-5 w-5 text-gray-500 mt-0.5 mr-3" />
//                   <div>
//                     <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
//                       Capacidad
//                     </p>
//                     <p className="text-gray-900 dark:text-white">
//                       {registration.event.capacity} personas
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {registration.event.agenda && (
//                 <div>
//                   <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
//                     Agenda
//                   </p>
//                   <p className="text-gray-700 dark:text-gray-300">
//                     {registration.event.agenda}
//                   </p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Columna lateral */}
//         <div className="space-y-6">
//           {/* Información del asistente */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center">
//                 <User className="h-5 w-5 mr-2" />
//                 Información del Asistente
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex items-center space-x-3">
//                 <Avatar className="h-14 w-14">
//                   <AvatarFallback className="bg-primary/10 text-primary text-lg">
//                     {registration.user.name.charAt(0).toUpperCase()}
//                   </AvatarFallback>
//                 </Avatar>
//                 <div>
//                   <h3 className="font-semibold text-gray-900 dark:text-white">
//                     {registration.user.name}
//                   </h3>
//                   <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
//                     <Mail className="h-4 w-4 mr-1" />
//                     {registration.user.email}
//                   </div>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 {registration.user.phone && (
//                   <div className="flex items-center text-sm">
//                     <Phone className="h-4 w-4 mr-2 text-gray-500" />
//                     <span>{registration.user.phone}</span>
//                   </div>
//                 )}

//                 {registration.user.company && (
//                   <div className="flex items-center text-sm">
//                     <Building className="h-4 w-4 mr-2 text-gray-500" />
//                     <span>{registration.user.company}</span>
//                   </div>
//                 )}

//                 {registration.user.title && (
//                   <div className="flex items-center text-sm">
//                     <Briefcase className="h-4 w-4 mr-2 text-gray-500" />
//                     <span>{registration.user.title}</span>
//                   </div>
//                 )}
//               </div>

//               <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
//                 <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
//                   Fecha de registro
//                 </p>
//                 <p className="text-sm text-gray-900 dark:text-white">
//                   {formatDate(registration.registeredAt)}
//                 </p>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Código QR */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center">
//                 <QrCode className="h-5 w-5 mr-2" />
//                 Código de Registro
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="flex flex-col items-center">
//               <div className="bg-white p-4 rounded-lg border border-gray-200">
//                 <div className="w-32 h-32 bg-gray-100 flex items-center justify-center">
//                   <span className="text-xs text-gray-500">Código QR aquí</span>
//                 </div>
//               </div>
//               <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
//                 ID: {registration.id.slice(-8).toUpperCase()}
//               </p>
//             </CardContent>
//             <CardFooter>
//               <Button variant="outline" className="w-full" size="sm">
//                 <Download className="h-4 w-4 mr-2" />
//                 Descargar QR
//               </Button>
//             </CardFooter>
//           </Card>

//           {/* Acciones */}
//           <Card>
//             <CardHeader>
//               <CardTitle>Acciones</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               {registration.status === "REGISTERED" &&
//                 !registration.checkedInAt &&
//                 !isPastEvent && (
//                   <Button className="w-full">
//                     <CheckCircle className="h-4 w-4 mr-2" />
//                     Realizar Check-in
//                   </Button>
//                 )}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { QrCode } from "lucide-react";

export function RegistrationInfo() {
  const { registration } = useLoaderData();

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
    };
  };

  const eventDate = formatDateTime(registration.event.start_date);
  const eventEndTime = formatDateTime(registration.event.end_date).time;

  return (
    <div className=" p-4 flex items-center justify-center">
      <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-3">
            <QrCode className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Verificación de Invitación</h1>
        </div>

        <div className="p-6 space-y-6">
          {/* Tarjeta de estado */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-4">
                <div
                  className={`rounded-full p-3 ${
                    registration.status === "REGISTERED"
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  <CheckCircle
                    className={`h-8 w-8 ${
                      registration.status === "REGISTERED"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  />
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-800">
                  {registration.status === "REGISTERED"
                    ? "INVITACIÓN VÁLIDA"
                    : "INVITACIÓN NO VÁLIDA"}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {registration.status === "REGISTERED"
                    ? "Puede ingresar al evento"
                    : "No puede ingresar al evento"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Información del asistente */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <User className="h-4 w-4 mr-2" />
                Asistente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-blue-100 text-blue-600">
                    {registration.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-gray-800">
                    {registration.user.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {registration.user.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del evento */}
          <Card className="border-0 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Evento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h3 className="font-medium text-gray-800">
                  {registration.event.name}
                </h3>
              </div>

              <div className="flex items-center text-sm">
                <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                <span>{eventDate.date}</span>
              </div>

              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <span>
                  {eventDate.time} - {eventEndTime}
                </span>
              </div>

              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                <span className="flex-1">{registration.event.location}</span>
              </div>
            </CardContent>
          </Card>

          {/* Detalles adicionales */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Estado</p>
                  <Badge
                    variant={
                      registration.status === "REGISTERED"
                        ? "sky"
                        : "destructive"
                    }
                    className="mt-1"
                  >
                    {registration.status === "REGISTERED"
                      ? "Confirmado"
                      : "Cancelado"}
                  </Badge>
                </div>

                <div>
                  <p className="text-gray-500">Check-in</p>
                  <p className="font-medium mt-1">
                    {registration.checkedInAt ? "Realizado" : "Pendiente"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acción principal */}
          {registration.status === "REGISTERED" &&
            !registration.checkedInAt && (
              <Button className="w-full" size="lg">
                <CheckCircle className="h-5 w-5 mr-2" />
                Realizar Check-in
              </Button>
            )}

          {/* Mensaje de estado */}
          {registration.checkedInAt && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <CheckCircle className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-blue-800 font-medium">Check-in ya realizado</p>
              <p className="text-blue-600 text-sm">
                {formatDateTime(registration.checkedInAt).date} a las{" "}
                {formatDateTime(registration.checkedInAt).time}
              </p>
            </div>
          )}

          {registration.status !== "REGISTERED" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-800 font-medium">Invitación no válida</p>
              <p className="text-red-600 text-sm">
                No puede ingresar al evento
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
