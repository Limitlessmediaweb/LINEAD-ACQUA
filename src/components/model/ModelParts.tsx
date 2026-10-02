"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP, MQ } from "@/lib/gsap";
import type { Model } from "@/lib/data";
import { Odometer } from "@/components/ui/Odometer";

/** Scheda tecnica: i numeri partono da zero quando la scheda entra in scena. */
export function ModelSpecs({ model }: { model: Model }) {
  const root = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useGSAP(
    () => {
      const st = ScrollTrigger.create({ trigger: root.current, start: "top 75%", once: true, onEnter: () => setOn(true) });
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.fromTo(
          ".spec-linea",
          { scaleX: 0 },
          { scaleX: 1, duration: 2.2, ease: "lusso", scrollTrigger: { trigger: root.current, start: "top 70%" } }
        );
        gsap.from(".spec-yacht", { opacity: 0, x: 40, duration: 2, ease: "lusso", scrollTrigger: { trigger: root.current, start: "top 70%" } });
      });
      return () => {
        st.kill();
        mm.revert();
      };
    },
    { scope: root }
  );

  const rows = [
    { label: "Lunghezza f.t.", v: model.length, dec: 2, digits: 2, unit: "m" },
    { label: "Baglio", v: model.beam, dec: 2, digits: 1, unit: "m" },
    { label: "Ospiti", v: model.guests, dec: 0, digits: 2, unit: "" },
    { label: "Cabine", v: model.cabins, dec: 0, digits: 1, unit: "" },
    { label: "Velocità massima", v: model.speed, dec: 0, digits: 2, unit: "nodi" },
    { label: "Autonomia", v: model.range, dec: 0, digits: 4, unit: "mn" },
  ];

  return (
    <div ref={root} className="gutter">
      <div className="relative mx-auto w-full max-w-6xl" style={{ aspectRatio: "2688 / 1152" }}>
        <div className="spec-yacht sfuma-bordi absolute inset-0">
          <Image src={model.image} alt={model.imageAlt} fill sizes="(max-width: 1200px) 92vw, 1150px" className="object-contain" />
        </div>
        <span
          aria-hidden
          className="spec-linea absolute block h-px origin-left bg-ottone"
          style={{ top: `${model.waterline * 100}%`, left: "0%", width: "100%" }}
        />
      </div>
      <dl className="mx-auto mt-10 grid max-w-6xl grid-cols-2 gap-x-8 gap-y-10 border-t border-spuma/10 pt-10 md:grid-cols-3 lg:grid-cols-6">
        {rows.map((r) => (
          <div key={r.label}>
            <dt className="etichetta text-[0.62rem] text-sabbia">{r.label}</dt>
            <dd className="numero mt-3 flex items-baseline gap-1.5 text-4xl text-spuma">
              <Odometer value={on ? r.v : 0} decimals={r.dec} digits={r.digits} />
              {r.unit && <span className="text-sm text-spuma/55">{r.unit}</span>}
            </dd>
          </div>
        ))}
      </dl>
      <p className="etichetta mx-auto mt-8 max-w-6xl text-[0.62rem] text-spuma/60">Tutti i dati sono dimostrativi.</p>
    </div>
  );
}

/** Walk tour corto: una stanza, fotogrammi sincronizzati con lo scroll. */
export function MiniTour({ room, title, caption }: { room: string; title: string; caption: string }) {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const frame = useRef(0);

  useEffect(() => {
    if (window.matchMedia(MQ.reduced).matches) return;
    const cv = canvas.current!;
    const ctx = cv.getContext("2d", { alpha: false })!;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const N = mobile ? 45 : 90;
    const imgs: (HTMLImageElement | null)[] = Array(N).fill(null);
    const order = [0, ...Array.from({ length: N }, (_, i) => i).filter((i) => i % 8 === 0 && i), ...Array.from({ length: N }, (_, i) => i)];
    const seen = new Set<number>();
    let dirty = true;
    let started = false;
    let alive = true;
    const loadNext = () => {
      if (!alive) return;
      const i = order.shift();
      if (i === undefined) return;
      if (seen.has(i)) return loadNext();
      seen.add(i);
      const img = new window.Image();
      img.src = `/media/tour/${room}/${mobile ? "m" : "d"}/${String(i + 1).padStart(3, "0")}.webp`;
      img.decode().then(
        () => {
          imgs[i] = img;
          dirty = true;
          loadNext();
        },
        () => loadNext()
      );
    };
    const nearest = (f: number) => {
      for (let d = 0; d < N; d++) {
        if (imgs[f - d]) return imgs[f - d];
        if (imgs[f + d]) return imgs[f + d];
      }
      return null;
    };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.round(cv.clientWidth * dpr);
      cv.height = Math.round(cv.clientHeight * dpr);
      dirty = true;
    };
    let raf = 0;
    let last = -1;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const f = Math.round(frame.current * (N - 1));
      if (!dirty && f === last) return;
      dirty = false;
      last = f;
      const img = nearest(f);
      if (!img) return;
      const s = Math.max(cv.width / img.naturalWidth, cv.height / img.naturalHeight);
      const w = img.naturalWidth * s;
      const h = img.naturalHeight * s;
      ctx.drawImage(img, (cv.width - w) / 2, (cv.height - h) / 2, w, h);
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started) {
          started = true;
          for (let k = 0; k < 5; k++) loadNext();
        }
        cancelAnimationFrame(raf);
        if (e.isIntersecting) raf = requestAnimationFrame(draw);
      },
      { rootMargin: "100% 0px" }
    );
    io.observe(root.current!);
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    return () => {
      alive = false;
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [room]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "+=180%",
          pin: true,
          scrub: true,
          onUpdate: (self) => (frame.current = self.progress),
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative h-[100svh] min-h-[520px] overflow-clip bg-black" aria-label={`Walk tour: ${title}`}>
      <Image src={`/media/video/int-${room}-poster.webp`} alt={`${title}: ${caption}`} fill sizes="100vw" className="object-cover" />
      <canvas ref={canvas} className="absolute inset-0 h-full w-full motion-reduce:hidden" aria-hidden />
      <div aria-hidden className="scrim-b pointer-events-none absolute inset-x-0 bottom-0 h-1/2" />
      <div className="gutter absolute inset-x-0 bottom-[10svh]">
        <p className="etichetta text-[0.6rem] text-ottone">A bordo</p>
        <h2 className="titolo mt-3 text-[clamp(2.4rem,6vw,5rem)] text-spuma">{title}</h2>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-spuma/75 md:text-base">{caption}</p>
      </div>
    </section>
  );
}
