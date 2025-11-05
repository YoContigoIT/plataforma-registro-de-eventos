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
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(null);

  // Helper robusto para preparar tamaño y estilos del canvas
  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const ctx = canvas.getContext("2d");
    if (!ctx) return false;

    ctxRef.current = ctx;

    const ratio = window.devicePixelRatio || 1;
    const w = Math.max(1, canvas.clientWidth || 300);
    const h = Math.max(1, canvas.clientHeight || 150);

    canvas.width = Math.floor(w * ratio);
    canvas.height = Math.floor(h * ratio);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(ratio, ratio);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#000000";
    ctx.globalCompositeOperation = "source-over";
    return true;
  };

  // Inicializar canvas cuando el modal se abre y cuando el tamaño cambia de 0 a >0
  useEffect(() => {
    if (!modalOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const tryInit = () => {
      if ((canvas.clientWidth || 0) > 0 && (canvas.clientHeight || 0) > 0) {
        setupCanvas();
      }
    };

    // Intentos espaciados para cubrir animación/transición del modal
    tryInit();
    const rafId = requestAnimationFrame(tryInit);
    const timerId = setTimeout(tryInit, 120);

    const ro = new ResizeObserver(() => tryInit());
    ro.observe(canvas);

    const onResize = () => tryInit();
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timerId);
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [modalOpen]);

  const handlePointerDown = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    ev.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Inicialización perezosa si aún no hay contexto
    if (!ctxRef.current) {
      const ok = setupCanvas();
      if (!ok) return;
    }
    const ctx = ctxRef.current!;
    drawingRef.current = true;
    try {
      canvas.setPointerCapture?.(ev.pointerId);
    } catch {}
    const rect = canvas.getBoundingClientRect();
    const p = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x + 0.1, p.y + 0.1);
    ctx.stroke();
  };

  const handlePointerMove = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    ev.preventDefault();
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const p = { x: ev.clientX - rect.left, y: ev.clientY - rect.top };
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };

  const handlePointerUp = (ev: React.PointerEvent<HTMLCanvasElement>) => {
    ev.preventDefault();
    const canvas = canvasRef.current;
    drawingRef.current = false;
    try {
      canvas?.releasePointerCapture?.(ev.pointerId);
    } catch {}
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = ctxRef.current;
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

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    setSignaturePreview(dataUrl);
    onSignatureChange?.(dataUrl);
  };

  const clearSavedSignature = () => {
    setSignaturePreview(null);
    onSignatureChange?.(null);
  };

  if (inviteStatus !== RegistrationStatus.REGISTERED && iniviteCheckedInAt) {
    return null;
  }
  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <h2 className="text-lg font-semibold text-foreground">
        Firma del Asistente
      </h2>

      {signaturePreview ? (
        <div className="w-full max-w-md flex flex-col items-center gap-3">
          <img
            src={signaturePreview}
            alt="Firma guardada"
            className="border rounded-md w-full"
          />
          <div className="flex gap-3">
            <Button variant="outline" onClick={clearSavedSignature}>
              Limpiar
            </Button>
            <Button onClick={() => setModalOpen(true)}>Firmar de nuevo</Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setModalOpen(true)}>Firmar</Button>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent
          className="sm:max-w-md"
          // Dispara un intento extra justo cuando el contenido recibe el foco
          onOpenAutoFocus={() => {
            // Encola para después del layout del modal
            setTimeout(() => setupCanvas(), 0);
          }}
        >
          <DialogHeader>
            <DialogTitle>Capturar firma</DialogTitle>
          </DialogHeader>

          <canvas
            ref={canvasRef}
            className="border border-border bg-background rounded-md w-full h-56 touch-none select-none cursor-crosshair"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onTouchStart={(e) => {
              e.preventDefault();
              const t = e.touches[0];
              if (!t) return;
              // Inicialización perezosa también en touch
              if (!ctxRef.current) {
                const ok = setupCanvas();
                if (!ok) return;
              }
              const ctx = ctxRef.current!;
              drawingRef.current = true;
              const rect = canvasRef.current!.getBoundingClientRect();
              const p = { x: t.clientX - rect.left, y: t.clientY - rect.top };
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p.x + 0.1, p.y + 0.1);
              ctx.stroke();
            }}
            onTouchMove={(e) => {
              if (!drawingRef.current) return;
              e.preventDefault();
              const t = e.touches[0];
              if (!t) return;
              const ctx = ctxRef.current;
              const canvas = canvasRef.current;
              if (!ctx || !canvas) return;
              const rect = canvas.getBoundingClientRect();
              const p = { x: t.clientX - rect.left, y: t.clientY - rect.top };
              ctx.lineTo(p.x, p.y);
              ctx.stroke();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              drawingRef.current = false;
            }}
            onContextMenu={(e) => e.preventDefault()}
            style={{ touchAction: "none", pointerEvents: "auto" }}
          />

          <div className="flex gap-3">
            <Button variant="outline" onClick={clearCanvas}>
              Limpiar canvas
            </Button>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                saveSignature();
                setModalOpen(false);
              }}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
