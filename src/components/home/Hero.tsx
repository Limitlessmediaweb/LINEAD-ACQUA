"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP, MQ } from "@/lib/gsap";
import { on } from "@/lib/bus";
import { useFilmCaps } from "@/lib/useMedia";
import { glState, addRipple, now } from "@/components/gl/state";
import { ChapterTitle } from "./chapter";

const HeroWaterView = dynamic(() => import("@/components/gl/scenes").then((m) => m.HeroWaterView), { ssr: false });

/** Capitolo I — L'orizzonte. Video a tutto schermo, titolo gigante, acqua al cursore. */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const caps = useFilmCaps();
  const [glReady, setGlReady] = useState(false);

  useEffect(() => on("gl:heroReady", () => setGlReady(true)), []);

  // il video parte solo quando è visibile
  useEffect(() => {
    const v = video.current;
    if (!v || !caps.hydrated) return;
    glState.hero.video = v;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
    io.observe(v);
    return () => {
      io.disconnect();
      if (glState.hero.video === v) glState.hero.video = null;
    };
  }, [caps.hydrated, caps.mobile]);

  // increspature: il mouse sfiora l'acqua; su touch partono al tocco
  useEffect(() => {
    const el = root.current;
    if (!el || !caps.gl) return;
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
  }, [caps.gl]);

  useGSAP(
    () => {
      const fades = root.current!.querySelectorAll(".hero-fade");
      const split = new SplitText(".hero-titolo", { type: "lines,chars", mask: "lines", linesClass: "split-mask" });
      const reveal = () => {
        const r = window.matchMedia(MQ.reduced).matches;
        gsap
          .timeline({ defaults: { ease: "lusso" } })
          .from(split.chars, { yPercent: r ? 0 : 115, opacity: r ? 0 : 1, duration: r ? 1 : 1.8, stagger: r ? 0 : 0.032 }, 0.2)
          .from(fades, { opacity: 0, duration: 1.6, stagger: 0.15 }, r ? 0 : 1.2);
      };
      gsap.set(fades, { opacity: 1 });
      const html = document.documentElement;
      if (html.classList.contains("intro-attiva")) gsap.set(split.chars, { yPercent: 115 });
      let started = false;
      const start = () => {
        if (started) return;
        started = true;
        gsap.set(split.chars, { clearProps: "transform" });
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
        split.revert();
      };
    },
    { scope: root }
  );

  useEffect(() => {
    ScrollTrigger.refresh();
  }, [glReady]);

  const portrait = caps.mobile;
  return (
    <section ref={root} id="orizzonte" data-film className="relative h-[100svh] min-h-[560px] overflow-clip bg-transparent">
      {/* media DOM: poster (LCP) + video. In modalità WebGL il video è solo la sorgente della texture. */}
      <div
        className="hero-media absolute inset-0 transition-opacity duration-1000"
        style={{ opacity: caps.gl && glReady ? 0 : 1 }}
        aria-hidden={caps.gl && glReady}
      >
        <Image
          src="/media/hero-169.webp"
          alt="Lo yacht LDA 32 Aurora fende il mare al tramonto, ripreso dall'alto mentre lascia una lunga scia bianca"
          fill
          priority
          sizes="(min-width: 768px) 100vw, 1px"
          className="hidden object-cover md:block"
        />
        <Image
          src="/media/hero-916.webp"
          alt="Lo yacht LDA 32 Aurora visto dall'alto al tramonto, con la scia sul mare blu"
          fill
          priority
          sizes="(max-width: 767px) 100vw, 1px"
          className="object-cover md:hidden"
        />
        {caps.hydrated && (
          <video
            key={portrait ? "v" : "h"}
            ref={video}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            loop
            playsInline
            preload="metadata"
            poster={portrait ? "/media/video/hero-916-poster.webp" : "/media/video/hero-169-poster.webp"}
            aria-hidden
            tabIndex={-1}
          >
            <source src={`/media/video/${portrait ? "hero-916" : "hero-169"}.webm`} type="video/webm" />
            <source src={`/media/video/${portrait ? "hero-916" : "hero-169"}.mp4`} type="video/mp4" />
          </video>
        )}
      </div>
      {caps.gl && <HeroWaterView />}

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
