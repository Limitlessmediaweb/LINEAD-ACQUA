"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { emit } from "@/lib/bus";
import { useFilmCaps } from "@/lib/useMedia";
import { WORDMARK } from "@/lib/wordmark";
import { glState, now } from "@/components/gl/state";
import { getLenis } from "@/components/global/SmoothScroll";

const IntroWaterView = dynamic(() => import("@/components/gl/scenes").then((m) => m.IntroWaterView), { ssr: false });

const KEY = "lda-intro-vista";

/**
 * Intro (una volta per sessione): una linea in ottone si disegna, sotto diventa acqua,
 * il wordmark sale e si riflette, poi la linea si allarga e diventa l'orizzonte dell'hero.
 */
export function Intro() {
  const root = useRef<HTMLDivElement>(null);
  const lineWrap = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const caps = useFilmCaps();
  // acqua in WebGL solo su desktop; su mobile la versione CSS/SVG (leggera, LCP immediato)
  const glIntro = caps.gl && !caps.mobile;
  const tl = useRef<gsap.core.Timeline | null>(null);

  const finish = () => {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch {}
    document.documentElement.classList.remove("intro-attiva");
    glState.hero.fade = 1;
    getLenis()?.start();
    setActive(false);
  };

  useGSAP(
    () => {
      if (!caps.hydrated) return;
      const html = document.documentElement;
      let seen = false;
      try {
        seen = sessionStorage.getItem(KEY) === "1";
      } catch {}
      if (seen) {
        html.classList.remove("intro-attiva");
        glState.hero.fade = 1;
        emit("intro:done");
        setActive(false);
        return;
      }
      html.classList.add("intro-attiva");
      html.classList.toggle("intro-gl", glIntro);
      getLenis()?.stop();
      window.scrollTo(0, 0);
      glState.hero.fade = 0;
      glState.intro.water = 0;
      glState.intro.rise = 0;
      glState.intro.fade = 1;

      if (caps.reduced) {
        tl.current = gsap
          .timeline({ onComplete: finish })
          .from(".intro-statico", { opacity: 0, duration: 1.2, ease: "none" })
          .add(() => {
            html.classList.remove("intro-attiva");
            emit("intro:done");
          }, "+=1.4")
          .to(root.current, { opacity: 0, duration: 1, ease: "none" });
        return;
      }

      const horizon = () => {
        // posizione dell'orizzonte nel video hero (cover): ~17% su desktop, ~9% in verticale
        const portrait = window.innerHeight > window.innerWidth;
        return window.innerHeight * (portrait ? 0.1 : 0.17);
      };

      tl.current = gsap
        .timeline({ onComplete: finish })
        .fromTo(".intro-linea path", { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 1.5 }, 0.5)
        .call(() => {
          glState.intro.pulse = now();
        }, [], 1.95)
        .to(glState.intro, { water: 1, duration: 2.6, ease: "power2.out" }, 1.85)
        .fromTo(".intro-acqua-fallback", { opacity: 0 }, { opacity: 1, duration: 2 }, 1.9)
        .fromTo(".intro-word", { yPercent: 102 }, { yPercent: 0, duration: 2 }, 2.3)
        .to(glState.intro, { rise: 1, duration: 2 }, 2.3)
        .from(".intro-credito", { opacity: 0, y: 10, duration: 1.4 }, 3.3)
        .to(".intro-dissolvi", { opacity: 0, duration: 0.9 }, 5.1)
        .to(".intro-linea", { scaleX: () => (window.innerWidth / (lineWrap.current?.clientWidth || 1)) * 1.04, duration: 1.4 }, 5.1)
        .add(() => {
          html.classList.remove("intro-attiva");
          emit("intro:done");
        }, 5.9)
        .to(lineWrap.current, { top: horizon, duration: 1.6 }, 5.9)
        .to(glState.intro, { fade: 0, duration: 1.6 }, 5.9)
        .to(glState.hero, { fade: 1, duration: 1.6 }, 5.9)
        .to(".intro-acqua-fallback", { opacity: 0, duration: 1.2 }, 5.9)
        .to(lineWrap.current, { opacity: 0, duration: 1 }, 7.1);
    },
    { scope: root, dependencies: [caps.hydrated, glIntro] }
  );

  // pulizia se si lascia la home durante l'intro
  useEffect(
    () => () => {
      document.documentElement.classList.remove("intro-attiva");
      getLenis()?.start();
    },
    []
  );

  const skip = () => {
    if (!tl.current) return;
    tl.current.kill();
    document.documentElement.classList.remove("intro-attiva");
    emit("intro:done");
    gsap.to(glState.hero, { fade: 1, duration: 0.8 });
    gsap.to(root.current, { opacity: 0, duration: 0.8, ease: "lusso", onComplete: finish });
  };

  if (!active) return null;

  const aspect = WORDMARK.width / WORDMARK.capHeight;

  return (
    <div ref={root} id="intro" className={`fixed inset-0 z-[100] text-spuma transition-colors duration-[1600ms] ${glIntro ? "" : "intro-nero"}`} role="region" aria-label="Introduzione">
      {glIntro && <IntroWaterView word={word} line={lineWrap} />}

      {/* acqua di riserva senza WebGL: gradiente + riflesso SVG */}
      {!glIntro && !caps.reduced && (
        <div className="intro-acqua-fallback absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-b from-notte to-black opacity-0">
          <svg
            viewBox={`0 ${-WORDMARK.capHeight} ${WORDMARK.width} ${WORDMARK.capHeight}`}
            className="mx-auto block w-[min(72vw,760px)] origin-top scale-y-[-0.85] opacity-30 blur-[0.6px] [mask-image:linear-gradient(to_top,black,transparent)]"
            aria-hidden
          >
            <path d={WORDMARK.d} fill="currentColor" />
          </svg>
        </div>
      )}

      {/* wordmark: sale da sotto la linea */}
      <div
        className="intro-dissolvi intro-statico absolute bottom-1/2 left-1/2 w-[min(72vw,760px)] -translate-x-1/2 overflow-clip"
        style={{ aspectRatio: aspect }}
      >
        <div ref={word} className="intro-word h-full w-full">
          <svg viewBox={`0 ${-WORDMARK.capHeight} ${WORDMARK.width} ${WORDMARK.capHeight}`} className="block h-full w-full" aria-hidden>
            <path d={WORDMARK.d} fill="currentColor" />
          </svg>
        </div>
      </div>
      <p className="sr-only">LINEA D’ACQUA, cantiere navale italiano</p>

      {/* la linea */}
      <div ref={lineWrap} className="intro-statico absolute left-1/2 top-1/2 w-[min(80vw,820px)] -translate-x-1/2 -translate-y-1/2">
        <svg viewBox="0 0 1000 2" preserveAspectRatio="none" className="intro-linea block h-[2px] w-full origin-center" aria-hidden>
          <path d="M0 1 H1000" stroke="var(--color-ottone)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" fill="none" />
        </svg>
      </div>

      <p className="intro-dissolvi intro-credito intro-statico etichetta absolute left-1/2 top-[calc(50%+min(13vw,140px))] w-full -translate-x-1/2 text-center text-[0.62rem] text-sabbia">
        Un cantiere italiano — dal 1987 <span className="text-spuma/60">[dimostrativo]</span>
      </p>

      <button
        type="button"
        onClick={skip}
        className="intro-dissolvi etichetta absolute bottom-8 right-6 py-3 text-[0.6rem] text-spuma/60 transition-colors hover:text-spuma md:right-10"
      >
        Salta l’introduzione
      </button>
    </div>
  );
}
