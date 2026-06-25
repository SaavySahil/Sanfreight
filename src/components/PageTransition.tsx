"use client";

import { useEffect } from "react";

interface PageTransitionProps {
  bodyClass: string;
}

export default function PageTransition({ bodyClass }: PageTransitionProps) {
  useEffect(() => {
    // 1. Apply the dynamic body class from scraped page
    if (bodyClass) {
      document.body.className = bodyClass;
    }

    // 2. Reveal the page by fading out the screen loader
    const revealPage = () => {
      document.body.style.opacity = "1";
      const loader = document.getElementById("screen-loader");
      if (loader) {
        loader.style.transition = "opacity 0.5s ease-out";
        loader.style.opacity = "0";
        setTimeout(() => {
          loader.style.display = "none";
        }, 500);
      }
    };

    if (document.readyState === "complete") {
      revealPage();
    } else {
      window.addEventListener("load", revealPage);
      return () => window.removeEventListener("load", revealPage);
    }
  }, [bodyClass]);

  return null;
}
