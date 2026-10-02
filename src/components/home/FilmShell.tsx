"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { emit } from "@/lib/bus";
import { ScrollTrigger } from "@/lib/gsap";
import { CHAPTERS } from "@/lib/data";
import { useFilmCaps } from "@/lib/useMedia";
import { ChapterIndicator } from "@/components/global/ChapterIndicator";

const GLStage = dynamic(() => import("@/components/gl/GLStage"), { ssr: false });

/** Infrastruttura del film: stage WebGL condiviso, bande letterbox, indicatore dei capitoli. */
export function FilmShell() {
  const caps = useFilmCaps();

  // tutti i pin sono montati: si ricalcolano le posizioni nell'ordine del documento
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // bande letterbox di base
  useEffect(() => {
    const set = () =>
      emit("letterbox:base", window.innerWidth < 768 ? Math.round(window.innerHeight * 0.035) : Math.round(window.innerHeight * 0.06));
    set();
    window.addEventListener("resize", set);
    return () => {
      window.removeEventListener("resize", set);
      emit("letterbox:base", 0);
    };
  }, []);

  // capitolo attivo: quello che occupa il centro dello schermo (pin-spacer compreso)
  useEffect(() => {
    let current = -1;
    let raf = 0;
    const check = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      let active = 0;
      for (const c of CHAPTERS) {
        const el = document.getElementById(c.id);
        if (!el) continue;
        const box = (el.parentElement?.classList.contains("pin-spacer") ? el.parentElement : el).getBoundingClientRect();
        if (box.top <= mid && box.bottom > mid) {
          active = c.n;
          break;
        }
      }
      if (active !== current) {
        if (current !== -1 && active > 0) emit("letterbox:pulse");
        current = active;
        emit("chapter:active", active);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(check);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    check();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
      emit("chapter:active", 0);
    };
  }, []);

  return (
    <>
      {caps.gl && <GLStage />}
      <ChapterIndicator />
    </>
  );
}
