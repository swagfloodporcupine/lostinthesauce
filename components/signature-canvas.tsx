"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export type SignatureCanvasHandle = {
  clear: () => void;
  exportPng: () => string | null;
  exportTypedPng: (fullName: string) => string | null;
};

type SignatureCanvasProps = {
  onSignatureChange: (hasSignature: boolean) => void;
};

export const SignatureCanvas = forwardRef<SignatureCanvasHandle, SignatureCanvasProps>(function SignatureCanvas({ onSignatureChange }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const hasSignatureRef = useRef(false);
  const [hasSignature, setHasSignature] = useState(false);

  useImperativeHandle(ref, () => ({
    clear() {
      const canvas = canvasRef.current;
      const context = canvas?.getContext("2d");
      if (!canvas || !context) return;
      const bounds = canvas.getBoundingClientRect();
      context.clearRect(0, 0, bounds.width, bounds.height);
      hasSignatureRef.current = false;
      setHasSignature(false);
      onSignatureChange(false);
    },
    exportPng() {
      const canvas = canvasRef.current;
      return canvas && hasSignatureRef.current ? canvas.toDataURL("image/png") : null;
    },
    exportTypedPng(fullName: string) {
      if (!fullName.trim()) return null;
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 280;
      const context = canvas.getContext("2d");
      if (!context) return null;
      context.fillStyle = "#111827";
      context.font = "italic 92px cursive";
      context.textBaseline = "middle";
      context.fillText(fullName.trim(), 48, 140, 1104);
      return canvas.toDataURL("image/png");
    },
  }), [onSignatureChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resizeCanvas() {
      const target = canvasRef.current;
      if (!target) return;
      const bounds = target.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const previous = document.createElement("canvas");
      previous.width = target.width;
      previous.height = target.height;
      const previousContext = previous.getContext("2d");
      if (previousContext && hasSignatureRef.current) previousContext.drawImage(target, 0, 0);

      const ratio = Math.max(1, window.devicePixelRatio || 1);
      target.width = Math.round(bounds.width * ratio);
      target.height = Math.round(bounds.height * ratio);
      const context = target.getContext("2d");
      if (!context) return;
      context.scale(ratio, ratio);
      context.lineWidth = 2.4;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = "#111827";
      if (previous.width && previous.height && hasSignatureRef.current) {
        context.drawImage(previous, 0, 0, previous.width, previous.height, 0, 0, bounds.width, bounds.height);
      }
    }

    resizeCanvas();
    const observer = new ResizeObserver(resizeCanvas);
    observer.observe(canvas);
    window.addEventListener("resize", resizeCanvas);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  function pointFromEvent(event: React.PointerEvent<HTMLCanvasElement>) {
    const bounds = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    drawingRef.current = true;
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    const point = pointFromEvent(event);
    context.beginPath();
    context.moveTo(point.x, point.y);
    context.lineTo(point.x + 0.01, point.y + 0.01);
    context.stroke();
    hasSignatureRef.current = true;
    setHasSignature(true);
    onSignatureChange(true);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    event.preventDefault();
    const context = event.currentTarget.getContext("2d");
    if (!context) return;
    const point = pointFromEvent(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  }

  function stopDrawing() {
    drawingRef.current = false;
  }

  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border border-neutral-300 bg-white">
        <canvas
          ref={canvasRef}
          aria-label="Draw your signature here"
          className="signature-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onLostPointerCapture={stopDrawing}
        />
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] text-neutral-500">Draw with a mouse, stylus or finger.</p>
        <button type="button" disabled={!hasSignature} onClick={() => {
          const canvas = canvasRef.current;
          const context = canvas?.getContext("2d");
          if (!canvas || !context) return;
          const bounds = canvas.getBoundingClientRect();
          context.clearRect(0, 0, bounds.width, bounds.height);
          hasSignatureRef.current = false;
          setHasSignature(false);
          onSignatureChange(false);
        }} className="text-xs font-semibold text-neutral-400 underline underline-offset-2 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-40">Clear signature</button>
      </div>
    </div>
  );
});