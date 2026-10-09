"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import styles from "./logo-carousel.module.css";

export type LogoItem = {
  src: string;
  alt: string;
  crop?: string;
};

const certificateLogos: LogoItem[] = [
  { src: "/images/certificates/1.png", alt: "Certification and membership logo 1", crop: "inset(6% 4.25% 10.25% 4.63%)" },
  { src: "/images/certificates/2.png", alt: "Certification and membership logo 2", crop: "inset(9.5% 29.88% 9.75% 29.88%)" },
  { src: "/images/certificates/3.png", alt: "Certification and membership logo 3", crop: "inset(11% 16% 9.75% 16.25%)" },
  { src: "/images/certificates/4.png", alt: "Certification and membership logo 4", crop: "inset(11% 26.63% 10.5% 27.38%)" },
  { src: "/images/certificates/5.png", alt: "Certification and membership logo 5", crop: "inset(11.25% 12.13% 9% 13.25%)" },
  { src: "/images/certificates/6.png", alt: "Certification and membership logo 6", crop: "inset(10.5% 12.75% 9.25% 12.75%)" },
  { src: "/images/certificates/7.png", alt: "Certification and membership logo 7", crop: "inset(21.25% 5.25% 18.75% 5.25%)" },
  { src: "/images/certificates/8.png", alt: "Certification and membership logo 8", crop: "inset(10.75% 30.75% 11% 30.38%)" },
  { src: "/images/certificates/9.png", alt: "Certification and membership logo 9", crop: "inset(11% 26.75% 11% 26.75%)" },
];

const initialDelay = 2500;
const slotStagger = 170;
const cycleInterval = 3000;

type Variant = "muted" | "dark" | "light";

function useSlotCount() {
  const [slotCount, setSlotCount] = useState(3);

  useEffect(() => {
    const tablet = window.matchMedia("(min-width: 768px)");
    const desktop = window.matchMedia("(min-width: 1024px)");
    const updateCount = () => setSlotCount(desktop.matches ? 3 : tablet.matches ? 2 : 1);

    updateCount();
    tablet.addEventListener("change", updateCount);
    desktop.addEventListener("change", updateCount);
    return () => {
      tablet.removeEventListener("change", updateCount);
      desktop.removeEventListener("change", updateCount);
    };
  }, []);

  return slotCount;
}

function useImagesPreloaded(sources: readonly string[]) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      sources.map(
        (src) =>
          new Promise<void>((resolve) => {
            const image = new window.Image();
            image.onload = () => resolve();
            image.onerror = () => resolve();
            image.src = src;
          }),
      ),
    ).then(() => {
      if (!cancelled) setLoaded(true);
    });

    return () => {
      cancelled = true;
    };
  }, [sources]);

  return loaded;
}

function useLogoCycle(logos: readonly LogoItem[], enabled: boolean, slotIndex: number) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!enabled || logos.length < 2) return;

    let timeout: ReturnType<typeof setTimeout> | null = null;
    let startedAt = 0;
    let remaining = step === 0 ? initialDelay + slotIndex * slotStagger : cycleInterval;

    const schedule = (delay: number) => {
      if (timeout) clearTimeout(timeout);
      remaining = delay;
      startedAt = performance.now();
      timeout = setTimeout(() => {
        timeout = null;
        setStep((current) => current + 1);
      }, delay);
    };

    const pause = () => {
      if (!timeout) return;
      clearTimeout(timeout);
      timeout = null;
      remaining = Math.max(0, remaining - (performance.now() - startedAt));
    };

    const onVisibilityChange = () => {
      if (document.hidden) pause();
      else if (!timeout) schedule(remaining);
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    if (!document.hidden) schedule(remaining);

    return () => {
      if (timeout) clearTimeout(timeout);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [enabled, logos.length, slotIndex, step]);

  return { logo: logos[step % logos.length], step };
}

const variantClass: Record<Variant, string> = {
  muted: styles.muted,
  dark: styles.dark,
  light: styles.light,
};

function LogoSlot({
  logos,
  slotIndex,
  totalLogos,
  slotCount,
  enabled,
  variant,
  reducedMotion,
}: {
  logos: readonly LogoItem[];
  slotIndex: number;
  totalLogos: number;
  slotCount: number;
  enabled: boolean;
  variant: Variant;
  reducedMotion: boolean;
}) {
  const { logo, step } = useLogoCycle(logos, enabled, slotIndex);
  const logoIndex = (slotIndex + (step % logos.length) * slotCount) % totalLogos;

  return (
    <div className={styles.slot} role="group" aria-label={logo.alt}>
      <div className={styles.slotMeta} aria-hidden="true">
        <span>MARK</span>
        <span>{String(logoIndex + 1).padStart(2, "0")} / {String(totalLogos).padStart(2, "0")}</span>
      </div>
      <div className={styles.logoWindow}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={`${slotIndex}-${logo.src}`}
            className={styles.logoMotion}
            initial={step === 0 ? false : reducedMotion ? { opacity: 0 } : { y: 16, opacity: 0, filter: "blur(6px)" }}
            animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={reducedMotion ? { opacity: 0 } : { y: -16, opacity: 0, filter: "blur(6px)" }}
            transition={{ duration: 0.48, ease: "easeInOut" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logo.src}
              alt={logo.alt}
              className={`${styles.logo} ${variantClass[variant]}`}
              loading="eager"
              decoding="async"
              style={logo.crop ? ({ objectViewBox: logo.crop } as CSSProperties) : undefined}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <span className={styles.slotAccent} aria-hidden="true" />
    </div>
  );
}

export function LogoCarousel({
  logos = certificateLogos,
  className,
  maxSlots,
  slots,
  variant = "dark",
  label = "SanFreight certificates and memberships",
  heading = "Certificates & memberships",
}: {
  logos?: readonly LogoItem[];
  className?: string;
  maxSlots?: number;
  slots?: number;
  variant?: Variant;
  label?: string;
  heading?: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const logoSources = useMemo(() => logos.map(({ src }) => src), [logos]);
  const allLoaded = useImagesPreloaded(logoSources);
  const responsiveSlotCount = useSlotCount();
  const slotCount = Math.max(
    1,
    Math.min(logos.length, slots ?? (maxSlots ? Math.min(responsiveSlotCount, maxSlots) : responsiveSlotCount)),
  );
  const slotLogos = useMemo(
    () => Array.from({ length: slotCount }, (_, slot) => logos.filter((_, index) => index % slotCount === slot)),
    [logos, slotCount],
  );

  if (logos.length === 0) return null;

  return (
    <motion.section
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      className={`${styles.frame} ${className ?? ""}`}
      initial={false}
      animate={{ opacity: allLoaded ? 1 : 0.7 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <header className={styles.header}>
        <span className={styles.heading}><i aria-hidden="true" />{heading}</span>
        <span className={styles.total}>{String(logos.length).padStart(2, "0")} marks · rotating</span>
      </header>
      <div className={styles.slots}>
        {slotLogos.map((slot, index) => (
          <LogoSlot
            key={`${slotCount}-${index}`}
            logos={slot}
            slotIndex={index}
            totalLogos={logos.length}
            slotCount={slotCount}
            enabled={allLoaded}
            variant={variant}
            reducedMotion={Boolean(prefersReducedMotion)}
          />
        ))}
      </div>
    </motion.section>
  );
}

export default LogoCarousel;
