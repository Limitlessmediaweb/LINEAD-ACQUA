"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger, MQ } from "@/lib/gsap";

let lenisInstance: Lenis | null = null;
export const getLenis = () => lenisInstance;

/** Scorrimento morbido e "pesante" (lerp 0.07), sincronizzato con ScrollTrigger. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    // Su touch Lenis non addolcisce (lo scroll resta nativo) ma leggerebbe la posizione a ogni
    // fotogramma: su telefono lo scroll nativo è già il più fluido e costa zero.
    if (window.matchMedia(MQ.reduced).matches || !window.matchMedia("(pointer: fine)").matches) return;
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

  // ScrollTrigger si ricalcola da solo al "load"; qui solo se i font arrivano dopo.
  useEffect(() => {
    if (document.readyState === "complete") return;
    let loaded = false;
    const onLoad = () => (loaded = true);
    window.addEventListener("load", onLoad, { once: true });
    document.fonts?.ready.then(() => {
      if (loaded) ScrollTrigger.refresh();
    });
    return () => window.removeEventListener("load", onLoad);
  }, []);

  // A ogni cambio pagina si riparte dall'alto (al primo caricamento ci pensano font e load).
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    lenisInstance?.scrollTo(0, { immediate: true, force: true });
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
