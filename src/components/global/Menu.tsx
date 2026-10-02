"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap, SplitText, useGSAP, MQ } from "@/lib/gsap";
import { NAV, MODELS, SITE } from "@/lib/data";
import { getLenis } from "./SmoothScroll";

const ROMAN = ["I", "II", "III", "IV"];

/** Menu a tutto schermo: due bande che si chiudono al centro, come il letterbox. */
export function Menu({ open, onClose, armed }: { open: boolean; onClose: () => void; armed: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [hover, setHover] = useState(0);
  const pathname = usePathname();
  const mounted = useRef(false);

  useGSAP(
    () => {
      if (!armed) return;
      const r = window.matchMedia(MQ.reduced).matches;
      const split = new SplitText(".menu-voce", { type: "chars", mask: "chars" });
      tl.current = gsap
        .timeline({ paused: true, defaults: { ease: "lusso" } })
        .set(root.current, { visibility: "visible" })
        .fromTo(".menu-banda-t", { scaleY: 0 }, { scaleY: 1, duration: r ? 0.01 : 1.1 }, 0)
        .fromTo(".menu-banda-b", { scaleY: 0 }, { scaleY: 1, duration: r ? 0.01 : 1.1 }, 0)
        .fromTo(".menu-sfondo", { opacity: 0 }, { opacity: 1, duration: r ? 0.01 : 1.2 }, r ? 0 : 0.6)
        .from(split.chars, { yPercent: 110, duration: r ? 0.01 : 1.2, stagger: r ? 0 : 0.022 }, r ? 0 : 0.7)
        .from(".menu-fade", { opacity: 0, y: r ? 0 : 12, duration: r ? 0.01 : 1, stagger: r ? 0 : 0.08 }, r ? 0 : 1);
      if (open) tl.current.play();
      return () => split.revert();
    },
    { scope: root, dependencies: [armed] }
  );

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const lenis = getLenis();
    const main = document.getElementById("contenuto");
    if (open) {
      lenis?.stop();
      tl.current?.timeScale(1).play();
      main?.setAttribute("inert", "");
      requestAnimationFrame(() => root.current?.querySelector<HTMLElement>("a")?.focus());
    } else {
      lenis?.start();
      tl.current?.timeScale(1.6).reverse();
      main?.removeAttribute("inert");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);

  // chiusura a ogni navigazione
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  return (
    <div
      ref={root}
      id="menu-principale"
      role="dialog"
      aria-modal="true"
      aria-label="Menu principale"
      aria-hidden={!open}
      inert={!open}
      className="invisible fixed inset-0 z-[72]"
    >
      <div className="menu-banda-t absolute inset-x-0 top-0 h-1/2 origin-top bg-abisso" />
      <div className="menu-banda-b absolute inset-x-0 bottom-0 h-1/2 origin-bottom bg-abisso" />
      <div className="menu-sfondo absolute inset-0">
        {armed &&
          NAV.map((n, i) => (
          <Image
            key={n.href}
            src={n.img}
            alt=""
            fill
            sizes="100vw"
            className="object-cover transition-opacity duration-[1400ms] [transition-timing-function:var(--ease-lusso)]"
            style={{ opacity: hover === i ? 0.3 : 0 }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-abisso via-abisso/75 to-abisso/25" />
      </div>
      <div className="gutter relative flex h-full flex-col justify-center gap-12 pt-16 md:flex-row md:items-center md:justify-between">
        <nav aria-label="Principale">
          <ul className="space-y-1 md:space-y-2">
            {NAV.map((n, i) => (
              <li key={n.href}>
                <Link
                  prefetch={false}
                  href={n.href}
                  onMouseEnter={() => setHover(i)}
                  onFocus={() => setHover(i)}
                  onClick={onClose}
                  aria-current={pathname === n.href ? "page" : undefined}
                  className="group flex items-baseline gap-5"
                >
                  <span className="numero menu-fade w-8 text-sm text-ottone">{ROMAN[i]}</span>
                  <span className="menu-voce titolo text-[clamp(2.8rem,8vw,7.5rem)] text-spuma/80 transition-colors duration-700 group-hover:text-spuma">
                    {n.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="menu-fade space-y-6 md:w-80">
          <p className="etichetta text-sabbia">La flotta</p>
          <ul>
            {MODELS.map((m) => (
              <li key={m.slug}>
                <Link
                  prefetch={false}
                  href={`/flotta/${m.slug}`}
                  onClick={onClose}
                  className="flex items-baseline justify-between border-b border-spuma/10 py-3 text-sm text-spuma/75 transition-colors duration-500 hover:text-spuma"
                >
                  <span>
                    {m.code} <span className="font-serif text-lg italic">{m.name}</span>
                  </span>
                  <span className="numero text-ottone">{m.length} m</span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-xs leading-relaxed text-spuma/55">
            Cantiere navale immaginario. Concept realizzato da{" "}
            <a href={SITE.limitlessUrl} className="underline decoration-ottone underline-offset-4" target="_blank" rel="noopener">
              LIMITLESS
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
