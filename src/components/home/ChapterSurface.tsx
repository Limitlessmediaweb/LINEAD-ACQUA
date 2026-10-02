"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { emit } from "@/lib/bus";
import { useFilmCaps } from "@/lib/useMedia";
import { glState } from "@/components/gl/state";
import { ChapterTitle } from "./chapter";
import { TrialForm } from "./TrialForm";

const DiveView = dynamic(() => import("@/components/gl/scenes").then((m) => m.DiveView), { ssr: false });

/** Capitolo VIII — Sotto la superficie: la camera scende sotto il pelo dell'acqua. */
export function ChapterSurface() {
  const root = useRef<HTMLElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const caps = useFilmCaps();
  const [glReady, setGlReady] = useState(false);
  const onReady = useCallback(() => setGlReady(true), []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const tl = gsap.timeline({
          defaults: { ease: "lusso" },
          scrollTrigger: {
            trigger: pin.current,
            start: "top top",
            end: "+=220%",
            pin: true,
            scrub: 1.2,
            onUpdate: (self) => emit("audio:depth", gsap.utils.clamp(0, 1, (self.progress - 0.25) / 0.5)),
          },
        });
        tl.to(glState.dive, { progress: 1, duration: 3, ease: "none" }, 0)
          // senza WebGL: dissolvenza tra le due immagini
          .to(".sup-sotto", { opacity: 1, duration: 1.4, ease: "sine.inOut" }, 0.9)
          .to(".sup-sopra", { scale: 1.18, duration: 1.8, ease: "none" }, 0)
          .from(".sup-titolo .riga", { yPercent: 110, duration: 1.2, stagger: 0.15 }, 2.4)
          .from(".sup-label", { opacity: 0, duration: 0.8 }, 2.3)
          .to({}, { duration: 0.8 });
      });
      mm.add(MQ.reduced, () => {
        gsap.set(".sup-sotto", { opacity: 1 });
        glState.dive.progress = 1;
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  const hideDom = caps.gl && glReady;

  return (
    <section ref={root} id="superficie" data-film className="relative" aria-labelledby="sup-titolo">
      <div ref={pin} className="relative h-[100svh] min-h-[560px] overflow-clip">
        <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: hideDom ? 0 : 1 }} aria-hidden>
          <div className="sup-sopra absolute inset-0">
            <Image src="/media/hero-169.webp" alt="" fill sizes="100vw" className="object-cover" />
          </div>
          <div className="sup-sotto absolute inset-0 opacity-0">
            <Image src="/media/underwater.webp" alt="" fill sizes="100vw" className="object-cover" />
          </div>
        </div>
        {caps.gl && <DiveView above="/media/hero-169.webp" below="/media/underwater.webp" mode="dive" onReady={onReady} />}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-abisso/80 via-transparent to-transparent" />
        <p className="sr-only">
          La vista scende sotto il pelo dell’acqua: dal mare al tramonto allo scafo visto da sotto, con i raggi di luce.
        </p>

        <div className="gutter absolute inset-x-0 bottom-[14svh]">
          <ChapterTitle n={8} className="sup-label mb-6" />
          <h2 id="sup-titolo" className="sup-titolo titolo max-w-5xl text-[clamp(2.6rem,7.4vw,7rem)] text-spuma">
            <span className="split-mask block">
              <span className="riga block">Alcune cose si capiscono</span>
            </span>
            <span className="split-mask block">
              <span className="riga block italic text-sabbia">solo in mare.</span>
            </span>
          </h2>
        </div>
      </div>

      <div id="prova" className="relative overflow-clip bg-gradient-to-b from-abisso via-[#071827] to-abisso py-[14svh]">
        <TrialForm />
      </div>
    </section>
  );
}
