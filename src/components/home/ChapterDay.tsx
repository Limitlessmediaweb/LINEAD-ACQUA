"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { DAY } from "@/lib/data";
import { ChapterTitle } from "./chapter";

const IMG = { w: 2688, h: 1520 };
/** luci di bordo nell'immagine notturna (coordinate 0-1) e ordine di accensione */
const LIGHTS = [
  { x: 0.4985, y: 0.464, c: "warm", s: 0.6 },
  { x: 0.521, y: 0.487, c: "warm", s: 0.8 },
  { x: 0.554, y: 0.509, c: "warm", s: 1.4 },
  { x: 0.543, y: 0.546, c: "warm", s: 1.8 },
  { x: 0.729, y: 0.553, c: "warm", s: 1 },
  { x: 0.489, y: 0.594, c: "warm", s: 0.7 },
  { x: 0.636, y: 0.599, c: "warm", s: 0.7 },
  { x: 0.432, y: 0.615, c: "blue", s: 1.2 },
  { x: 0.534, y: 0.62, c: "blue", s: 1.2 },
  { x: 0.637, y: 0.628, c: "blue", s: 1.2 },
  { x: 0.756, y: 0.633, c: "blue", s: 1.2 },
];

const pad = (n: number) => String(n).padStart(2, "0");
const hhmm = (m: number) => `${pad(Math.floor(m / 60) % 24)}:${pad(Math.floor(m % 60))}`;

