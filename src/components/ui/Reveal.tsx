"use client";

import { useRef, type ReactNode, type RefObject } from "react";

type Poly = "div" | "section" | "h1" | "h2" | "p" | "ul" | "header";
import { gsap, SplitText, useGSAP, MQ } from "@/lib/gsap";

/** Dissolvenza lenta dal basso quando l'elemento entra nello schermo. */
export function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  stagger = 0.12,
}: {
  children: ReactNode;
  as?: Poly;
  className?: string;
  delay?: number;
  /** se >0 anima i figli diretti uno dopo l'altro */
  stagger?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const el = ref.current!;
        const targets = stagger > 0 && el.children.length > 1 ? Array.from(el.children) : el;
        gsap.from(targets, {
          opacity: 0,
          y: 22,
          duration: 1.6,
          delay,
          stagger,
          ease: "lusso",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });
      return () => mm.revert();
    },
    { scope: ref }
  );
  return (
    <Tag ref={ref as RefObject<never>} className={className}>
      {children}
    </Tag>
  );
}

/** Titolo che entra lettera per lettera da una maschera (SplitText). */
export function SplitReveal({
  children,
  as: Tag = "h1",
  className = "",
  delay = 0.2,
  onScroll = false,
}: {
  children: ReactNode;
  as?: Poly;
  className?: string;
  delay?: number;
  onScroll?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const split = new SplitText(ref.current!, { type: "lines,chars", mask: "lines", linesClass: "split-mask" });
        gsap.from(split.chars, {
          yPercent: 115,
          duration: 1.7,
          stagger: 0.03,
          delay,
          ease: "lusso",
          scrollTrigger: onScroll ? { trigger: ref.current, start: "top 85%" } : undefined,
        });
        return () => split.revert();
      });
      return () => mm.revert();
    },
    { scope: ref }
  );
  return (
    <Tag ref={ref as RefObject<never>} className={className}>
      {children}
    </Tag>
  );
}
