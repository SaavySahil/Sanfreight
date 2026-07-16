"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";

// SanFreight's 5 real offices (from the footer/contact addresses).
// India (Navi Mumbai) is the head office and hub for the trade-lane arcs.
const HQ: [number, number] = [19.033, 73.0297];
const MARKERS: { location: [number, number]; size: number }[] = [
  { location: HQ, size: 0.09 }, // India — Navi Mumbai (Head Office)
  { location: [29.8683, 121.544], size: 0.06 }, // China — Ningbo
  { location: [51.4432, 0.1785], size: 0.06 }, // UK — Dartford
  { location: [25.2582, 55.3047], size: 0.06 }, // Dubai — Bur Dubai
  { location: [34.5553, 69.2075], size: 0.06 }, // Afghanistan — Kabul
];
const ARCS = MARKERS.slice(1).map((marker) => ({ from: HQ, to: marker.location }));

export default function NetworkGlobe() {
  const phiRef = useRef(0);
  const widthRef = useRef(0);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);

  useEffect(() => {
    const canvas = document.getElementById(
      "sf-network-globe-canvas"
    ) as HTMLCanvasElement | null;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const onResize = () => {
      widthRef.current = canvas.offsetWidth;
    };
    window.addEventListener("resize", onResize);
    onResize();

    // Only render while the globe is actually on screen — an unthrottled
    // WebGL loop left running behind other content burns GPU/battery for
    // nothing, and on slower/software-rendered hardware can make the whole
    // page janky.
    let isVisible = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    const globe = createGlobe(canvas, {
      devicePixelRatio: 2,
      width: widthRef.current * 2,
      height: widthRef.current * 2,
      phi: 0,
      theta: 0.32,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.4, 0.42, 0.54],
      markerColor: [1, 0.8, 0],
      glowColor: [0.18, 0.16, 0.33],
      arcColor: [1, 0.85, 0.35],
      arcWidth: 1,
      arcHeight: 0.25,
      markers: MARKERS,
      arcs: ARCS,
    });

    // cobe@2 has no onRender callback — it renders once per update() call,
    // so we drive our own rAF loop, throttled to ~30fps. This also fixes an
    // otherwise-permanent black globe: the map's texture image loads
    // asynchronously, and the very first (synchronous) render happens
    // before it's ready, painting a 1x1 black placeholder that would never
    // be repainted without a follow-up render.
    let raf = 0;
    let lastFrameTime = 0;
    const frameInterval = 1000 / 30;
    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      if (!isVisible || now - lastFrameTime < frameInterval) return;
      lastFrameTime = now;
      if (!prefersReducedMotion && pointerInteracting.current === null) {
        phiRef.current += 0.006;
      }
      globe.update({
        phi: phiRef.current + pointerInteractionMovement.current,
        width: widthRef.current * 2,
        height: widthRef.current * 2,
      });
    };
    raf = requestAnimationFrame(render);

    requestAnimationFrame(() => {
      canvas.style.opacity = "1";
    });

    const onPointerDown = (e: PointerEvent) => {
      pointerInteracting.current = e.clientX - pointerInteractionMovement.current * 200;
      canvas.style.cursor = "grabbing";
    };
    const onPointerRelease = () => {
      pointerInteracting.current = null;
      canvas.style.cursor = "grab";
    };
    const onPointerMove = (e: PointerEvent) => {
      if (pointerInteracting.current === null) return;
      const delta = e.clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta / 200;
    };

    canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerRelease);
    window.addEventListener("pointercancel", onPointerRelease);
    window.addEventListener("pointermove", onPointerMove);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      globe.destroy();
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerRelease);
      window.removeEventListener("pointercancel", onPointerRelease);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return null;
}
