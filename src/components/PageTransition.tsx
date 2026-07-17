"use client";

import { useEffect } from "react";

interface PageTransitionProps {
  bodyClass: string;
  teamMembers?: unknown;
}

export default function PageTransition({ bodyClass, teamMembers }: PageTransitionProps) {
  useEffect(() => {
    // Inject globals needed by the scraped app bundle
    if (teamMembers) {
      (window as any).teamMembers = teamMembers;
    }
    (window as any).ADMIN_AJAX_URL = "/wp-admin/admin-ajax.php";

    // Prevent Next.js App Router from intercepting internal <a> clicks —
    // the scraped app's own AJAX router must drive navigation exclusively.
    const clickIntercept = (e: MouseEvent) => {
      const a = (e.target as Element)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (!href || href[0] === "#" || href.includes("://") ||
          href.startsWith("mailto:") || href.startsWith("tel:") ||
          a.target === "_blank" || a.getAttribute("download") != null) return;
      e.stopPropagation();
    };
    document.addEventListener("click", clickIntercept, true);

    // Apply the dynamic body class from scraped page
    if (bodyClass) {
      document.body.className = bodyClass;
    }

    // Reveal the page by fading out the screen loader
    const revealPage = () => {
      document.body.style.opacity = "1";
      document.body.classList.add("sf-revealed");
      const loader = document.getElementById("screen-loader");
      if (loader) {
        loader.style.transition = "opacity 0.5s ease-out";
        loader.style.opacity = "0";
        setTimeout(() => { loader.style.display = "none"; }, 500);
      }
    };

    if (document.readyState === "complete") {
      revealPage();
    } else {
      window.addEventListener("load", revealPage);
      return () => {
        window.removeEventListener("load", revealPage);
        document.removeEventListener("click", clickIntercept, true);
      };
    }

    return () => { document.removeEventListener("click", clickIntercept, true); };
  }, [bodyClass, teamMembers]);

  return null;
}
