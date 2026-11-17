"use client";

import { useEffect, useRef } from "react";

/**
 * Decorative 3D stage that sits behind the hero copy: a perspective grid floor,
 * a floating platform under the search panel and a horizon glow. The layer
 * reacts to the pointer on precise devices and stays still for reduced motion
 * or touch input.
 */
export function HeroStage3D() {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let nextX = 0;
    let nextY = 0;

    const apply = () => {
      frame = 0;
      scene.style.setProperty("--vs-depth-x", `${nextX.toFixed(2)}px`);
      scene.style.setProperty("--vs-depth-y", `${nextY.toFixed(2)}px`);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches) return;
      nextX = (event.clientX / window.innerWidth - 0.5) * -26;
      nextY = (event.clientY / window.innerHeight - 0.5) * -16;
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={sceneRef} className="hero-3d" aria-hidden="true">
      <div className="hero-3d__glow" />
      <div className="hero-3d__floor" />
      <div className="hero-3d__stage-rim" />
      <div className="hero-3d__stage" />
    </div>
  );
}
