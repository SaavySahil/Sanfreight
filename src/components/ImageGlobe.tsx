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
    markerX: "60.5%",
    markerY: "69%",
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
    markerX: "73.5%",
    markerY: "59%",
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
    markerX: "43.5%",
    markerY: "42.5%",
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
    markerX: "43%",
    markerY: "63.5%",
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
    markerX: "55.5%",
    markerY: "51%",
    label: "Show Kabul office",
  },
} as const;

type OfficeKey = keyof typeof offices;

export default function ImageGlobe() {
  const [mount, setMount] = useState<HTMLElement | null>(null);
  const [active, setActive] = useState<OfficeKey | null>(null);
  const [pinned, setPinned] = useState(false);
  const [changing, setChanging] = useState(false);

  const activeRef = useRef(active);
  const pinnedRef = useRef(pinned);
  const swapTimerRef = useRef<number | null>(null);
  const closeTimerRef = useRef<number | null>(null);

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

  const closeOffice = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
    setActive(null);
    setPinned(false);
    setChanging(false);
  };

  const scheduleClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    if (!pinnedRef.current) {
      closeTimerRef.current = window.setTimeout(closeOffice, 220);
    }
  };

  const renderOffice = (key: OfficeKey) => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    const isChanging = activeRef.current !== null && key !== activeRef.current;
    if (isChanging) {
      setChanging(true);
    }
    setActive(key);

    if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
    swapTimerRef.current = window.setTimeout(
      () => {
        setChanging(false);
      },
      isChanging ? 180 : 0
    );
  };

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
    <main className="sf-v8-network-map" aria-labelledby="sf-v8-network-title">
      <header className="sf-v8-network-heading">
        <p>
          <span /> Global network
        </p>
        <h2 id="sf-v8-network-title">Where we operate</h2>
      </header>

      <div className="sf-v8-globe-stage" onClick={closeOffice}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/sanfreight-earth.jpg"
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
              style={{ "--x": o.markerX, "--y": o.markerY } as React.CSSProperties}
              data-office={key}
              aria-label={o.label}
              aria-controls="sf-v8-office-card"
              aria-expanded={isSelected}
              onPointerEnter={() => {
                if (!pinnedRef.current) renderOffice(key);
              }}
              onPointerLeave={scheduleClose}
              onFocus={() => renderOffice(key)}
              onBlur={() => setTimeout(scheduleClose, 0)}
              onClick={(e) => {
                e.stopPropagation();
                if (activeRef.current === key && pinnedRef.current) {
                  closeOffice();
                } else {
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
            id="sf-v8-office-card"
            className={`sf-v8-office-card ${active ? "is-open" : ""} ${changing ? "is-changing" : ""}`}
            style={
              {
                "--card-x": activeData.cardX,
                "--card-y": activeData.cardY,
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

      <footer className="sf-v8-network-legend">
        <p>
          <span className="sf-v8-legend-head" /> Head office
        </p>
        <p>
          <span className="sf-v8-legend-office" /> International office
        </p>
        <p>
          <span className="sf-v8-legend-reach" /> Network reach
        </p>
      </footer>
      <p className="sf-v8-network-count">
        <span>{activeData ? activeData.count : "05"}</span> {activeData ? "/ 05 offices" : "offices"}
      </p>
    </main>,
    mount
  );
}
