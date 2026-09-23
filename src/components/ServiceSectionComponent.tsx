"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import styles from "./ServiceSectionComponent.module.css";

const services = [
  {
    index: "01",
    title: "Ocean Freight",
    subtitle: "SEA MOVEMENT",
    lead: "Reliable shipping performance from origin to destination, backed by a strong global carrier network.",
    header: "KEY CAPABILITIES",
    badges: [
      { num: "01", text: "Multimodal cargo planning" },
      { num: "02", text: "FCL & LCL container support" },
      { num: "03", text: "Global route distribution" },
    ],
    footer: "Ocean freight keeps every transfer visible while cargo moves across international waters.",
    btnText: "Explore Ocean Freight",
    image: "/images/expertises-ocean-freight.webp",
  },
  {
    index: "02",
    title: "Air Freight",
    subtitle: "TIME CRITICAL",
    lead: "Speed, precision, and reliability for businesses that cannot afford delays across global destinations.",
    header: "SERVICE HIGHLIGHTS",
    badges: [
      { num: "01", text: "Express priority air cargo" },
      { num: "02", text: "Temperature-controlled handling" },
      { num: "03", text: "Guaranteed charter allocation" },
    ],
    footer: "Air freight ensures time-sensitive shipments arrive safely without delaying critical timelines.",
    btnText: "Explore Air Freight",
    image: "/images/expertises-air-freight.webp",
  },
  {
    index: "03",
    title: "Customs Clearance",
    subtitle: "CLEARANCE DESK",
    lead: "Simplifying international trade through full regulatory compliance and efficient cargo movement.",
    header: "BORDER COMPLIANCE",
    badges: [
      { num: "01", text: "Import & export clearance" },
      { num: "02", text: "Duty classification support" },
      { num: "03", text: "Proactive customs filing" },
    ],
    footer: "Customs compliance keeps your shipments moving smoothly across international borders.",
    btnText: "Explore Customs",
    image: "/images/expertises-customs.webp",
  },
  {
    index: "04",
    title: "Warehousing & Logistics",
    subtitle: "LOCAL CONTROL",
    lead: "Keeping your supply chain efficient, connected, and responsive through end-to-end warehouse support.",
    header: "STORAGE & TRANSPORT",
    badges: [
      { num: "01", text: "Secure inventory management" },
      { num: "02", text: "Inland transport dispatch" },
      { num: "03", text: "Fulfillment & distribution" },
    ],
    footer: "Integrated warehousing maintains operational control from facility storage to final destination.",
    btnText: "Explore Warehousing",
    image: "/images/expertises-warehousing.webp",
  },
  {
    index: "05",
    title: "Specialized Logistics",
    subtitle: "COMPLEX CARGO",
    lead: "Planning-led freight support for oversized, sensitive, and non-standard project cargo.",
    header: "PROJECT HANDOVER",
    badges: [
      { num: "01", text: "Heavy-lift route planning" },
      { num: "02", text: "Specialized equipment selection" },
      { num: "03", text: "On-site project coordination" },
    ],
    footer: "Specialized logistics handles non-standard cargo with technical precision and safety.",
    btnText: "Explore Project Cargo",
    image: "/images/expertises-specialized.webp",
  },
];

declare global {
  interface Window {
    gsap?: any;
    ScrollTrigger?: any;
  }
}

export default function ServiceSectionComponent() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [gsapReady, setGsapReady] = useState(false);

  useEffect(() => {
    // Ensure body opacity is 1
    const prev = document.body.style.opacity;
    document.body.style.setProperty("opacity", "1", "important");
    return () => {
      document.body.style.opacity = prev;
    };
  }, []);

  // GSAP ScrollTrigger setup
  useEffect(() => {
    if (!gsapReady || !window.gsap || !window.ScrollTrigger) return;

    window.gsap.registerPlugin(window.ScrollTrigger);

    const track = trackRef.current;
    const scene = sceneRef.current;
    if (!track || !scene) return;

    const getDistance = () => track.scrollWidth - window.innerWidth;

    const timeline = window.gsap.timeline({
      scrollTrigger: {
        trigger: scene,
        pin: true,
        start: "top top",
        end: () => `+=${getDistance()}`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    timeline.fromTo(
      track,
      { x: 0 },
      {
        x: () => -getDistance(),
        ease: "none",
        duration: 1,
      }
    );

    // Image parallax effect matching homepage (fromTo -15% to 15%)
    const images = track.querySelectorAll("img");
    images.forEach((img, idx) => {
      window.gsap.fromTo(
        img,
        { xPercent: idx === 0 ? 0 : -15 },
        {
          xPercent: 15,
          ease: "none",
          scrollTrigger: {
            trigger: img.parentElement,
            containerAnimation: timeline,
            start: () => (idx === 0 ? "left left" : "left right"),
            end: "right left",
            scrub: true,
          },
        }
      );
    });

    return () => {
      if (timeline.scrollTrigger) timeline.scrollTrigger.kill();
      timeline.kill();
    };
  }, [gsapReady]);

  return (
    <div className={styles.page}>
      {/* Load GSAP + ScrollTrigger CDN */}
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"
        strategy="afterInteractive"
      />
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"
        strategy="afterInteractive"
        onLoad={() => setGsapReady(true)}
      />

      {/* Horizontal Scroll Scene */}
      <div ref={sceneRef} className={styles.scrollScene}>
        <div className={styles.stickyViewport}>
          <div ref={trackRef} className={styles.track}>
            {/* Slide 0: Intro Slide */}
            <section className={`${styles.slide} ${styles.introSlide}`}>
              <div className={styles.introRight}>
                <span className={styles.introSubtitle}>Our services</span>
                <h2 className={styles.introTitle}>
                  Comprehensive logistics solutions for every need
                </h2>
              </div>
              <div className={styles.introLeft}>
                <img
                  src="/images/expertises-intro.webp"
                  alt="Our services"
                  draggable={false}
                />
              </div>
            </section>

            {/* Slides 1-5: The 5 Service Slides */}
            {services.map((svc) => (
              <section
                key={svc.index}
                className={`${styles.slide} ${styles.serviceSlide}`}
              >
                {/* Left Panel */}
                <div className={styles.leftPanel}>
                  <span className={styles.topIndex}>{svc.index}</span>
                  <h2 className={styles.mainTitle}>{svc.title}</h2>
                  <span className={styles.subtitle}>{svc.subtitle}</span>

                  <p className={styles.leadText}>{svc.lead}</p>

                  <span className={styles.sectionHeader}>{svc.header}</span>

                  <div className={styles.badgeList}>
                    {svc.badges.map((b) => (
                      <div key={b.num} className={styles.badgeRow}>
                        <span className={styles.yellowBadge}>{b.num}</span>
                        <span className={styles.badgeLabel}>{b.text}</span>
                      </div>
                    ))}
                  </div>

                  <p className={styles.footerText}>{svc.footer}</p>

                  {/* cta-custom button */}
                  <div className={styles.btnContainer}>
                    <a href="/en/expertises-en/" className="cta-custom">
                      <div className="cta-custom-content">
                        <div className="cta-custom-wrapper">
                          <p className="text">
                            <span>{svc.btnText}</span>
                          </p>
                          <div className="cta-custom-arrows-wrapper">
                            <div className="icon icon-arrow-right"></div>
                            <div className="icon icon-arrow-right absolute"></div>
                          </div>
                        </div>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Right Panel */}
                <div className={styles.rightPanel}>
                  <img src={svc.image} alt={svc.title} draggable={false} />
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
