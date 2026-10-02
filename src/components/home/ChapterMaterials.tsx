"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { MATERIALS } from "@/lib/data";
import { ChapterTitle } from "./chapter";

const LENS = 220;
const ZOOM = 1.6;

/** Capitolo V — Materia: quattro macro che si susseguono a tendina, con una lente al cursore. */
export function ChapterMaterials() {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const active = useRef(0);

  // lente d'ingrandimento con inerzia (solo puntatore fine)
  useEffect(() => {
    const el = stage.current;
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    const lens = el.querySelector<HTMLElement>(".lente")!;
    const inners = gsap.utils.toArray<HTMLElement>(".lente-img", lens);
    const reduced = window.matchMedia(MQ.reduced).matches;
    const d = reduced ? 0.01 : 0.9;
    const lx = gsap.quickTo(lens, "x", { duration: d, ease: "power3.out" });
    const ly = gsap.quickTo(lens, "y", { duration: d, ease: "power3.out" });
    const ix = inners.map((i) => gsap.quickTo(i, "x", { duration: d, ease: "power3.out" }));
    const iy = inners.map((i) => gsap.quickTo(i, "y", { duration: d, ease: "power3.out" }));

    const size = () => {
      inners.forEach((i) => {
        i.style.width = `${el.clientWidth * ZOOM}px`;
        i.style.height = `${el.clientHeight * ZOOM}px`;
      });
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      lx(x - LENS / 2);
      ly(y - LENS / 2);
      ix.forEach((f) => f(-x * ZOOM + LENS / 2));
      iy.forEach((f) => f(-y * ZOOM + LENS / 2));
      inners.forEach((img, k) => (img.style.opacity = k === active.current ? "1" : "0"));
    };
    const enter = () => gsap.to(lens, { scale: 1, opacity: 1, duration: 0.9, ease: "lusso" });
    const leave = () => gsap.to(lens, { scale: 0.6, opacity: 0, duration: 0.7, ease: "lusso" });
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerenter", enter);
    el.addEventListener("pointerleave", leave);
    return () => {
      ro.disconnect();
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerenter", enter);
      el.removeEventListener("pointerleave", leave);
    };
  }, []);

  useGSAP(
    () => {
      const shots = gsap.utils.toArray<HTMLElement>(".mat-foto");
      const names = gsap.utils.toArray<HTMLElement>(".mat-nome");
      const notes = gsap.utils.toArray<HTMLElement>(".mat-nota");
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.set(shots.slice(1), { clipPath: "inset(0% 0% 100% 0%)" });
        gsap.set(names.slice(1), { opacity: 0, yPercent: 12 });
        gsap.set(notes.slice(1), { opacity: 0, y: 12 });
        const tl = gsap.timeline({
          defaults: { ease: "lusso" },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=320%",
            pin: true,
            scrub: 1.2,
            onUpdate: (self) => {
              active.current = Math.min(MATERIALS.length - 1, Math.round(self.progress * (MATERIALS.length - 1) + 0.15));
            },
          },
        });
        tl.from(".mat-intro", { opacity: 0, y: 14, duration: 0.6 }, 0)
          .from(shots[0], { clipPath: "inset(0% 0% 100% 0%)", duration: 1.4 }, 0)
          .from(names[0], { opacity: 0, yPercent: 12, duration: 1.4 }, 0.2)
          .to({}, { duration: 0.6 });
        MATERIALS.forEach((_, i) => {
          if (i === 0) return;
          const at = i * 2 + 0.4;
          // tendina verticale lenta: l'immagine nuova scende dall'alto
          tl.to(shots[i], { clipPath: "inset(0% 0% 0% 0%)", duration: 1.8 }, at)
            .to(shots[i - 1].querySelector("img"), { scale: 1.08, duration: 1.8 }, at)
            .to(names[i - 1], { opacity: 0, yPercent: -10, duration: 1 }, at)
            .to(names[i], { opacity: 1, yPercent: 0, duration: 1.4 }, at + 0.5)
            .to(notes[i - 1], { opacity: 0, y: -10, duration: 0.6 }, at)
            .to(notes[i], { opacity: 1, y: 0, duration: 0.8 }, at + 0.8);
        });
        tl.to({}, { duration: 0.8 });
      });
      mm.add(MQ.reduced, () => {
        // senza movimento: una sola materia, ferma
        gsap.set([...shots.slice(1), ...names.slice(1), ...notes.slice(1)], { opacity: 0 });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} id="materia" data-film className="relative h-[100svh] min-h-[620px] overflow-clip bg-abisso" aria-labelledby="materia-titolo">
      {/* nomi giganti, semitrasparenti, dietro le immagini */}
      <div aria-hidden className="absolute inset-0 flex items-center justify-center">
        {MATERIALS.map((m) => (
          <span
            key={m.id}
            className="mat-nome titolo absolute whitespace-nowrap text-[clamp(8rem,36vw,36rem)] italic text-spuma/[0.13]"
          >
            {m.name}
          </span>
        ))}
      </div>

      <div className="mat-intro gutter absolute inset-x-0 top-[13svh] z-10 flex items-start justify-between">
        <div>
          <ChapterTitle n={5} />
          <h2 id="materia-titolo" className="titolo mt-3 text-[clamp(1.9rem,4vw,3.4rem)]">
            Ciò che si tocca <em className="italic text-sabbia">resta.</em>
          </h2>
        </div>
      </div>

      <div
        ref={stage}
        data-cursor="scopri"
        className="absolute left-1/2 top-[56%] aspect-[4/5] w-[min(78vw,52svh)] -translate-x-1/2 -translate-y-1/2 overflow-clip md:aspect-[16/10] md:w-[min(58vw,96svh)]"
      >
        {MATERIALS.map((m) => (
          <div key={m.id} className="mat-foto absolute inset-0 overflow-clip">
            <Image src={m.src} alt={m.alt} fill sizes="(max-width: 768px) 78vw, 58vw" className="object-cover" />
          </div>
        ))}
        <div
          aria-hidden
          className="lente pointer-events-none absolute left-0 top-0 z-10 overflow-clip rounded-full border border-ottone/70 opacity-0"
          style={{ width: LENS, height: LENS, transform: "scale(0.6)" }}
        >
          {MATERIALS.map((m) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={m.id} src={m.src} alt="" loading="lazy" decoding="async" className="lente-img absolute left-0 top-0 max-w-none object-cover opacity-0" />
          ))}
        </div>
      </div>

      <div className="gutter absolute inset-x-0 bottom-[7svh] z-10 md:bottom-[10svh]">
        <div className="relative h-20 md:ml-auto md:w-80">
          {MATERIALS.map((m, i) => (
            <div key={m.id} className="mat-nota absolute inset-x-0 bottom-0">
              <p className="etichetta text-[0.6rem] text-ottone">
                0{i + 1} / 04 — {m.latin}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-spuma/80">{m.note}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
