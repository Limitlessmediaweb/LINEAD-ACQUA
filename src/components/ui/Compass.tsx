"use client";

import { useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";

/** Bussola in ottone: l'ago oscilla lento, cercando un nord che non trova. */
export function Compass({ className = "" }: { className?: string }) {
  const root = useRef<SVGSVGElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const needle = root.current!.querySelector(".ago");
        const search = () => {
          gsap.to(needle, {
            rotation: gsap.utils.random(-140, 140),
            svgOrigin: "100 100",
            duration: gsap.utils.random(2.6, 4.2),
            ease: "sine.inOut",
            onComplete: search,
          });
        };
        search();
        gsap.to(root.current!.querySelector(".rosa"), { rotation: 360, svgOrigin: "100 100", duration: 160, repeat: -1, ease: "none" });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <svg ref={root} viewBox="0 0 200 200" className={className} fill="none" stroke="var(--color-ottone)" aria-hidden>
      <circle cx="100" cy="100" r="96" strokeWidth="0.8" />
      <circle cx="100" cy="100" r="84" strokeWidth="0.5" opacity="0.6" />
      <g className="rosa">
        {Array.from({ length: 72 }, (_, i) => (
          <line key={i} x1="100" y1="6" x2="100" y2={i % 18 === 0 ? 20 : i % 2 === 0 ? 13 : 10} strokeWidth={i % 18 === 0 ? 1.2 : 0.5} transform={`rotate(${i * 5} 100 100)`} />
        ))}
        {["N", "E", "S", "O"].map((l, i) => (
          <text
            key={l}
            x="100"
            y="36"
            fill="var(--color-sabbia)"
            stroke="none"
            textAnchor="middle"
            fontSize="12"
            fontFamily="var(--font-serif)"
            transform={`rotate(${i * 90} 100 100)`}
          >
            {l}
          </text>
        ))}
      </g>
      <g className="ago">
        <path d="M100 30 L106 100 L100 106 L94 100 Z" fill="var(--color-ottone)" stroke="none" />
        <path d="M100 170 L106 100 L100 94 L94 100 Z" fill="var(--color-spuma)" fillOpacity="0.25" stroke="none" />
        <circle cx="100" cy="100" r="4" fill="var(--color-abisso)" strokeWidth="1" />
      </g>
    </svg>
  );
}
