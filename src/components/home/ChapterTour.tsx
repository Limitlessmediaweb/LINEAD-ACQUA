"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, useGSAP, MQ } from "@/lib/gsap";
import { emit } from "@/lib/bus";
import { ROOMS } from "@/lib/data";
import { useFilmCaps } from "@/lib/useMedia";
import { ChapterTitle } from "./chapter";

const FRAME = { w: 16, h: 9 };

/**
 * Sequenze a fotogrammi su <canvas>: precaricamento progressivo
 * (fotogramma 0 di ogni stanza, poi uno ogni 8, poi il resto) e, se un fotogramma
 * non è ancora arrivato, si disegna il più vicino già caricato.
 */
class FrameBank {
  imgs: (HTMLImageElement | null)[][];
  ok: boolean[][];
  private queue: [number, number][] = [];
  private running = 0;
  private started = false;
  onLoad: () => void = () => {};

  constructor(private rooms: string[], public count: number, private variant: "d" | "m") {
    this.imgs = rooms.map(() => Array(count).fill(null));
    this.ok = rooms.map(() => Array(count).fill(false));
  }

  url(r: number, f: number) {
    return `/media/tour/${this.rooms[r]}/${this.variant}/${String(f + 1).padStart(3, "0")}.webp`;
  }

  start() {
    if (this.started) return;
    this.started = true;
    const seen = new Set<string>();
    const push = (r: number, f: number) => {
      const k = `${r}-${f}`;
      if (!seen.has(k)) {
        seen.add(k);
        this.queue.push([r, f]);
      }
    };
    this.rooms.forEach((_, r) => push(r, 0));
    this.rooms.forEach((_, r) => {
      for (let f = 8; f < this.count; f += 8) push(r, f);
    });
    this.rooms.forEach((_, r) => {
      for (let f = 0; f < this.count; f++) push(r, f);
    });
    for (let i = 0; i < 6; i++) this.next();
  }

  private next() {
    const job = this.queue.shift();
    if (!job) return;
    const [r, f] = job;
    this.running++;
    const img = new window.Image();
    img.decoding = "async";
    img.src = this.url(r, f);
    const done = (ok: boolean) => {
      this.running--;
      if (ok) {
        this.imgs[r][f] = img;
        this.ok[r][f] = true;
        this.onLoad();
      }
      this.next();
    };
    img.decode().then(() => done(true), () => done(false));
  }

  nearest(r: number, f: number) {
    const ok = this.ok[r];
    for (let d = 0; d < this.count; d++) {
      if (f - d >= 0 && ok[f - d]) return this.imgs[r][f - d];
      if (f + d < this.count && ok[f + d]) return this.imgs[r][f + d];
    }
    return null;
  }
}

function coverRect(cw: number, ch: number) {
  const s = Math.max(cw / FRAME.w, ch / FRAME.h);
  const w = FRAME.w * s;
  const h = FRAME.h * s;
  return { x: (cw - w) / 2, y: (ch - h) / 2, w, h };
}

