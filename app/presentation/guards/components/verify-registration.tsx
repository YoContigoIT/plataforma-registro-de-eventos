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
import type { RegistrationStatus } from "@prisma/client";
import {
  Briefcase,
  Building,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  HelpCircle,
  Mail,
  MapPin,
  Phone,
  QrCode,
  User,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useFetcher, useLoaderData } from "react-router";
import { toast } from "sonner";

export function VerifyRegistration() {
  const loaderData = useLoaderData();
  const { invite, event, user, qrCodeUrl } = loaderData?.data || {};
  const fetcher = useFetcher();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Función de resize robusta: resetea transform y aplica escala correcta
    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      const w = canvas.clientWidth || 300;
      const h = canvas.clientHeight || 150;
      // establecer tamaño físico del canvas
      canvas.width = Math.floor(w * ratio);
      canvas.height = Math.floor(h * ratio);
      // ajustar tamaño CSS para mantener layout
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      // resetear transform antes de escalar (evita escalados acumulados)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(ratio, ratio);
      // fondo blanco (user space)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, w, h);
      // estilo de trazo (user space)
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#111827";
      ctx.globalCompositeOperation = "source-over";
    };

    // Ejecutar resize en next frame y después de un pequeño delay por si el layout cambia
    const scheduleResize = () => {
      requestAnimationFrame(() => resize());
      setTimeout(resize, 50);
    };
    scheduleResize();
    window.addEventListener("resize", scheduleResize);

    const getPosFromMouseTouch = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    // Handlers para pointer + fallback mouse/touch
    const onPointerDown = (ev: PointerEvent) => {
      drawingRef.current = true;
      try {
        // usar canvas directamente para el pointer capture
        (canvas as HTMLCanvasElement).setPointerCapture?.(ev.pointerId);
      } catch {}
      const p = getPosFromMouseTouch(ev.clientX, ev.clientY);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      // dibujar un pequeño punto inicial para que sea visible
      ctx.lineTo(p.x + 0.1, p.y + 0.1);
      ctx.stroke();
    };
    const onPointerMove = (ev: PointerEvent) => {
      if (!drawingRef.current) return;
      const p = getPosFromMouseTouch(ev.clientX, ev.clientY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    };
    const onPointerUp = (ev: PointerEvent) => {
      drawingRef.current = false;
      try {
        (canvas as HTMLCanvasElement).releasePointerCapture?.(ev.pointerId);
      } catch {}
    };

    // Fallbacks para navegadores que no despachan pointer events correctamente
    const onMouseDown = (ev: MouseEvent) =>
      onPointerDown(ev as unknown as PointerEvent);
    const onMouseMove = (ev: MouseEvent) =>
      onPointerMove(ev as unknown as PointerEvent);
    const onMouseUp = (ev: MouseEvent) =>
      onPointerUp(ev as unknown as PointerEvent);

    const onTouchStart = (ev: TouchEvent) => {
      ev.preventDefault();
      const t = ev.touches[0];
      if (!t) return;
      onPointerDown({
        pointerId: t.identifier,
        clientX: t.clientX,
        clientY: t.clientY,
      } as unknown as PointerEvent);
    };
    const onTouchMove = (ev: TouchEvent) => {
      ev.preventDefault();
      const t = ev.touches[0];
      if (!t) return;
      onPointerMove({
        pointerId: t.identifier,
        clientX: t.clientX,
        clientY: t.clientY,
      } as unknown as PointerEvent);
    };
    const onTouchEnd = (ev: TouchEvent) => {
      ev.preventDefault();
      onPointerUp({} as unknown as PointerEvent);
    };

    // Añadir listeners
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("pointerleave", onPointerUp);

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    canvas.addEventListener("touchstart", onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    canvas.addEventListener("touchend", onTouchEnd);

    return () => {
      window.removeEventListener("resize", scheduleResize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("pointerleave", onPointerUp);

      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);

      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // limpiar en user-space: obtener tamaño CSS
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // mantener devicePixelRatio handling: rellenar fondo blanco en user space
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    // volver a pintar el fondo blanco (user space)
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  };


  const statusConfig: Record<
    RegistrationStatus,
    {
      title: string;
      message: string;
      badge: string;
      badgeVariant: "default" | "destructive" | "secondary";
      icon: React.ElementType;
      iconColor: string;
      bgColor: string;
      alert?: {
        bg: string;
        border: string;
        title: string;
        message: string;
        titleColor: string;
        messageColor: string;
      };
    }
  > = {
    PENDING: {
      title: "INVITACIÓN PENDIENTE",
      message: "Aún no se ha confirmado la asistencia.",
      badge: "Pendiente",
      badgeVariant: "secondary",
      icon: Clock,
      iconColor: "text-yellow-500",
      bgColor: "bg-yellow-100",
      alert: {
        bg: "bg-yellow-50",
        border: "border-yellow-200",
        title: "Invitación pendiente",
        message: "Aún no se puede confirmar el acceso al evento.",
        titleColor: "text-yellow-800",
        messageColor: "text-yellow-600",
      },
    },
    REGISTERED: {
      title: "INVITACIÓN VÁLIDA",
      message: "Puede ingresar al evento.",
      badge: "Confirmado",
      badgeVariant: "default",
      icon: CheckCircle,
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
    },
    WAITLISTED: {
      title: "EN LISTA DE ESPERA",
      message: "Su lugar depende de disponibilidad.",
      badge: "Lista de espera",
      badgeVariant: "secondary",
      icon: HelpCircle,
      iconColor: "text-blue-500",
      bgColor: "bg-blue-100",
      alert: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        title: "Lista de espera",
        message: "Debe esperar a que se libere un lugar para acceder.",
        titleColor: "text-blue-800",
        messageColor: "text-blue-600",
      },
    },
    CHECKED_IN: {
      title: "YA REGISTRADO EN EL EVENTO",
      message: "El usuario ya hizo check-in.",
      badge: "Asistencia confirmada",
      badgeVariant: "default",
      icon: UserCheck,
      iconColor: "text-green-500",
      bgColor: "bg-green-100",
    },
    CANCELLED: {
      title: "REGISTRO CANCELADO",
      message: "No puede ingresar al evento.",
      badge: "Cancelado",
      badgeVariant: "destructive",
      icon: XCircle,
      iconColor: "text-red-600",
      bgColor: "bg-red-100",
      alert: {
        bg: "bg-red-50",
        border: "border-red-200",
        title: "Invitación no válida",
        message: "No puede ingresar al evento con esta invitación.",
        titleColor: "text-red-800",
        messageColor: "text-red-600",
      },
    },
    DECLINED: {
      title: "INVITACIÓN RECHAZADA",
      message: "El usuario declinó la invitación.",
      badge: "Rechazado",
      badgeVariant: "destructive",
      icon: UserX,
      iconColor: "text-red-500",
      bgColor: "bg-red-100",
      alert: {
        bg: "bg-red-50",
        border: "border-red-200",
        title: "Invitación rechazada",
        message: "El usuario declinó esta invitación y no puede ingresar.",
        titleColor: "text-red-800",
        messageColor: "text-red-600",
      },
    },
  };

  const {
    title,
    message,
    badge,
    badgeVariant,
    icon: StatusIcon,
    iconColor,
    bgColor,
    alert,
  } = statusConfig[invite.status as RegistrationStatus];

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      toast[fetcher.data.success ? "success" : "error"](
        fetcher.data.success
          ? fetcher.data.message || "Registro chequeado exitosamente"
          : fetcher.data.error || "Error al chequear el registro"
      );
    }
  }, [fetcher.state, fetcher.data]);

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

  const handleCheckIn = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    fetcher.submit(
      { signature: dataUrl },
      {
        method: "post",
        action: `/verificar-registro/${invite.qrCode}`,
      }
    );
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
                <div className={`rounded-full p-3 shadow-inner ${bgColor}`}>
                  <StatusIcon className={`h-10 w-10 ${iconColor}`} />
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-xl font-semibold text-slate-800 mb-2">
                  {title}
                </h2>
                <p className="text-slate-600">{message}</p>

                <div className="mt-4">
                  <Badge variant={badgeVariant} className="text-sm px-3 py-1">
                    {badge}
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
                      src={qrCodeUrl}
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

                {event.requiresSignature && (
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm font-medium text-slate-500">
                      Firma del asistente
                    </p>
                    <div className="mt-2">
                      <div className="w-full h-40 border rounded bg-white overflow-hidden">
                        <canvas
                          ref={canvasRef}
                          className="w-full h-full"
                          style={{
                            display: "block",
                            touchAction: "none",
                            cursor: "crosshair",
                            WebkitTapHighlightColor: "transparent",
                          }}
                        />
                      </div>
                      <div className="flex items-center  justify-end gap-2 mt-2">
                        <Button
                          variant="destructive"
                          onClick={clearSignature}
                          className="px-3 py-2 rounded border text-sm"
                        >
                          Limpiar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              {invite.status === "REGISTERED" && !invite.checkedInAt && (
                <CardFooter>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={handleCheckIn}
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Realizar Check-in
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>

          {/* Notificaciones de estado */}
          {alert && (
            <div
              className={`${alert.bg} ${alert.border} rounded-lg p-4 text-center`}
            >
              <p className={`${alert.titleColor} font-medium`}>{alert.title}</p>
              <p className={alert.messageColor}>{alert.message}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
