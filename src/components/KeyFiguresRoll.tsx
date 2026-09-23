"use client";

import { useEffect } from "react";

export default function KeyFiguresRoll() {
  useEffect(() => {
    const section = document.querySelector<HTMLElement>(".module-key-numbers");
    if (!section || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();

      section.querySelectorAll<HTMLElement>(".number-wrapper .number").forEach((number, figureIndex) => {
        const finalValue = number.textContent?.trim() ?? "";
        number.setAttribute("aria-label", finalValue);
        number.textContent = "";

        [...finalValue].forEach((character, digitIndex) => {
          if (!/\d/.test(character)) {
            number.append(document.createTextNode(character));
            return;
          }

          const windowElement = document.createElement("span");
          windowElement.className = "sf-figure-digit";
          windowElement.setAttribute("aria-hidden", "true");
          const reel = document.createElement("span");
          reel.className = "sf-figure-reel";
          const steps = 20 + Number(character);
          reel.innerHTML = Array.from({ length: steps + 1 }, (_, step) =>
            `<span>${step % 10}</span>`
          ).join("");
          reel.style.setProperty("--sf-roll-steps", String(steps));
          reel.style.transitionDelay = `${figureIndex * 90 + digitIndex * 70}ms`;
          windowElement.append(reel);
          number.append(windowElement);
        });
      });

      requestAnimationFrame(() => requestAnimationFrame(() => section.classList.add("sf-figures-rolling")));
    }, { threshold: 0.25 });

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return null;
}