/** Capitolo IV — A bordo: sembra di camminare dentro lo yacht. */
export function ChapterTour() {
  const root = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const caps = useFilmCaps();

  const state = useRef({ room: 0, frame: 0, fade: 0, dirty: true });
  const bank = useRef<FrameBank | null>(null);

  // banca dei fotogrammi + render loop (solo quando serve)
  useEffect(() => {
    if (caps.reduced || !caps.hydrated) return;
    const cv = canvas.current!;
    const ctx = cv.getContext("2d", { alpha: false })!;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const b = new FrameBank(
      ROOMS.map((r) => r.id),
      mobile ? 45 : 90,
      mobile ? "m" : "d"
    );
    bank.current = b;
    b.onLoad = () => (state.current.dirty = true);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      cv.width = Math.round(cv.clientWidth * dpr);
      cv.height = Math.round(cv.clientHeight * dpr);
      state.current.dirty = true;
      placeLabels();
    };

    const placeLabels = () => {
      const rect = coverRect(cv.clientWidth, cv.clientHeight);
      root.current?.querySelectorAll<SVGElement>("[data-label]").forEach((g) => {
        const [x, y, lx, ly] = (g.dataset.label || "").split(",").map(Number);
        const px = rect.x + x * rect.w;
        const py = rect.y + y * rect.h;
        const qx = rect.x + lx * rect.w;
        const qy = rect.y + ly * rect.h;
        g.querySelector("line")?.setAttribute("x1", String(px));
        g.querySelector("line")?.setAttribute("y1", String(py));
        g.querySelector("line")?.setAttribute("x2", String(qx));
        g.querySelector("line")?.setAttribute("y2", String(qy));
        g.querySelector("circle")?.setAttribute("cx", String(px));
        g.querySelector("circle")?.setAttribute("cy", String(py));
        const t = g.querySelector<SVGTextElement>("text");
        if (t) {
          const W = cv.clientWidth;
          let right = qx > px;
          if (!right && qx < 240) right = true;
          if (right && qx > W - 240) right = false;
          t.setAttribute("x", String(qx + (right ? 10 : -10)));
          t.setAttribute("y", String(qy + 4));
          t.setAttribute("text-anchor", right ? "start" : "end");
        }
      });
    };

    let raf = 0;
    let visible = false;
    const draw = () => {
      raf = requestAnimationFrame(draw);
      const s = state.current;
      if (!s.dirty) return;
      s.dirty = false;
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, cv.width, cv.height);
      const img = b.nearest(s.room, Math.round(s.frame));
      if (img) {
        const r = coverRect(cv.width, cv.height);
        ctx.globalAlpha = 1 - s.fade;
        ctx.drawImage(img, r.x, r.y, r.w, r.h);
        ctx.globalAlpha = 1;
      }
    };
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) b.start();
        const now = e.intersectionRatio > 0 && e.isIntersecting;
        if (now && !visible) {
          visible = true;
          raf = requestAnimationFrame(draw);
        } else if (!now && visible) {
          visible = false;
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "150% 0px" }
    );
    io.observe(root.current!);
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    resize();
    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [caps.reduced, caps.hydrated]);

  useGSAP(
    () => {
      const rooms = gsap.utils.toArray<HTMLElement>(".tour-stanza");
      const n = ROOMS.length;
      let current = -1;
      const setRoom = (i: number) => {
        if (i === current) return;
        current = i;
        rooms.forEach((el, k) => el.toggleAttribute("data-attiva", k === i));
        if (i >= 0) emit("letterbox:pulse");
      };
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        const st = ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: () => `+=${window.innerHeight * (window.innerWidth < 768 ? 4 : 5)}`,
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            const p = self.progress * n;
            const r = Math.min(n - 1, Math.floor(p));
            const t = p - r;
            const s = state.current;
            const count = bank.current?.count ?? 90;
            s.room = r;
            s.frame = Math.min(count - 1, t * (count - 1));
            // dissolvenza attraverso il nero ai confini tra le stanze
            const edge = 0.07;
            s.fade = r > 0 && t < edge ? 1 - t / edge : r < n - 1 && t > 1 - edge ? (t - (1 - edge)) / edge : 0;
            s.dirty = true;
            setRoom(t > 0.1 && t < 0.92 ? r : -1);
          },
          onLeave: () => setRoom(-1),
          onLeaveBack: () => setRoom(-1),
        });
        return () => st.kill();
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  if (caps.reduced) {
    return (
      <section ref={root} id="bordo" data-film className="gutter relative space-y-16 bg-black py-28" aria-labelledby="bordo-titolo">
        <ChapterTitle n={4} />
        <h2 id="bordo-titolo" className="titolo text-[clamp(2.4rem,6vw,5rem)]">A bordo.</h2>
        {ROOMS.map((r) => (
          <figure key={r.id} className="space-y-4">
            <div className="relative aspect-video overflow-clip">
              <Image src={r.poster} alt={`${r.name}: ${r.caption}`} fill sizes="92vw" className="object-cover" />
            </div>
            <figcaption>
              <span className="titolo text-3xl">{r.name}</span>
              <span className="etichetta ml-4 text-sabbia">{r.labels.map((l) => l.text).join(" · ")}</span>
            </figcaption>
          </figure>
        ))}
      </section>
    );
  }

  return (
    <section ref={root} id="bordo" data-film className="relative h-[100svh] min-h-[560px] overflow-clip bg-black" aria-labelledby="bordo-titolo">
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" role="img" aria-label="Percorso a bordo: salone, cabina armatoriale, ponte di poppa" />
      <div aria-hidden className="scrim-b pointer-events-none absolute inset-x-0 bottom-0 h-1/2" />
      <div aria-hidden className="scrim-t pointer-events-none absolute inset-x-0 top-0 h-1/3" />

      <div className="gutter absolute inset-x-0 top-[13svh]">
        <ChapterTitle n={4} />
        <h2 id="bordo-titolo" className="sr-only">
          A bordo: il salone, la cabina armatoriale e il ponte di poppa
        </h2>
      </div>

      {ROOMS.map((r, i) => (
        <div key={r.id} className="tour-stanza group pointer-events-none absolute inset-0">
          <svg className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            {r.labels.map((l, k) => (
              <g key={k} data-label={`${l.x},${l.y},${l.lx},${l.ly}`}>
                <line
                  stroke="var(--color-ottone)"
                  strokeWidth="1"
                  pathLength={1}
                  strokeDasharray="1"
                  className="[stroke-dashoffset:1] transition-[stroke-dashoffset] duration-[1400ms] [transition-timing-function:var(--ease-lusso)] group-data-[attiva]:[stroke-dashoffset:0]"
                  style={{ transitionDelay: `${0.25 + k * 0.18}s` }}
                />
                <circle r="3" fill="var(--color-ottone)" className="opacity-0 transition-opacity duration-700 group-data-[attiva]:opacity-100" style={{ transitionDelay: `${0.2 + k * 0.18}s` }} />
                <text
                  className="etichetta fill-spuma opacity-0 transition-opacity duration-1000 group-data-[attiva]:opacity-100"
                  style={{ fontSize: "0.62rem", letterSpacing: "0.3em", transitionDelay: `${0.8 + k * 0.18}s` }}
                >
                  {l.text.toUpperCase()}
                </text>
              </g>
            ))}
          </svg>
          <div className="gutter absolute inset-x-0 bottom-[11svh] translate-y-3 opacity-0 transition-[opacity,translate] duration-[1400ms] [transition-timing-function:var(--ease-lusso)] group-data-[attiva]:translate-y-0 group-data-[attiva]:opacity-100">
            <p className="numero text-sm text-ottone">0{i + 1} / 03</p>
            <h3 className="titolo mt-2 text-[clamp(2.4rem,6vw,5.2rem)] text-spuma">{r.name}</h3>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-spuma/75 md:text-base">{r.caption}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
