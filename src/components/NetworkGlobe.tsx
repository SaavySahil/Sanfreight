"use client";

import { useEffect, useRef } from "react";
import createGlobe from "cobe";

// SanFreight's 5 real offices (from the footer/contact addresses).
// India (Navi Mumbai) is the head office and hub for the trade-lane arcs.
type Office = {
  id: string;
  location: [number, number];
  size: number;
  timeZone: string;
};

const HQ_ID = "india";
const OFFICES: Office[] = [
  { id: "india", location: [19.033, 73.0297], size: 0.09, timeZone: "Asia/Kolkata" },
  { id: "china", location: [29.8683, 121.544], size: 0.06, timeZone: "Asia/Shanghai" },
  { id: "uk", location: [51.4432, 0.1785], size: 0.06, timeZone: "Europe/London" },
  { id: "dubai", location: [25.2582, 55.3047], size: 0.06, timeZone: "Asia/Dubai" },
  { id: "afghanistan", location: [34.5553, 69.2075], size: 0.06, timeZone: "Asia/Kabul" },
];
const HQ = OFFICES.find((o) => o.id === HQ_ID)!;

const BASE_MARKER_COLOR: [number, number, number] = [1, 0.8, 0];
const ACTIVE_MARKER_COLOR: [number, number, number] = [1, 0.95, 0.5];
const BASE_ARC_COLOR: [number, number, number] = [0.6, 0.52, 0.22];
const ACTIVE_ARC_COLOR: [number, number, number] = [1, 0.85, 0.35];

// Cobe's exact object-space projection for a [lat, lng] marker (reverse
// engineered from its compiled source: the U()/O() functions in
// node_modules/cobe/dist/index.esm.js). Used to numerically find the phi
// that centers a given location, and to detect which marker currently
// faces the camera — Cobe itself exposes neither.
function toVec3([lat, lng]: [number, number]): [number, number, number] {
  const r = (lat * Math.PI) / 180;
  const a = (lng * Math.PI) / 180 - Math.PI;
  const o = Math.cos(r);
  return [-o * Math.cos(a), Math.sin(r), o * Math.sin(a)];
}
function facing(v: [number, number, number], phi: number, theta: number): number {
  const r = Math.cos(phi);
  const a = Math.cos(theta);
  const o = Math.sin(phi);
  const i = Math.sin(theta);
  return -i * r * v[0] + o * v[1] + a * r * v[2];
}
function bestPhiFor(targets: [number, number, number][], theta: number): number {
  let bestPhi = 0;
  let bestScore = -Infinity;
  const steps = 360;
  for (let s = 0; s < steps; s++) {
    const phi = (s / steps) * Math.PI * 2;
    let score = 0;
    for (const v of targets) score += facing(v, phi, theta);
    if (score > bestScore) {
      bestScore = score;
      bestPhi = phi;
    }
  }
  return bestPhi;
}
function shortestDelta(from: number, to: number): number {
  const twoPi = Math.PI * 2;
  let d = (to - from) % twoPi;
  if (d > Math.PI) d -= twoPi;
  if (d < -Math.PI) d += twoPi;
  return d;
}

const THETA = 0.32;
const officeVecs = new Map(OFFICES.map((o) => [o.id, toVec3(o.location)]));