/** Capitolo III — Un giorno in mare: la stessa baia, cinque ore, il tempo passa con lo scroll. */
export function ChapterDay() {
  const root = useRef<HTMLElement>(null);
  const frame = useRef<HTMLDivElement>(null);

  // posiziona le luci seguendo la logica di object-fit: cover dell'immagine
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const fw = el.clientWidth;
      const fh = el.clientHeight;
      const posX = parseFloat(getComputedStyle(el).getPropertyValue("--pos-x")) || 0.5;
      const scale = Math.max(fw / IMG.w, fh / IMG.h);
      const dw = IMG.w * scale;
      const dh = IMG.h * scale;
      const ox = (fw - dw) * posX;
      const oy = (fh - dh) * 0.5;
      el.querySelectorAll<HTMLElement>(".giorno-luce").forEach((l, i) => {
        l.style.left = `${ox + LIGHTS[i].x * dw}px`;
        l.style.top = `${oy + LIGHTS[i].y * dh}px`;
      });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useGSAP(
    () => {
      const imgs = gsap.utils.toArray<HTMLElement>(".giorno-img");
      const lines = gsap.utils.toArray<HTMLElement>(".giorno-frase");
      const timeEl = root.current!.querySelector<HTMLElement>(".giorno-ora")!;
      const hourHand = root.current!.querySelector<SVGElement>(".giorno-lancetta-ore")!;
      const minHand = root.current!.querySelector<SVGElement>(".giorno-lancetta-min")!;
      const clock = { m: DAY[0].minutes };
      const renderClock = () => {
        timeEl.textContent = hhmm(clock.m);
        gsap.set(hourHand, { rotation: ((clock.m % 720) / 720) * 360, svgOrigin: "32 32" });
        gsap.set(minHand, { rotation: ((clock.m % 60) / 60) * 360, svgOrigin: "32 32" });
      };
      renderClock();

      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.set(imgs.slice(1), { opacity: 0 });
        gsap.set(lines.slice(1), { opacity: 0, y: 14 });
        gsap.set(".giorno-luce", { opacity: 0, scale: 0.3 });
        const tl = gsap.timeline({
          defaults: { ease: "lusso" },
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=400%", pin: true, scrub: 1.2 },
        });
        tl.from(".giorno-intro", { opacity: 0, y: 12, duration: 0.6 }, 0).to({}, { duration: 0.6 });
        DAY.forEach((d, i) => {
          if (i === 0) return;
          const at = i * 2;
          tl.to(imgs[i], { opacity: 1, duration: 1.4, ease: "sine.inOut" }, at)
            .to(lines[i - 1], { opacity: 0, y: -10, duration: 0.6 }, at)
            .to(lines[i], { opacity: 1, y: 0, duration: 0.8 }, at + 0.6)
            .to(root.current, { backgroundColor: d.bg, color: d.fg, duration: 1.4, ease: "sine.inOut" }, at)
            .to(clock, { m: d.minutes, duration: 2, ease: "none", onUpdate: renderClock }, at - 0.6);
        });
        // notte: le luci si accendono una alla volta
        tl.to(".giorno-luce", { opacity: 1, scale: 1, duration: 0.5, stagger: 0.16, ease: "power2.out" }, DAY.length * 2 - 0.4).to({}, { duration: 1 });
      });
      mm.add(MQ.reduced, () => {
        gsap.set(imgs, { opacity: 0 });
        gsap.set(imgs[2], { opacity: 1 });
        gsap.set(lines, { opacity: 0 });
        gsap.set(lines[2], { opacity: 1 });
        clock.m = DAY[2].minutes;
        renderClock();
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section
      ref={root}
      id="giorno"
      data-film
      className="relative flex h-[100svh] min-h-[620px] items-center justify-center overflow-clip"
      style={{ backgroundColor: DAY[0].bg, color: DAY[0].fg }}
      aria-labelledby="giorno-titolo"
    >
      <div className="giorno-intro gutter absolute inset-x-0 top-[13svh] flex items-end justify-between md:top-[11svh]">
        <div>
          <ChapterTitle n={3} />
          <h2 id="giorno-titolo" className="titolo mt-3 text-[clamp(1.9rem,4vw,3.4rem)]">
            La stessa baia. <em className="italic opacity-75">Cinque luci.</em>
          </h2>
        </div>
      </div>

      <div
        ref={frame}
        className="relative mt-[8svh] aspect-[4/5] w-[calc(100vw-2*var(--gutter))] max-h-[62svh] overflow-clip [--pos-x:0.66] md:aspect-video md:max-h-none md:w-[min(84vw,118svh)] md:[--pos-x:0.5]"
      >
        {DAY.map((d, i) => (
          <Image
            key={d.time}
            src={d.src}
            alt={d.alt}
            fill
            sizes="(max-width: 768px) 92vw, 84vw"
            className="giorno-img object-cover [object-position:66%_50%] md:[object-position:50%_50%]"
            style={{ opacity: i === 0 ? 1 : undefined }}
          />
        ))}
        {LIGHTS.map((l, i) => (
          <span
            key={i}
            aria-hidden
            className="giorno-luce pointer-events-none absolute block -translate-x-1/2 -translate-y-1/2 rounded-full mix-blend-screen"
            style={{
              width: `${l.s * 2.2}vw`,
              height: `${l.s * 2.2}vw`,
              background:
                l.c === "blue"
                  ? "radial-gradient(circle, rgb(140 205 255 / 0.9), rgb(80 160 255 / 0.25) 35%, transparent 70%)"
                  : "radial-gradient(circle, rgb(255 226 170 / 0.95), rgb(255 190 110 / 0.28) 35%, transparent 70%)",
            }}
          />
        ))}
        <div aria-hidden className="scrim-b pointer-events-none absolute inset-x-0 bottom-0 h-1/2" />

        <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
          <div className="relative h-[4.5rem] md:h-[5rem]">
            {DAY.map((d, i) => (
              <p
                key={d.time}
                className="giorno-frase titolo absolute bottom-0 left-0 max-w-[16ch] text-[clamp(1.5rem,3.2vw,2.8rem)] text-spuma"
                style={{ opacity: i === 0 ? 1 : undefined }}
              >
                <span className="numero mr-3 text-ottone">{d.time}</span>— {d.line}
              </p>
            ))}
          </div>
        </div>

        {/* orologio in ottone */}
        <div className="absolute right-4 top-4 flex items-center gap-3 md:right-6 md:top-6" aria-hidden>
          <span className="giorno-ora numero text-xl text-spuma md:text-2xl">06:12</span>
          <svg viewBox="0 0 64 64" className="size-11 md:size-14" fill="none" stroke="var(--color-ottone)">
            <circle cx="32" cy="32" r="30" strokeWidth="1" />
            {Array.from({ length: 12 }, (_, i) => (
              <line key={i} x1="32" y1="4" x2="32" y2={i % 3 === 0 ? 9 : 7} strokeWidth="1" transform={`rotate(${i * 30} 32 32)`} />
            ))}
            <line className="giorno-lancetta-ore" x1="32" y1="32" x2="32" y2="17" strokeWidth="1.6" strokeLinecap="round" />
            <line className="giorno-lancetta-min" x1="32" y1="32" x2="32" y2="9" strokeWidth="1" strokeLinecap="round" />
            <circle cx="32" cy="32" r="1.6" fill="var(--color-ottone)" />
          </svg>
        </div>
      </div>
    </section>
  );
}
