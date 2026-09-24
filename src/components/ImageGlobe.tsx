"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const offices = {
  india: {
    type: "Head office",
    country: "India",
    city: "Navi Mumbai",
    copy: "The operating centre coordinating Sanfreight’s international network and critical handovers.",
    code: "IN / BOM",
    time: "GMT +5:30",
    count: "01",
    cardX: "63%",
    cardY: "57%",
    markerX: .575,
    markerY: .675,
    label: "Show Navi Mumbai head office",
  },
  china: {
    type: "International office",
    country: "China",
    city: "Ningbo",
    copy: "Local origin coordination and direct access to one of Asia’s most important port regions.",
    code: "CN / NGB",
    time: "GMT +8",
    count: "02",
    cardX: "48%",
    cardY: "54%",
    markerX: .699,
    markerY: .489,
    label: "Show Ningbo office",
  },
  uk: {
    type: "International office",
    country: "United Kingdom",
    city: "Dartford",
    copy: "European coordination for time-sensitive freight entering and leaving the United Kingdom.",
    code: "GB / DRT",
    time: "GMT +1",
    count: "03",
    cardX: "47%",
    cardY: "31%",
    markerX: .29,
    markerY: .51,
    label: "Show Dartford office",
  },
  uae: {
    type: "International office",
    country: "UAE",
    city: "Bur Dubai",
    copy: "A regional handover point connecting Gulf trade lanes with the wider Sanfreight network.",
    code: "AE / DXB",
    time: "GMT +4",
    count: "04",
    cardX: "47%",
    cardY: "56%",
    markerX: .335,
    markerY: .625,
    label: "Show Bur Dubai office",
  },
  afghanistan: {
    type: "International office",
    country: "Afghanistan",
    city: "Kabul",
    copy: "On-ground coordination for complex movements requiring close local oversight.",
    code: "AF / KBL",
    time: "GMT +4:30",
    count: "05",
    cardX: "59%",
    cardY: "39%",
    markerX: .47,
    markerY: .545,
    label: "Show Kabul office",
  },
} as const;

type OfficeKey = keyof typeof offices;

