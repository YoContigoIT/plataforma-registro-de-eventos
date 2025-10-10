"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RegistrationStatus } from "@prisma/client";
import { useEffect, useRef, useState } from "react";

interface SignaturePadProps {
  onSignatureChange?: (signatureData: string | null) => void;
  inviteStatus?: RegistrationStatus;
  iniviteCheckedInAt?: Date;
}
export default function SignaturePad({
  onSignatureChange,
  inviteStatus,
  iniviteCheckedInAt,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

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

    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    ctx.clearRect(0, 0, w, h);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    setSignaturePreview(null);
    onSignatureChange?.(null);
  };

  const viewSignaturePreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataUrl = canvas.toDataURL("image/png");
    setSignaturePreview(dataUrl);
    onSignatureChange?.(dataUrl);
    setPreviewOpen(true);
  };

  if (inviteStatus !== RegistrationStatus.REGISTERED && iniviteCheckedInAt) {
    return null;
  }
  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h2 className="text-lg font-semibold text-foreground">
        Firma del Asistente
      </h2>

      <canvas
        ref={canvasRef}
        className="border border-border bg-background rounded-md w-full max-w-md h-48"
      />

      <div className="flex gap-3">
        <Button variant="outline" onClick={clearSignature}>
          Limpiar
        </Button>

        <Button onClick={viewSignaturePreview}>Vista previa</Button>
      </div>

      {/* Dialog de vista previa */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Vista previa de la firma</DialogTitle>
          </DialogHeader>

          {signaturePreview ? (
            <img
              src={signaturePreview}
              alt="Vista previa de firma"
              className="border rounded-md w-full"
            />
          ) : (
            <p className="text-muted-foreground text-sm">
              No hay firma disponible.
            </p>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setPreviewOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
