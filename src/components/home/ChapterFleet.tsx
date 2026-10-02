"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, MQ } from "@/lib/gsap";
import { MODELS } from "@/lib/data";
import { Odometer } from "@/components/ui/Odometer";
import { ChapterTitle } from "./chapter";

/** Capitolo VI — La flotta: scorrimento orizzontale lento, i dati si trasformano come un contatore. */
export function ChapterFleet() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const panels = gsap.utils.toArray<HTMLElement>(".flotta-pannello");
        const dist = () => track.current!.scrollWidth - window.innerWidth;
        const scroll = gsap.to(track.current, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${dist() * 1.35}`,
            pin: true,
            scrub: 1.4,
            invalidateOnRefresh: true,
            onUpdate: (self) => setIdx(Math.round(self.progress * (panels.length - 1))),
          },
        });
        panels.forEach((p) => {
          const tl = gsap.timeline({
            defaults: { ease: "lusso" },
            scrollTrigger: { trigger: p, containerAnimation: scroll, start: "left 70%", end: "left 10%", scrub: 1 },
          });
          tl.fromTo(p.querySelector(".flotta-linea"), { scaleX: 0 }, { scaleX: 1, duration: 1 }, 0)
            .from(p.querySelector(".flotta-nome"), { yPercent: 40, opacity: 0, duration: 1 }, 0.1)
            .from(p.querySelector(".flotta-yacht"), { xPercent: 6, opacity: 0.2, duration: 1 }, 0);
        });
        return () => ScrollTrigger.getAll().forEach((t) => t.vars.containerAnimation === scroll && t.kill());
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  const m = MODELS[idx];

  return (
    <section ref={root} id="flotta" data-film className="relative h-[100svh] min-h-[600px] overflow-clip bg-abisso" aria-labelledby="flotta-titolo">
      <div className="gutter absolute inset-x-0 top-[13svh] z-10 flex items-start justify-between">
        <div>
          <ChapterTitle n={6} />
          <h2 id="flotta-titolo" className="titolo mt-3 text-[clamp(1.9rem,4vw,3.4rem)]">
            Tre misure. <em className="italic text-sabbia">Una famiglia.</em>
          </h2>
        </div>
        <p className="numero hidden text-sm text-spuma/60 md:block" aria-hidden>
          <span className="text-ottone">0{idx + 1}</span> / 03
        </p>
      </div>

      <div ref={track} className="flex h-full w-max motion-reduce:w-full motion-reduce:flex-col">
        {MODELS.map((model) => (
          <article key={model.slug} className="flotta-pannello relative flex h-[100svh] w-screen shrink-0 flex-col items-center justify-center pb-[10svh] pt-[22svh] md:pb-[12svh] md:pt-[20svh]">
            <div className="relative w-[96vw] md:w-[min(66vw,118svh)]">
              <div className="flotta-nome relative z-10 mb-[-6%] flex items-baseline gap-4 md:mb-[-5%] md:gap-6">
                <h3 className="titolo text-[clamp(2.8rem,7vw,6.4rem)] italic text-spuma">{model.name}</h3>
                <p className="etichetta text-[0.6rem] text-ottone">{model.code}</p>
              </div>
              <div className="relative" style={{ aspectRatio: "2688 / 1152" }}>
                <div className="flotta-yacht sfuma-bordi absolute inset-0">
                  <Image src={model.image} alt={model.imageAlt} fill sizes="(max-width: 768px) 96vw, 66vw" className="object-contain" />
                </div>
                <span
                  aria-hidden
                  className="flotta-linea absolute block h-px origin-center bg-ottone"
                  style={{ top: `${model.waterline * 100}%`, left: `${model.hullX[0] * 100}%`, width: `${(model.hullX[1] - model.hullX[0]) * 100}%` }}
                />
              </div>
              <div className="mt-[-4%] flex items-start justify-between gap-6">
                <p className="max-w-xs text-sm leading-relaxed text-spuma/65">{model.tagline}</p>
                <Link
                  href={`/flotta/${model.slug}`}
                  data-cursor="scopri"
                  className="etichetta group flex shrink-0 items-center gap-3 py-3 text-[0.62rem] text-spuma/80 hover:text-spuma"
                >
                  Scopri {model.name}
                  <span aria-hidden className="block h-px w-8 bg-ottone transition-[width] duration-700 group-hover:w-14" />
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* scheda dati: i numeri scorrono da un modello all'altro */}
      <dl className="gutter absolute inset-x-0 bottom-[7svh] z-10 grid grid-cols-4 gap-4 md:bottom-[9svh] md:flex md:justify-start md:gap-16">
        {[
          { label: "Lunghezza", node: <Odometer value={m.length} decimals={0} digits={2} />, unit: "m" },
          { label: "Ospiti", node: <Odometer value={m.guests} digits={2} />, unit: "" },
          { label: "Cabine", node: <Odometer value={m.cabins} digits={1} />, unit: "" },
          { label: "Velocità", node: <Odometer value={m.speed} digits={2} />, unit: "nodi" },
        ].map((s) => (
          <div key={s.label}>
            <dt className="etichetta text-[0.62rem] text-sabbia md:text-[0.6rem]">{s.label}</dt>
            <dd className="numero mt-2 flex items-baseline gap-1.5 text-[1.7rem] text-spuma md:text-4xl">
              {s.node}
              {s.unit && <span className="text-xs text-spuma/55 md:text-sm">{s.unit}</span>}
            </dd>
          </div>
        ))}
      </dl>
      <p className="sr-only" aria-live="polite">
        {m.code} {m.name}: {m.length} metri, {m.guests} ospiti, {m.cabins} cabine, {m.speed} nodi.
      </p>
    </section>
  );
}
