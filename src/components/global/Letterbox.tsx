"use client";

import { useEffect, useRef } from "react";
import { gsap, MQ } from "@/lib/gsap";
import { on } from "@/lib/bus";

/** Bande nere cinematografiche, sopra e sotto. Si stringono tra un capitolo e l'altro. */
export function Letterbox() {
  const top = useRef<HTMLDivElement>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const base = useRef(0);

  useEffect(() => {
    const bars = [top.current, bottom.current];
    const set = (h: number, dur = 1.6) =>
      gsap.to(bars, { height: h, duration: dur, ease: "lusso", overwrite: "auto" });
    const reduced = window.matchMedia(MQ.reduced).matches;

    const offBase = on("letterbox:base", (h) => {
      base.current = h;
      set(h, reduced ? 0 : 1.6);
    });
    const offPulse = on("letterbox:pulse", () => {
      if (reduced || base.current === 0) return;
      const closed = base.current + Math.min(window.innerHeight * 0.09, 90);
      gsap
        .timeline({ overwrite: "auto" })
        .to(bars, { height: closed, duration: 0.9, ease: "lusso" })
        .to(bars, { height: base.current, duration: 1.6, ease: "lusso" }, "+=0.15");
    });
    return () => {
      offBase();
      offPulse();
    };
  }, []);

  return (
    <>
      <div ref={top} aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0 bg-black" />
      <div ref={bottom} aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] h-0 bg-black" />
    </>
  );
}
