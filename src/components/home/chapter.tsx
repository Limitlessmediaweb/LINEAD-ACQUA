"use client";

import { CHAPTERS } from "@/lib/data";

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
