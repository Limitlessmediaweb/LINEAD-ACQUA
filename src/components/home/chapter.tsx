"use client";

import { useEffect, useState, type RefObject } from "react";
import { emit, on } from "@/lib/bus";
import { CHAPTERS } from "@/lib/data";

/**
 * Un capitolo prepara le sue animazioni (pin, ScrollTrigger, SplitText) solo quando è a
 * 2,5 schermi di distanza: al caricamento lavorano solo hero e capitolo II. Si scende in
 * ordine, quindi ogni nuovo pin nasce sotto quelli esistenti senza spostarli.
 */
let armedTo = 0;
export function armTo(n: number) {
  if (n <= armedTo) return;
  armedTo = n;
  emit("film:armTo", n);
}

export function useArmed(ref: RefObject<HTMLElement | null>, n: number) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // un capitolo arma anche tutti quelli sopra, sempre nell'ordine del documento
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) armTo(n);
      },
      { rootMargin: "250% 0px" }
    );
    io.observe(el);
    const off = on("film:armTo", (v) => {
      if (v >= n) {
        setArmed(true);
        io.disconnect();
      }
    });
    return () => {
      io.disconnect();
      off();
    };
  }, [ref, n]);
  return armed;
}

/** Titolo di capitolo come un titolo di testa: CAPITOLO II — LA LINEA */
export function ChapterTitle({ n, className = "" }: { n: number; className?: string }) {
  const c = CHAPTERS[n - 1];
  return (
    <p className={`etichetta flex items-center gap-3 whitespace-nowrap text-sabbia md:gap-4 ${className}`}>
      <span className="numero text-[0.8rem] tracking-[0.2em] text-ottone">CAPITOLO {c.roman}</span>
      <span aria-hidden className="h-px w-5 shrink-0 bg-ottone/60 md:w-8" />
      <span>{c.title}</span>
    </p>
  );
}
