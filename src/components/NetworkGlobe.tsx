"use client";

import createGlobe from "cobe";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const origin: [number, number] = [19.033, 73.0297];
const offices = [
  {
    country: "China",
    city: "Ningbo office",
    coordinate: "29.8683° N · 121.5440° E",
    description: "Floor 12 'A', Lvyuan Tower No 588, Changhai Road, Ningbo City, China.",
    location: [29.8683, 121.544] as [number, number],
    image: "/images/expertises-ocean-freight.webp",
  },
  {
    country: "United Kingdom",
    city: "Dartford office",
    coordinate: "51.4432° N · 0.1785° E",
    description: "84 Alcock Crescent, Crayford DA1 4FR, Dartford, United Kingdom.",
    location: [51.4432, 0.1785] as [number, number],
    image: "/images/expertises-warehousing.webp",
  },
  {
    country: "UAE",
    city: "Bur Dubai office",
    coordinate: "25.2582° N · 55.3047° E",
    description: "Flat No: 01 Al kaber, Bur Dubai, P.O. Box: 45214, Dubai, U.A.E.",
    location: [25.2582, 55.3047] as [number, number],
    image: "/images/expertises-air-freight.webp",
  },
  {
    country: "Afghanistan",
    city: "Kabul office",
    coordinate: "34.5553° N · 69.2075° E",
    description: "Lane Two, Haji Yaqoub Square, Shahr-e-Naw, Kabul, Afghanistan.",
    location: [34.5553, 69.2075] as [number, number],
    image: "/images/expertises-specialized.webp",
  },
];

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const zoomLimits = () => {
  const isMobile = typeof window !== "undefined" && window.innerWidth <= 760;
  return isMobile ? { min: 0.7, max: 0.96 } : { min: 0.78, max: 1.06 };
};

const fitZoom = (target: number) => {
  const limits = zoomLimits();
  return clamp(target, limits.min, limits.max);
};

const overviewZoom = () => (typeof window !== "undefined" && window.innerWidth <= 760 ? 0.74 : 0.86);
const routeZoom = () => (typeof window !== "undefined" && window.innerWidth <= 760 ? 0.92 : 1.02);

const vector = ([lat, lng]: [number, number]) => {
  const r = (lat * Math.PI) / 180;
  const a = (lng * Math.PI) / 180 - Math.PI;
  const c = Math.cos(r);
  return [-c * Math.cos(a), Math.sin(r), c * Math.sin(a)] as const;
};

const bestPhi = (location: [number, number], theta: number) => {
  const p = vector(location);
  let best = 0;
  let score = -Infinity;
  for (let i = 0; i < 720; i++) {
    const phi = (i / 720) * Math.PI * 2;
    const next =
      -Math.sin(phi) * Math.cos(theta) * p[0] +
      Math.sin(theta) * p[1] +
      Math.cos(phi) * Math.cos(theta) * p[2];
    if (next > score) {
      score = next;
      best = phi;
    }
  }
  return best;
};

const shortestRotation = (a: number, b: number) => {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
};

