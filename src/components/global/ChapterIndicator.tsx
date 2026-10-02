"use client";

import { useEffect, useState } from "react";
import { on } from "@/lib/bus";
import { armTo } from "@/components/home/chapter";
import { ScrollTrigger } from "@/lib/gsap";
import { CHAPTERS } from "@/lib/data";
import { getLenis } from "./SmoothScroll";

/** Numeri romani verticali a sinistra: il capitolo attivo si illumina. */
export function ChapterIndicator() {
  const [active, setActive] = useState(0);
  useEffect(() => on("chapter:active", setActive), []);

  const go = (id: string) => {
    armTo(99);
    // due fotogrammi: i capitoli creano i loro pin, poi si ricalcola e si scorre
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        ScrollTrigger.refresh();
        const el = document.getElementById(id);
        if (!el) return;
        const target = el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el;
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(target, { duration: 2.4 });
        else target.scrollIntoView();
      })
    );
  };

  return (
    <nav
      aria-label="Capitoli del film"
      className="fixed left-4 top-1/2 z-[70] hidden -translate-y-1/2 transition-opacity duration-1000 lg:block"
      style={{ opacity: active > 1 ? 1 : 0, pointerEvents: active > 1 ? "auto" : "none" }}
    >
      <ol className="flex flex-col gap-2.5">
        {CHAPTERS.map((c) => (
          <li key={c.n}>
            <button
              type="button"
              onClick={() => go(c.id)}
              aria-current={active === c.n ? "step" : undefined}
              aria-label={`Capitolo ${c.roman}: ${c.title}`}
              className="group flex items-center gap-3 py-0.5"
            >
              <span
                className={`numero w-7 text-right text-[0.85rem] transition-colors duration-700 ${
                  active === c.n ? "text-ottone" : "text-spuma/35 group-hover:text-spuma/75"
                }`}
              >
                {c.roman}
              </span>
              <span
                aria-hidden
                className="h-px bg-ottone transition-[width] duration-1000 [transition-timing-function:var(--ease-lusso)]"
                style={{ width: active === c.n ? 18 : 0 }}
              />
              <span aria-hidden className="etichetta text-[0.62rem] text-spuma/0 transition-colors duration-700 group-hover:text-spuma/70">
                {c.title}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}
