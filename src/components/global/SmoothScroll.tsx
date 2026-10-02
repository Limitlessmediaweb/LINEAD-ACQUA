"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, MQ } from "@/lib/gsap";

let lenisInstance: Lenis | null = null;
export const getLenis = () => lenisInstance;

/** Scorrimento morbido e "pesante" (lerp 0.07), sincronizzato con ScrollTrigger. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia(MQ.reduced).matches) return;
    const lenis = new Lenis({ lerp: 0.07, wheelMultiplier: 0.85, anchors: { offset: 0 } });
    lenisInstance = lenis;
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    // lag smoothing attivo: se il thread si blocca (shader, decode) le timeline rallentano invece di saltare
    gsap.ticker.lagSmoothing(500, 33);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  // Ricalcolo dopo font e media: le altezze dei pin dipendono da entrambi.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh, { once: true });
    return () => window.removeEventListener("load", refresh);
  }, []);

  // A ogni cambio pagina si riparte dall'alto.
  useEffect(() => {
    lenisInstance?.scrollTo(0, { immediate: true, force: true });
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
