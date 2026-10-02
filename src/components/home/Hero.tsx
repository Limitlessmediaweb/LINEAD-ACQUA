"use client";

import dynamic from "next/dynamic";
import { getImageProps } from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, SplitText, useGSAP, MQ } from "@/lib/gsap";
import { on } from "@/lib/bus";
import { useFilmCaps, useGLGate } from "@/lib/useMedia";
import { glState, addRipple, now } from "@/components/gl/state";
import { ChapterTitle } from "./chapter";

const HeroWaterView = dynamic(() => import("@/components/gl/scenes").then((m) => m.HeroWaterView), { ssr: false });

const common = { alt: "", fill: true, priority: true, quality: 60, sizes: "100vw" } as const;
const { props: posterDesktop } = getImageProps({ ...common, src: "/media/hero-169.webp" });
const { props: posterMobile } = getImageProps({ ...common, src: "/media/hero-916.webp" });

/** Capitolo I — L'orizzonte. Video a tutto schermo, titolo gigante, acqua al cursore. */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const caps = useFilmCaps();
  const gl = useGLGate();
  const [glReady, setGlReady] = useState(false);

  useEffect(() => on("gl:heroReady", () => setGlReady(true)), []);

  // il video parte solo quando è visibile
  useEffect(() => {
    const v = video.current;
    if (!v || !caps.hydrated) return;
    glState.hero.video = v;
    // durante l'intro il video non si scarica: parte quando l'hero si vede davvero
    let visible = false;
    const tryPlay = () => {
      if (visible && !document.documentElement.classList.contains("intro-attiva")) v.play().catch(() => {});
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) tryPlay();
      else v.pause();
    });
    io.observe(v);
    const off = on("intro:done", tryPlay);
    return () => {
      off();
      io.disconnect();
      if (glState.hero.video === v) glState.hero.video = null;
    };
  }, [caps.hydrated, caps.mobile]);

  // increspature: il mouse sfiora l'acqua; su touch partono al tocco
  useEffect(() => {
    const el = root.current;
    if (!el || !gl) return;
    let last = 0;
    let lx = 0;
    let ly = 0;
    const toUv = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      return [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height] as const;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const t = performance.now();
      const dist = Math.hypot(e.clientX - lx, e.clientY - ly);
      if (t - last < 70 || dist < 18) return;
      last = t;
      lx = e.clientX;
      ly = e.clientY;
      const [x, y] = toUv(e);
      addRipple(x, y, now(), Math.min(1, 0.35 + dist / 160));
    };
    const down = (e: PointerEvent) => {
      const [x, y] = toUv(e);
      addRipple(x, y, now(), 1.2);
    };
    el.addEventListener("pointermove", move, { passive: true });
    el.addEventListener("pointerdown", down, { passive: true });
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerdown", down);
    };
  }, [gl]);

  useGSAP(
    () => {
      const fades = root.current!.querySelectorAll(".hero-fade");
      // su mobile il titolo resta intero: è l'LCP e lo SplitText ne creerebbe di nuovi, più tardi
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      const split = mobile ? null : new SplitText(".hero-titolo", { type: "lines,chars", mask: "lines", linesClass: "split-mask" });
      const html = document.documentElement;
      // Su mobile l'intro è un velo nero sopra l'hero già composto: il titolo è lì sotto e
      // compare con la dissolvenza del velo (e resta l'LCP della pagina, subito dipinto).
      const veiled = html.classList.contains("intro-attiva") && window.matchMedia("(max-width: 767px)").matches;
      const reveal = () => {
        const r = window.matchMedia(MQ.reduced).matches;
        const tl = gsap.timeline({ defaults: { ease: "lusso" } });
        if (split && !veiled) tl.from(split.chars, { yPercent: r ? 0 : 115, opacity: r ? 0 : 1, duration: r ? 1 : 1.8, stagger: r ? 0 : 0.032 }, 0.2);
        tl.from(fades, { opacity: 0, duration: 1.6, stagger: 0.15 }, r || !split || veiled ? 0.4 : 1.2);
      };
      gsap.set(fades, { opacity: 1 });
      if (split && html.classList.contains("intro-attiva") && !veiled) gsap.set(split.chars, { yPercent: 115 });
      let started = false;
      const start = () => {
        if (started) return;
        started = true;
        if (split) gsap.set(split.chars, { clearProps: "transform" });
        reveal();
      };
      const off = on("intro:done", start);
      // se l'intro non c'è (già vista o navigazione interna) si parte subito
      const id = window.setTimeout(() => {
        if (!html.classList.contains("intro-attiva")) start();
      }, 120);

      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: "+=75%",
              pin: true,
              scrub: 1.2,
              onUpdate: (self) => {
                const v = video.current;
                if (v) v.playbackRate = Math.max(0.3, 1 - self.progress * 0.75);
              },
            },
          })
          .to(glState.hero, { zoom: 0.16, ease: "none" }, 0)
          .to(".hero-media", { scale: 1.16, ease: "none" }, 0)
          .to(".hero-testo", { yPercent: -55, opacity: 0, ease: "lusso" }, 0)
          .to(".hero-scroll", { opacity: 0, ease: "none", duration: 0.2 }, 0);
      });
      return () => {
        off();
        clearTimeout(id);
        mm.revert();
        split?.revert();
      };
    },
    { scope: root }
  );

  const portrait = caps.mobile;
  return (
    <section ref={root} id="orizzonte" data-film className="relative h-[100svh] min-h-[560px] overflow-clip bg-transparent">
      {/* media DOM: poster (LCP) + video. In modalità WebGL il video è solo la sorgente della texture. */}
      <div
        className="hero-media absolute inset-0 transition-opacity duration-1000"
        style={{ opacity: gl && glReady ? 0 : 1 }}
        aria-hidden={gl && glReady}
      >
        {/* art direction: un solo poster scaricato, verticale su telefono */}
        <picture>
          <source media="(min-width: 768px)" srcSet={posterDesktop.srcSet} sizes="100vw" />
          <img
            {...posterMobile}
            alt="Lo yacht LDA 32 Aurora fende il mare al tramonto, ripreso dall'alto mentre lascia una lunga scia bianca"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
        {caps.hydrated && (
          <video
            key={portrait ? "v" : "h"}
            ref={video}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            loop
            playsInline
            preload="none"
            poster={portrait ? "/media/video/hero-916-poster.webp" : "/media/video/hero-169-poster.webp"}
            aria-hidden
            tabIndex={-1}
          >
            <source src={`/media/video/${portrait ? "hero-916" : "hero-169"}.webm`} type="video/webm" />
            <source src={`/media/video/${portrait ? "hero-916" : "hero-169"}.mp4`} type="video/mp4" />
          </video>
        )}
      </div>
      {gl && <HeroWaterView />}

      <div aria-hidden className="scrim-t pointer-events-none absolute inset-x-0 top-0 h-1/2" />
      <div aria-hidden className="scrim-b pointer-events-none absolute inset-x-0 bottom-0 h-2/3" />

      <div className="hero-testo gutter pointer-events-none absolute inset-x-0 bottom-[14svh] md:bottom-[13svh]">
        <ChapterTitle n={1} className="hero-fade mb-6 md:mb-8" />
        <h1 className="hero-titolo titolo text-[clamp(3.3rem,12.5vw,11.5rem)] text-spuma">
          Tutto inizia
          <br />
          da una <em className="font-light italic text-sabbia">linea.</em>
        </h1>
      </div>

      <div className="hero-scroll hero-fade etichetta pointer-events-none absolute bottom-[8svh] right-[var(--gutter)] flex items-center gap-4 text-[0.6rem] text-spuma/70">
        <span>Scorrete</span>
        <span aria-hidden className="relative block h-px w-14 overflow-clip bg-spuma/20">
          <span className="absolute inset-y-0 left-0 w-1/2 animate-[scorri_2.8s_var(--ease-lusso)_infinite] bg-ottone" />
        </span>
      </div>
      <style>{`@keyframes scorri{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}@media (prefers-reduced-motion: reduce){.hero-scroll span span{animation:none}}`}</style>
    </section>
  );
}
