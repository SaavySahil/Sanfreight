"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import LogoCarousel from "@/components/ui/logo-carousel";

function subscribeToMount(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.body, { childList: true, subtree: true });
  return () => observer.disconnect();
}

function getMount() {
  return document.getElementById("sf-certificate-carousel-root");
}

export default function CertificateCarouselPortal() {
  const mount = useSyncExternalStore(subscribeToMount, getMount, () => null);

  return mount ? createPortal(<LogoCarousel maxSlots={3} />, mount) : null;
}
