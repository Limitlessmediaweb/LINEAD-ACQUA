"use client";

import { useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";

const EVENTS = [
  { year: "1987", title: "Una rimessa a Lavagna", text: "Due fratelli, un capannone in affitto e un gozzo da restaurare." },
  { year: "1994", title: "Il primo scafo", text: "Diciotto metri in vetroresina e teak. Lo abbiamo varato in silenzio, all'alba." },
  { year: "2003", title: "La linea", text: "Nasce il filetto in ottone sullo scafo: da allora è la nostra firma." },
  { year: "2011", title: "Aurora", text: "Il primo LDA 32. Undici esemplari, nessuno uguale all'altro." },
  { year: "2019", title: "Notturno", text: "Quaranta metri, tre ponti, scafo grafite. La traversata come misura." },
  { year: "Oggi", title: "Tremila disegni", text: "Settanta persone, quattro yacht all'anno. Non uno di più." },
];

/** Timeline verticale: la linea in ottone si disegna mentre si scorre. */
export function Timeline() {
  const root = useRef<HTMLOListElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          ".tl-asse",
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top 70%", end: "bottom 60%", scrub: 1 } }
        );
        gsap.utils.toArray<HTMLElement>(".tl-voce").forEach((el) => {
          gsap.from(el.children, {
            opacity: 0,
            y: 18,
            duration: 1.5,
            stagger: 0.1,
            ease: "lusso",
            scrollTrigger: { trigger: el, start: "top 78%" },
          });
          gsap.from(el.querySelector(".tl-punto"), { scale: 0, duration: 1, ease: "lusso", scrollTrigger: { trigger: el, start: "top 78%" } });
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <ol ref={root} className="relative mx-auto max-w-4xl">
      <span aria-hidden className="tl-asse absolute bottom-0 left-[5.5rem] top-0 w-px origin-top bg-ottone/60 md:left-1/2" />
      {EVENTS.map((e, i) => (
        <li key={e.year} className={`tl-voce relative grid grid-cols-[5.5rem_1fr] gap-x-8 pb-20 md:grid-cols-2 md:gap-x-20 ${i % 2 ? "md:[&>*:first-child]:order-2 md:[&>*:first-child]:text-left" : ""}`}>
          <p className="numero pt-1 text-2xl text-ottone md:text-right md:text-4xl">{e.year}</p>
          <div className="pl-2 md:pl-0">
            <h3 className="titolo text-3xl text-spuma md:text-4xl">{e.title}</h3>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-spuma/70">{e.text}</p>
          </div>
          <span aria-hidden className="tl-punto absolute left-[5.5rem] top-3 block size-2 -translate-x-1/2 rounded-full bg-ottone md:left-1/2" />
        </li>
      ))}
    </ol>
  );
}
