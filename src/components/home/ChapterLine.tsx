"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { ChapterTitle, useArmed } from "./chapter";
import { BLUEPRINT, DIMENSIONS, VB, WATERLINE } from "./blueprint";

const fmt = (v: number, dec: number) => v.toFixed(dec).replace(".", ",");

const STATS = [
  { label: "Lunghezza", to: 32, dec: 2, unit: "m" },
  { label: "Baglio", to: 7.2, dec: 2, unit: "m" },
  { label: "Velocità", to: 24, dec: 0, unit: "nodi" },
];

/** Capitolo II — Dalla linea allo scafo: il progetto si disegna e diventa fotografia. */
export function ChapterLine() {
  const root = useRef<HTMLElement>(null);
  const armed = useArmed(root, 2);
  const svg = useRef<SVGSVGElement>(null);

  // spessore del tratto costante in pixel, qualunque sia la scala del disegno
  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const scale = el.clientWidth / VB.w || 1;
      el.style.setProperty("--sw", String(1.1 / scale));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      if (!armed) return;
      const counters = gsap.utils.toArray<HTMLElement>(".bp-cnt");
      const wl = (WATERLINE * 100).toFixed(2);
      const closed = `inset(${wl}% 0% ${(100 - +wl).toFixed(2)}% 0%)`;
      const mm = gsap.matchMedia();

      mm.add(MQ.motion, () => {
        const state = counters.map(() => ({ v: 0 }));
        const tl = gsap.timeline({
          defaults: { ease: "lusso" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=300%", pin: true, scrub: 1 },
        });
        tl.from(".bp-griglia", { opacity: 0, duration: 0.6 }, 0)
          .from(".bp-titolo", { opacity: 0, y: 14, duration: 0.6 }, 0.1)
          .fromTo(".bp-linea", { drawSVG: "50% 50%" }, { drawSVG: "0% 100%", duration: 1.2 }, 0.2)
          .fromTo(".bp-tratto", { drawSVG: "0%" }, { drawSVG: "100%", duration: 2.4, stagger: 0.12, ease: "power1.inOut" }, 0.9)
          .fromTo(".bp-quota", { drawSVG: "0%" }, { drawSVG: "100%", duration: 1, stagger: 0.3 }, 3.1)
          .from(".bp-quota-testo", { opacity: 0, duration: 0.8, stagger: 0.3 }, 3.5)
          .from(".bp-stat", { opacity: 0, y: 12, duration: 0.8, stagger: 0.15 }, 3.3);
        counters.forEach((el, i) => {
          const s = STATS[i];
          tl.to(
            state[i],
            { v: s.to, duration: 1.6, ease: "power2.out", onUpdate: () => (el.textContent = fmt(state[i].v, s.dec)) },
            3.4 + i * 0.15
          );
        });
        tl.fromTo(".bp-foto", { clipPath: closed }, { clipPath: "inset(0% 0% 0% 0%)", duration: 2.2 }, 5.4)
          .to(".bp-disegno", { opacity: 0.35, duration: 1.2 }, 6.2)
          .to(".bp-disegno", { opacity: 0, duration: 1.2 }, 7.6)
          .to(".bp-quote", { opacity: 0, duration: 1 }, 7.6)
          .from(".bp-didascalia", { opacity: 0, y: 18, duration: 1.4 }, 8)
          .to({}, { duration: 0.8 });
      });

      mm.add(MQ.reduced, () => {
        counters.forEach((el, i) => (el.textContent = fmt(STATS[i].to, STATS[i].dec)));
        gsap.set(".bp-disegno", { opacity: 0.25 });
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [armed] }
  );

  return (
    <section ref={root} id="linea" data-film className="relative h-[100svh] min-h-[600px] overflow-clip bg-abisso" aria-labelledby="linea-titolo">
      {/* griglia tecnica */}
      <svg aria-hidden className="bp-griglia absolute inset-0 h-full w-full">
        <defs>
          <pattern id="bp-p" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M40 0H0V40" fill="none" stroke="rgb(242 239 233 / 0.045)" strokeWidth="1" />
          </pattern>
          <pattern id="bp-P" width="200" height="200" patternUnits="userSpaceOnUse">
            <rect width="200" height="200" fill="url(#bp-p)" />
            <path d="M200 0H0V200" fill="none" stroke="rgb(242 239 233 / 0.08)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bp-P)" />
      </svg>

      <div className="bp-titolo gutter absolute inset-x-0 top-[16svh] flex items-start justify-between gap-6 md:top-[15svh]">
        <ChapterTitle n={2} />
        <p className="etichetta hidden text-right text-[0.6rem] text-spuma/60 md:block">
          Tav. 01 / 3000 — Profilo laterale
          <br />
          Scala 1:50 — LDA 32
        </p>
      </div>

      <div
        className="absolute left-1/2 top-[47%] w-[min(124vw,1500px)] -translate-x-1/2 -translate-y-1/2 md:w-[min(92vw,1500px)]"
        style={{ aspectRatio: `${VB.w} / ${VB.h}` }}
      >
        <div className="bp-foto sfuma-bordi absolute inset-0" style={{ clipPath: "inset(0 0 0 0)" }}>
          <Image
            src="/media/fleet-aurora.webp"
            alt="LDA 32 Aurora di profilo: scafo blu notte con filetto in ottone, sovrastruttura bianca su due ponti, vetrate scure"
            fill
            sizes="(max-width: 768px) 124vw, 92vw"
            className="object-cover"
          />
        </div>
        <svg
          ref={svg}
          viewBox={`0 0 ${VB.w} ${VB.h}`}
          className="absolute inset-0 h-full w-full overflow-visible"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          style={{ strokeWidth: "var(--sw, 2)" }}
        >
          <g className="bp-disegno" stroke="rgb(242 239 233 / 0.8)">
            {BLUEPRINT.filter((p) => p.kind !== "linea").map((p, i) => (
              <path key={i} className="bp-tratto" d={p.d} stroke={p.kind === "vetro" ? "rgb(201 185 154 / 0.7)" : undefined} />
            ))}
          </g>
          <path className="bp-linea" d={BLUEPRINT[0].d} stroke="var(--color-ottone)" style={{ strokeWidth: "calc(var(--sw, 2) * 1.4)" }} />
          <g className="bp-quote" stroke="rgb(184 146 90 / 0.85)">
            <path className="bp-quota" d={DIMENSIONS.length.d} />
            <path className="bp-quota" d={DIMENSIONS.height.d} />
          </g>
        </svg>
        <div className="bp-quote pointer-events-none absolute inset-0">
          <p
            className="bp-quota-testo etichetta absolute -translate-x-1/2 translate-y-3 text-[0.62rem] text-ottone md:text-[0.62rem]"
            style={{ left: `${DIMENSIONS.length.labelX * 100}%`, top: `${DIMENSIONS.length.labelY * 100}%` }}
          >
            L.f.t. 32,00 m
          </p>
          <p
            className="bp-quota-testo etichetta absolute hidden -translate-y-1/2 text-[0.62rem] text-ottone md:block"
            style={{ left: `${DIMENSIONS.height.labelX * 100}%`, top: `${DIMENSIONS.height.labelY * 100}%` }}
          >
            9,40 m
          </p>
        </div>
      </div>

      <dl className="gutter absolute inset-x-0 bottom-[22svh] flex flex-wrap justify-center gap-x-10 gap-y-4 md:bottom-[17svh] md:gap-x-20">
        {STATS.map((s) => (
          <div key={s.label} className="bp-stat text-center">
            <dt className="etichetta text-[0.6rem] text-sabbia">{s.label}</dt>
            <dd className="numero mt-1 text-3xl text-spuma md:text-4xl">
              <span className="bp-cnt">{fmt(s.to, s.dec)}</span> <span className="text-lg text-spuma/60">{s.unit}</span>
            </dd>
          </div>
        ))}
      </dl>
      <p className="etichetta absolute inset-x-0 bottom-[17svh] text-center text-[0.62rem] text-spuma/60 md:bottom-[13svh]">Dati dimostrativi</p>

      <h2 id="linea-titolo" className="bp-didascalia titolo gutter absolute inset-x-0 bottom-[6svh] text-center text-[clamp(2rem,5vw,4.2rem)] text-spuma">
        Tremila disegni. <em className="italic text-sabbia">Un’unica linea.</em>
      </h2>
    </section>
  );
}
