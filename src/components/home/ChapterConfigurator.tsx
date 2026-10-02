"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { HULLS, WOODS, MODELS } from "@/lib/data";
import { ChapterTitle, useArmed } from "./chapter";

const AURORA = MODELS.find((m) => m.slug === "aurora")!;
const WL = AURORA.waterline; // linea di galleggiamento nella foto
const SHEER = 0.52; // cavallino: dove finisce lo scafo e inizia la sovrastruttura

/** Capitolo VII — Il vostro yacht: il colore sale dalla linea di galleggiamento, come l'acqua. */
export function ChapterConfigurator() {
  const root = useRef<HTMLElement>(null);
  const armed = useArmed(root, 7);
  const [hull, setHull] = useState(0);
  const [wood, setWood] = useState(0);
  const z = useRef(1);

  useGSAP(
    () => {
      if (!armed) return;
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap
          .timeline({ defaults: { ease: "lusso" }, scrollTrigger: { trigger: root.current, start: "top 60%" } })
          .from(".conf-intro > *", { opacity: 0, y: 16, duration: 1.4, stagger: 0.12 })
          .from(".conf-yacht", { opacity: 0, scale: 1.03, duration: 2 }, 0.2)
          .from(".conf-panel > *", { opacity: 0, y: 12, duration: 1.2, stagger: 0.1 }, 0.6);
        gsap.fromTo(
          ".conf-firma",
          { scaleX: 0 },
          { scaleX: 1, duration: 2, ease: "lusso", scrollTrigger: { trigger: ".conf-nota", start: "top 85%" } }
        );
      });
      return () => mm.revert();
    },
    { scope: root, dependencies: [armed] }
  );

  const chooseHull = (i: number) => {
    if (i === hull) return;
    setHull(i);
    const layer = root.current!.querySelector<HTMLElement>(`[data-scafo="${i}"]`)!;
    const wave = root.current!.querySelector<HTMLElement>(".conf-onda")!;
    z.current += 1;
    const reduced = window.matchMedia(MQ.reduced).matches;
    gsap.killTweensOf([layer, wave]);
    layer.style.zIndex = String(z.current);
    if (reduced) {
      gsap.fromTo(layer, { opacity: 0, clipPath: "inset(0% 0% 0% 0%)" }, { opacity: 1, duration: 0.6, ease: "none" });
      return;
    }
    const wl = WL * 100;
    gsap
      .timeline({ defaults: { ease: "lusso" } })
      .set(layer, { opacity: 1, clipPath: `inset(${wl}% 0% 0% 0%)` })
      .set(wave, { top: `${wl}%`, opacity: 1, scaleX: 0.7 })
      .to(layer, { clipPath: `inset(${SHEER * 100 - 1}% 0% 0% 0%)`, duration: 1.7 }, 0)
      .to(wave, { top: `${SHEER * 100 - 1}%`, scaleX: 1, duration: 1.7 }, 0)
      .to(wave, { opacity: 0, duration: 0.8 }, 1.4)
      .to(layer, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "power2.out" }, 1.6);
  };

  return (
    <section ref={root} id="configuratore" data-film className="relative overflow-clip bg-notte py-[16svh]" aria-labelledby="conf-titolo">
      <div className="conf-intro gutter">
        <ChapterTitle n={7} />
        <h2 id="conf-titolo" className="titolo mt-3 max-w-3xl text-[clamp(2.2rem,5vw,4.4rem)]">
          Il vostro <em className="italic text-sabbia">yacht.</em>
        </h2>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-spuma/70 md:text-base">
          Scegliete il colore dello scafo e il legno degli interni. Il resto viene dopo, con calma.
        </p>
      </div>

      <div className="conf-yacht relative mx-auto mt-10 w-[112vw] -translate-x-[6vw] md:mt-6 md:w-[min(88vw,1400px)] md:translate-x-0" style={{ aspectRatio: "2688 / 1152" }}>
        {HULLS.map((h, i) => (
          <div
            key={h.id}
            data-scafo={i}
            className="sfuma-bordi absolute inset-0"
            style={{ zIndex: i === 0 ? 1 : 0, opacity: i === 0 ? 1 : 0 }}
            aria-hidden={i !== hull}
          >
            <Image
              src={h.src}
              alt={`LDA 32 Aurora di profilo con scafo ${h.name.toLowerCase()}`}
              fill
              sizes="(max-width: 768px) 112vw, 88vw"
              className="object-contain"
            />
          </div>
        ))}
        <span
          aria-hidden
          className="conf-onda pointer-events-none absolute left-[5%] z-[999] block h-[2px] w-[85%] -translate-y-1/2 opacity-0"
          style={{
            top: `${WL * 100}%`,
            background: "linear-gradient(90deg, transparent, rgb(242 239 233 / 0.85) 20%, var(--color-ottone) 50%, rgb(242 239 233 / 0.85) 80%, transparent)",
            boxShadow: "0 0 18px 2px rgb(184 146 90 / 0.45)",
          }}
        />
      </div>

      <div className="conf-panel gutter mt-10 grid gap-12 md:mt-4 md:grid-cols-[1fr_1fr_1.1fr] md:gap-16">
        <fieldset>
          <legend className="etichetta text-[0.62rem] text-sabbia">Scafo</legend>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-4">
            {HULLS.map((h, i) => (
              <label key={h.id} className="group flex cursor-pointer items-center gap-3">
                <input type="radio" name="scafo" className="peer sr-only" checked={hull === i} onChange={() => chooseHull(i)} />
                <span
                  aria-hidden
                  className="block size-7 rounded-full ring-1 ring-spuma/25 ring-offset-4 ring-offset-notte transition-[box-shadow] duration-500 peer-checked:ring-ottone peer-focus-visible:ring-spuma"
                  style={{ background: h.swatch }}
                />
                <span className="text-sm text-spuma/70 transition-colors duration-500 peer-checked:text-spuma">{h.name}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="etichetta text-[0.62rem] text-sabbia">Legno degli interni</legend>
          <div className="mt-5 flex items-start gap-5">
            <div className="relative aspect-[4/5] w-24 shrink-0 overflow-clip md:w-28">
              {WOODS.map((w, i) => (
                <Image
                  key={w.id}
                  src={w.src}
                  alt={i === wood ? `Campione di ${w.name.toLowerCase()}` : ""}
                  fill
                  sizes="112px"
                  className="object-cover transition-opacity duration-[1400ms] [transition-timing-function:var(--ease-lusso)]"
                  style={{ opacity: i === wood ? 1 : 0 }}
                />
              ))}
            </div>
            <div className="flex flex-col gap-1">
              {WOODS.map((w, i) => (
                <label key={w.id} className="flex cursor-pointer items-center gap-3 py-1.5">
                  <input type="radio" name="legno" className="peer sr-only" checked={wood === i} onChange={() => setWood(i)} />
                  <span aria-hidden className="block h-px w-4 bg-spuma/30 transition-all duration-700 peer-checked:w-8 peer-checked:bg-ottone" />
                  <span className="text-sm text-spuma/65 transition-colors duration-500 peer-checked:text-spuma peer-focus-visible:underline">{w.name}</span>
                </label>
              ))}
            </div>
          </div>
        </fieldset>

        <div aria-live="polite">
          <p className="etichetta text-[0.62rem] text-sabbia">Riepilogo</p>
          <dl key={`${hull}-${wood}`} className="mt-5 animate-[riepilogo_1.2s_var(--ease-lusso)_both] divide-y divide-spuma/10 border-y border-spuma/10 text-sm motion-reduce:animate-none">
            <div className="flex justify-between py-2.5">
              <dt className="text-spuma/55">Modello</dt>
              <dd>
                LDA 32 <span className="font-serif text-base italic">Aurora</span>
              </dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-spuma/55">Scafo</dt>
              <dd>{HULLS[hull].name}</dd>
            </div>
            <div className="flex justify-between py-2.5">
              <dt className="text-spuma/55">Interni</dt>
              <dd>{WOODS[wood].name}</dd>
            </div>
          </dl>
          <p className="conf-nota titolo mt-6 text-2xl leading-snug text-spuma md:text-[1.7rem]">
            Questa è solo un’anteprima. <em className="italic text-sabbia">Il resto lo disegniamo insieme.</em>
          </p>
          <span aria-hidden className="conf-firma mt-4 block h-px w-24 origin-left bg-ottone" />
        </div>
      </div>
      <style>{`@keyframes riepilogo{from{opacity:.0;transform:translateY(6px)}to{opacity:1;transform:none}}`}</style>
    </section>
  );
}