export default function NetworkGlobe() {
  const phiRef = useRef(0);
  const targetPhiRef = useRef<number | null>(null);
  const widthRef = useRef(0);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const hoveredIdRef = useRef<string | null>(null);

  useEffect(() => {
    const canvas = document.getElementById(
      "sf-network-globe-canvas"
    ) as HTMLCanvasElement | null;
    if (!canvas) return;

    const legendItems = Array.from(
      document.querySelectorAll<HTMLElement>(".network-globe-legend-item[data-location]")
    );
    const legendById = new Map(legendItems.map((el) => [el.dataset.location!, el]));

    // Live local time per office — updates the .legend-time subtext so the
    // directory reads as a live network status board, not a static list.
    const timeFormatters = new Map(
      OFFICES.map((o) => [
        o.id,
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: o.timeZone,
        }),
      ])
    );
    const updateClocks = () => {
      for (const office of OFFICES) {
        const el = legendById.get(office.id)?.querySelector(".legend-time");
        if (el) el.textContent = timeFormatters.get(office.id)!.format(new Date());
      }
    };
    updateClocks();
    const clockInterval = setInterval(updateClocks, 30000);

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
      theta: THETA,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.4, 0.42, 0.54],
      markerColor: BASE_MARKER_COLOR,
      glowColor: [0.18, 0.16, 0.33],
      arcColor: BASE_ARC_COLOR,
      arcWidth: 1,
      arcHeight: 0.25,
      markers: OFFICES.map((o) => ({ location: o.location, size: o.size })),
      arcs: OFFICES.filter((o) => o.id !== HQ_ID).map((o) => ({
        from: HQ.location,
        to: o.location,
      })),
    });

    let lastActiveId: string | null = null;
    const setActiveLegendItem = (id: string | null) => {
      if (id === lastActiveId) return;
      if (lastActiveId) legendById.get(lastActiveId)?.classList.remove("is-active");
      if (id) legendById.get(id)?.classList.add("is-active");
      lastActiveId = id;
    };

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

      const hoveredId = hoveredIdRef.current;
      const dragging = pointerInteracting.current !== null;

      if (targetPhiRef.current !== null) {
        // Ease toward a hovered location's centering phi.
        const delta = shortestDelta(phiRef.current, targetPhiRef.current);
        phiRef.current += delta * 0.08;
        if (Math.abs(delta) < 0.002) targetPhiRef.current = null;
      } else if (!prefersReducedMotion && !dragging && !hoveredId) {
        phiRef.current += 0.006;
      }

      // Reverse sync: whichever marker currently faces the camera gets
      // highlighted in the list, whether the globe is auto-rotating or
      // being dragged by hand.
      if (!hoveredId) {
        const currentPhi = phiRef.current + pointerInteractionMovement.current;
        let bestId: string | null = null;
        let bestScore = -Infinity;
        for (const office of OFFICES) {
          const score = facing(officeVecs.get(office.id)!, currentPhi, THETA);
          if (score > bestScore) {
            bestScore = score;
            bestId = office.id;
          }
        }
        setActiveLegendItem(bestScore > 0.55 ? bestId : null);
      }

      const activeId = hoveredId ?? lastActiveId;
      globe.update({
        phi: phiRef.current + pointerInteractionMovement.current,
        width: widthRef.current * 2,
        height: widthRef.current * 2,
        markers: OFFICES.map((o) => ({
          location: o.location,
          size: o.size,
          color: o.id === activeId ? ACTIVE_MARKER_COLOR : undefined,
        })),
        arcs: OFFICES.filter((o) => o.id !== HQ_ID).map((o) => ({
          from: HQ.location,
          to: o.location,
          color: o.id === activeId ? ACTIVE_ARC_COLOR : BASE_ARC_COLOR,
        })),
      });
    };
    raf = requestAnimationFrame(render);

    requestAnimationFrame(() => {
      canvas.style.opacity = "1";
    });

    const onLegendEnter = (id: string) => {
      hoveredIdRef.current = id;
      setActiveLegendItem(id);
      const targets =
        id === HQ_ID
          ? [officeVecs.get(HQ_ID)!]
          : [officeVecs.get(HQ_ID)!, officeVecs.get(id)!];
      targetPhiRef.current = bestPhiFor(targets, THETA);
    };
    const onLegendLeave = () => {
      hoveredIdRef.current = null;
    };
    const legendHandlers: Array<[HTMLElement, () => void, () => void]> = [];
    for (const [id, el] of legendById) {
      const enter = () => onLegendEnter(id);
      el.addEventListener("mouseenter", enter);
      el.addEventListener("focus", enter);
      el.addEventListener("mouseleave", onLegendLeave);
      el.addEventListener("blur", onLegendLeave);
      legendHandlers.push([el, enter, onLegendLeave]);
    }

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
      clearInterval(clockInterval);
      observer.disconnect();
      globe.destroy();
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerRelease);
      window.removeEventListener("pointercancel", onPointerRelease);
      window.removeEventListener("pointermove", onPointerMove);
      for (const [el, enter, leave] of legendHandlers) {
        el.removeEventListener("mouseenter", enter);
        el.removeEventListener("focus", enter);
        el.removeEventListener("mouseleave", leave);
        el.removeEventListener("blur", leave);
      }
    };
  }, []);

  return null;
}
