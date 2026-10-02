"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, MQ } from "@/lib/gsap";

/** Cerchio sottile in ottone che segue con inerzia. Solo con puntatore fine. */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = ring.current!;
    document.documentElement.classList.add("has-cursor");
    const reduced = window.matchMedia(MQ.reduced).matches;
    const d = reduced ? 0.01 : 0.55;
    const xTo = gsap.quickTo(el, "x", { duration: d, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: d, ease: "power3.out" });
    let state = "";
    let shown = false;

    const setState = (s: string) => {
      if (s === state) return;
      state = s;
      const size = s === "scopri" ? 92 : s === "link" ? 56 : 26;
      gsap.to(el, {
        width: size,
        height: size,
        backgroundColor: s === "scopri" ? "rgba(6,11,18,0.35)" : "rgba(0,0,0,0)",
        duration: 0.7,
        ease: "lusso",
      });
      gsap.to(label.current, { opacity: s === "scopri" ? 1 : 0, duration: 0.5 });
    };

    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!shown) {
        shown = true;
        gsap.set(el, { x: e.clientX, y: e.clientY });
        gsap.to(el, { opacity: 1, duration: 0.6 });
      }
      xTo(e.clientX);
      yTo(e.clientY);
      const t = e.target as HTMLElement | null;
      const cursorTarget = t?.closest<HTMLElement>("[data-cursor]");
      if (cursorTarget) setState(cursorTarget.dataset.cursor || "link");
      else if (t?.closest("a, button, [role=button], input, select, textarea, label")) setState("link");
      else setState("");
    };
    const leave = () => {
      shown = false;
      gsap.to(el, { opacity: 0, duration: 0.4 });
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  // reset dello stato a ogni cambio pagina
  useEffect(() => {
    gsap.set(ring.current, { width: 26, height: 26, backgroundColor: "rgba(0,0,0,0)" });
    gsap.set(label.current, { opacity: 0 });
  }, [pathname]);

  return (
    <div
      ref={ring}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[95] hidden size-[26px] items-center justify-center rounded-full border border-ottone opacity-0 backdrop-blur-[1px] [@media(pointer:fine)]:flex"
      style={{ translate: "-50% -50%" }}
    >
      <span ref={label} className="etichetta text-[0.62rem] text-spuma opacity-0">
        Scopri
      </span>
    </div>
  );
}