export default function NetworkGlobe() {
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [active, setActive] = useState(-1);
  const [drawer, setDrawer] = useState<"closed" | "summary" | "detail">("closed");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLElement>(null);
  const markerRefs = useRef<(HTMLElement | null)[]>([]);
  const railRef = useRef<HTMLElement>(null);
  const activeRef = useRef(active);

  const state = useRef({
    phi: 0,
    targetPhi: 0,
    theta: 0.58,
    targetTheta: 0.58,
    scale: 0.86,
    targetScale: 0.86,
    velocity: 0,
    route: 0,
    pointer: null as null | {
      id: number;
      x: number;
      y: number;
      time: number;
      velocity: number;
      moved: boolean;
    },
    timer: 0,
  });

  const updateRailIndicator = () => {
    const button = railRef.current?.querySelector<HTMLElement>("button.is-active");
    if (button && railRef.current) {
      railRef.current.style.setProperty("--rail-x", `${button.offsetLeft}px`);
      railRef.current.style.setProperty("--rail-width", `${button.offsetWidth}px`);
    }
  };

  const setZoomTarget = (target: number) => {
    state.current.targetScale = fitZoom(target);
  };

  useEffect(() => {
    const el = document.getElementById("sf-network-explorer-root");
    if (el) {
      queueMicrotask(() => setMount(el));
    }
  }, []);

  useEffect(() => {
    if (!mount) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          mount.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold: 0.08 }
    );
    observer.observe(mount);
    return () => observer.disconnect();
  }, [mount]);

  useEffect(() => {
    activeRef.current = active;
    const s = state.current;
    clearTimeout(s.timer);
    s.velocity = 0;
    s.route = 0;
    if (active < 0) {
      s.targetTheta = active === -2 ? 0.18 : 0.58;
      s.targetPhi = bestPhi(active === -2 ? origin : [32, 66], s.targetTheta);
      s.targetScale = fitZoom(active === -2 ? routeZoom() : overviewZoom());
      queueMicrotask(() => {
        setDrawer("closed");
      });
    } else {
      const office = offices[active];
      s.targetTheta = clamp(office.location[0] / 180, 0.08, 0.24);
      s.targetPhi = bestPhi(
        [(origin[0] + office.location[0]) / 2, (origin[1] + office.location[1]) / 2],
        s.targetTheta
      );
      s.targetScale = fitZoom(routeZoom());
      queueMicrotask(() => {
        setDrawer("closed");
      });
      s.timer = window.setTimeout(
        () => {
          setDrawer("summary");
        },
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 820
      );
    }
    requestAnimationFrame(updateRailIndicator);
    return () => clearTimeout(s.timer);
  }, [active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const plane = planeRef.current;
    const stage = stageRef.current;
    if (!canvas || !plane || !stage) return;

    const s = state.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    s.targetPhi = s.phi = bestPhi([32, 66], s.theta);

    let size = Math.max(1, plane.clientWidth);
    let left = 0;
    let top = 0;
    let visible = true;
    let raf = 0;

    const geometry = () => {
      size = Math.max(1, plane.clientWidth);
      s.scale = fitZoom(s.scale);
      s.targetScale = fitZoom(s.targetScale);
      const a = stage.getBoundingClientRect();
      const b = plane.getBoundingClientRect();
      left = b.left - a.left;
      top = b.top - a.top;
      updateRailIndicator();
    };

    geometry();

    const globe = createGlobe(canvas, {
      devicePixelRatio: Math.min(window.devicePixelRatio || 1, 2),
      width: size,
      height: size,
      phi: s.phi,
      theta: s.theta,
      scale: s.scale,
      dark: 0,
      diffuse: 1.08,
      mapSamples: 30000,
      mapBrightness: 2.4,
      baseColor: [0.13, 0.11, 0.24],
      markerColor: [1, 0.8, 0],
      glowColor: [0.93, 0.94, 0.97],
      arcColor: [1, 0.8, 0],
      arcWidth: 0.48,
      arcHeight: 0.14,
      markerElevation: 0.035,
      markers: [],
      arcs: [],
    });

    const resize = new ResizeObserver(geometry);
    resize.observe(stage);

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    observer.observe(stage);

    let previous = performance.now();

    const render = (time: number) => {
      raf = requestAnimationFrame(render);
      if (!visible) {
        previous = time;
        return;
      }
      const dt = Math.min(40, time - previous);
      previous = time;

      if (!s.pointer && Math.abs(s.velocity) > 0.00001) {
        s.targetPhi += s.velocity * dt;
        s.velocity *= Math.exp(-dt / 430);
      }

      const currentActive = activeRef.current;
      if (currentActive >= 0) {
        s.route = Math.min(1, s.route + dt / 760);
      }

      if (reduced) {
        s.phi = s.targetPhi;
        s.theta = s.targetTheta;
        s.scale = s.targetScale;
      } else {
        const f = 1 - Math.exp(-dt / (s.pointer ? 48 : 245));
        s.phi += shortestRotation(s.phi, s.targetPhi) * f;
        s.theta += (s.targetTheta - s.theta) * f;
        s.scale += (s.targetScale - s.scale) * f;
      }

      const selected = offices[currentActive];
      const markers = [
        { location: origin, size: 0.024, color: [1, 0.8, 0] as [number, number, number] },
        ...offices.map((o, i) => ({
          location: o.location,
          size: i === currentActive ? 0.025 : 0.011,
          color: (i === currentActive ? [1, 0.8, 0] : [0.53, 0.52, 0.6]) as [number, number, number],
        })),
      ];

      const t = s.route * s.route * (3 - 2 * s.route);
      const arcs = selected
        ? [
            {
              from: origin,
              to: [
                origin[0] + (selected.location[0] - origin[0]) * t,
                origin[1] + (selected.location[1] - origin[1]) * t,
              ] as [number, number],
              color: [1, 0.8, 0] as [number, number, number],
            },
          ]
        : [];

      globe.update({
        width: size,
        height: size,
        phi: s.phi,
        theta: s.theta,
        scale: s.scale,
        markers,
        arcs,
      });

      [...offices.map((o) => o.location), origin].forEach((loc, i) => {
        const el = markerRefs.current[i];
        if (!el) return;
        const [x, y, z] = vector(loc);
        const cp = Math.cos(s.phi);
        const sp = Math.sin(s.phi);
        const ct = Math.cos(s.theta);
        const st = Math.sin(s.theta);
        const h = cp * x + sp * z;
        const v = sp * st * x + ct * y - cp * st * z;
        const d = -sp * ct * x + st * y + cp * ct * z;
        el.style.transform = `translate3d(${left + ((h * s.scale + 1) / 2) * size}px,${top + ((-v * s.scale + 1) / 2) * size}px,0) translate(-50%,-50%)`;
        el.classList.toggle("is-behind", d < -0.02);
      });
    };

    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      observer.disconnect();
      globe.destroy();
    };
  }, [mount]);

  const down = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const s = state.current;
    s.velocity = 0;
    s.pointer = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      time: performance.now(),
      velocity: 0,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const move = (e: React.PointerEvent) => {
    const s = state.current;
    const p = s.pointer;
    if (!p || p.id !== e.pointerId) return;
    const now = performance.now();
    const dx = e.clientX - p.x;
    const dy = e.clientY - p.y;
    if (!p.moved && Math.hypot(dx, dy) > 7) {
      p.moved = true;
      setDrawer("closed");
    }
    s.targetPhi += dx / 210;
    s.targetTheta = clamp(s.targetTheta - dy / 540, -0.28, 0.48);
    p.velocity = dx / 210 / Math.max(8, now - p.time);
    p.x = e.clientX;
    p.y = e.clientY;
    p.time = now;
  };

  const up = (e: React.PointerEvent) => {
    const s = state.current;
    const p = s.pointer;
    if (!p || p.id !== e.pointerId) return;
    s.velocity = clamp(p.velocity, -0.006, 0.006);
    s.pointer = null;
  };

  if (!mount) return null;
  const office = offices[Math.max(0, active)];

  return createPortal(
    <div className={`sf-network-explorer ${drawer !== "closed" ? "drawer-open" : ""}`}>
      <header className="sf-network-intro">
        <div>
          <h2>One network.<br />Every handover.</h2>
        </div>
        <p className="sf-network-intro__lead">From Navi Mumbai to China, the United Kingdom, the UAE and Afghanistan, local teams keep every critical movement connected.</p>
      </header>
      <section className="sf-map-stage" ref={stageRef} aria-label="Interactive SanFreight office network">
        <div className="sf-globe-plane" ref={planeRef}>
          <canvas
            ref={canvasRef}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            aria-label="Interactive globe showing SanFreight trade lanes"
          />
        </div>

        <div className="sf-location-markers" aria-label="Office locations">
          {offices.map((o, i) => (
            <button
              key={o.country}
              ref={(el) => {
                markerRefs.current[i] = el;
              }}
              className={`sf-map-marker ${active === i ? "is-active" : ""}`}
              onClick={() => (active === i ? setDrawer("detail") : setActive(i))}
              aria-label={`Open ${o.country}, ${o.city}`}
            >
              <span>{String(i + 1).padStart(2, "0")}</span>
            </button>
          ))}
          <div
            ref={(el) => {
              markerRefs.current[4] = el;
            }}
            className="sf-origin-marker"
            aria-hidden="true"
          >
            <span>IN</span>
            <small>Origin</small>
          </div>
        </div>

        <div className="sf-zoom-controls" aria-label="Globe zoom controls">
          <button
            onClick={() => setZoomTarget(state.current.targetScale + 0.06)}
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            onClick={() => setZoomTarget(state.current.targetScale - 0.06)}
            aria-label="Zoom out"
          >
            −
          </button>
        </div>

        <button
          className={`sf-detail-close ${drawer === "detail" ? "is-visible" : ""}`}
          onClick={() => setDrawer("closed")}
          aria-label="Close office detail"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          </svg>
        </button>

        <button
          className={`sf-drawer-back ${drawer === "detail" ? "is-visible" : ""}`}
          onClick={() => setDrawer("summary")}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m14 6-6 6 6 6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Return to route overview
        </button>

        <nav ref={railRef} className="sf-destination-rail" role="tablist" aria-label="Choose a destination">
          <span className="sf-destination-indicator" aria-hidden="true" />
          {["All", "India", ...offices.map((o) => o.country)].map((label, i) => {
            const tabValue = i === 0 ? -1 : i === 1 ? -2 : i - 2;
            const isSelected = active === tabValue;
            return (
              <button
                key={label}
                className={isSelected ? "is-active" : ""}
                role="tab"
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                onClick={() => setActive(tabValue)}
                onKeyDown={(e) => {
                  if (["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) {
                    e.preventDefault();
                    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
                    const next = (i + d + 6) % 6;
                    setActive(next === 0 ? -1 : next === 1 ? -2 : next - 2);
                  }
                }}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <aside className={`sf-information-drawer ${drawer !== "closed" ? "is-open" : ""}`} aria-live="polite" aria-hidden={drawer === "closed"}>
          <div className="sf-drawer-view sf-drawer-summary-view" aria-hidden={drawer !== "summary"}>
            <div className="sf-drawer-summary">
              <p className="sf-drawer-eyebrow">Selected trade lane</p>
              <h2><span>1</span> office on this route</h2>
              <button onClick={() => setDrawer("detail")}>Select the office to learn more</button>
            </div>
            <button className="sf-drawer-office" onClick={() => setDrawer("detail")}>
              <span>India → {office.country}</span>
              <strong>{office.city}</strong>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="sf-drawer-view sf-drawer-detail-view" aria-hidden={drawer !== "detail"}>
            <figure>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={office.image} alt={`${office.country} freight operations`} />
            </figure>
            <div className="sf-detail-copy">
              <p>{office.country} · {String(active + 1).padStart(2, "0")}</p>
              <h2>{office.city}</h2>
              <p>{office.description}</p>
            </div>
            <div className="sf-detail-meta">
              <span>{office.coordinate}</span>
              <Link href="/en/#contact" className="cta-custom sf-office-cta" aria-label={`Contact SanFreight about ${office.city}`}>
                <span className="cta-custom-content"><span className="cta-custom-wrapper"><span className="text">Explore office</span><span className="cta-custom-arrows-wrapper"><span className="icon icon-arrow-right" /><span className="icon icon-arrow-right absolute" /></span></span></span>
              </Link>
            </div>
          </div>
        </aside>

      </section>
    </div>,
    mount
  );
}