export default function ImageGlobe() {
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [active, setActive] = useState<OfficeKey | null>(null);
  const [pinned, setPinned] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [cardPosition, setCardPosition] = useState({ x: "63%", y: "57%" });

  const activeRef = useRef(active);
  const pinnedRef = useRef(pinned);
  const closeTimerRef = useRef<number | null>(null);
  const initialOpenedRef = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const cardRef = useRef<HTMLElement>(null);

  const positionCardBesideMarker = (key: OfficeKey) => {
    if (!stageRef.current || window.matchMedia("(max-width: 900px)").matches) return;
    const marker = stageRef.current.querySelector<HTMLElement>(`[data-office="${key}"]`);
    if (!marker) return;
    const stageRect = stageRef.current.getBoundingClientRect();
    const markerRect = marker.getBoundingClientRect();
    const cardWidth = cardRef.current?.offsetWidth || 328;
    const cardHeight = cardRef.current?.offsetHeight || 230;
    const x = Math.min(markerRect.right - stageRect.left + 16, stageRect.width - cardWidth - 24);
    const y = Math.max(90, Math.min(markerRect.top - stageRect.top + markerRect.height / 2 - cardHeight / 2, stageRect.height - cardHeight - 28));
    setCardPosition({ x: `${x}px`, y: `${y}px` });
  };

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    pinnedRef.current = pinned;
  }, [pinned]);

  useEffect(() => {
    const el = document.getElementById("sf-image-globe-root");
    if (el) {
      queueMicrotask(() => setMount(el));
    }
  }, []);

  useEffect(() => {
    if (!mount || !stageRef.current || !imageRef.current) return;
    const stage = stageRef.current;
    const image = imageRef.current;
    const positionMarkers = () => {
      const stageRect = stage.getBoundingClientRect();
      const imageRect = image.getBoundingClientRect();
      stage.querySelectorAll<HTMLElement>(".sf-v8-office-marker").forEach((marker) => {
        const office = offices[marker.dataset.office as OfficeKey];
        if (!office) return;
        marker.style.setProperty("--x", `${imageRect.left - stageRect.left + imageRect.width * office.markerX}px`);
        marker.style.setProperty("--y", `${imageRect.top - stageRect.top + imageRect.height * office.markerY}px`);
      });
      if (activeRef.current) requestAnimationFrame(() => positionCardBesideMarker(activeRef.current as OfficeKey));
    };
    const observer = new ResizeObserver(positionMarkers);
    observer.observe(stage);
    image.addEventListener("load", positionMarkers);
    window.addEventListener("resize", positionMarkers);
    positionMarkers();
    return () => {
      observer.disconnect();
      image.removeEventListener("load", positionMarkers);
      window.removeEventListener("resize", positionMarkers);
    };
  }, [mount]);

  const closeOffice = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    activeRef.current = null;
    pinnedRef.current = false;
    setActive(null);
    setPinned(false);
  };

  const scheduleClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (!pinnedRef.current) {
      closeTimerRef.current = window.setTimeout(closeOffice, 220);
    }
  };

  const renderOffice = (key: OfficeKey) => {
    initialOpenedRef.current = true;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setActive(key);
    activeRef.current = key;
    positionCardBesideMarker(key);
  };

  useEffect(() => {
    if (!mount) return;
    const section = mount.querySelector(".sf-v8-network-map");
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setRevealed(true);
        if (!initialOpenedRef.current) renderOffice("india");
        observer.disconnect();
      }
    }, { threshold: 0.3 });
    observer.observe(section);
    return () => observer.disconnect();
  }, [mount]);

  useEffect(() => {
    if (!active || !cardRef.current || !window.matchMedia("(max-width: 900px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const animation = cardRef.current.animate(
      [{ opacity: 0, transform: "translate3d(0, 14px, 0)" }, { opacity: 1, transform: "translate3d(0, 0, 0)" }],
      { duration: 280, easing: "cubic-bezier(.165,.84,.44,1)" }
    );
    return () => animation.cancel();
  }, [active]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeOffice();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!mount) return null;
  const activeData = active ? offices[active] : null;

  return createPortal(
    <section className="sf-v8-network-map" data-headercolor="light-transparent" aria-labelledby="sf-v8-network-title">
      <header className="sf-v8-network-heading">
        <h2 id="sf-v8-network-title" className={revealed ? "is-revealed" : ""}>Where we operate</h2>
      </header>

      <div className="sf-v8-globe-stage" ref={stageRef} onClick={closeOffice}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/sanfreight-earth.jpg"
          ref={imageRef}
          alt="Earth viewed over Asia, the Middle East and Europe"
          draggable={false}
        />

        {(Object.keys(offices) as OfficeKey[]).map((key) => {
          const o = offices[key];
          const isSelected = active === key;
          return (
            <button
              key={key}
              type="button"
              className={`sf-v8-office-marker ${isSelected ? "is-active" : ""}`}
              style={{ "--x": "-100px", "--y": "-100px" } as React.CSSProperties}
              data-office={key}
              aria-label={o.label}
              aria-controls="sf-v8-office-card"
              aria-expanded={isSelected}
              onPointerEnter={(event) => {
                if (event.pointerType !== "mouse") return;
                pinnedRef.current = true;
                setPinned(true);
                renderOffice(key);
              }}
              onPointerLeave={scheduleClose}
              onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) renderOffice(key); }}
              onBlur={() => setTimeout(scheduleClose, 0)}
              onClick={(e) => {
                e.stopPropagation();
                if (activeRef.current === key && pinnedRef.current) {
                  closeOffice();
                } else {
                  pinnedRef.current = true;
                  setPinned(true);
                  renderOffice(key);
                }
              }}
            >
              <i />
              <b />
            </button>
          );
        })}

        {activeData && (
          <article
            ref={cardRef}
            id="sf-v8-office-card"
            className="sf-v8-office-card is-open"
            style={
              {
                "--card-x": cardPosition.x,
                "--card-y": cardPosition.y,
              } as React.CSSProperties
            }
            aria-live="polite"
            aria-hidden={!active}
            onPointerEnter={() => {
              if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
            }}
            onPointerLeave={scheduleClose}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="sf-v8-office-card__close"
              type="button"
              aria-label="Close office details"
              onClick={closeOffice}
            >
              <span />
              <span />
            </button>
            <p className="sf-v8-office-card__type">{activeData.type}</p>
            <h2>{activeData.country}</h2>
            <p className="sf-v8-office-card__city">{activeData.city}</p>
            <p className="sf-v8-office-card__copy">{activeData.copy}</p>
            <div className="sf-v8-office-card__meta">
              <span>{activeData.code}</span>
              <span>{activeData.time}</span>
            </div>
          </article>
        )}
      </div>

    </section>,
    mount
  );
}
