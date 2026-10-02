"use client";

import { useEffect, type RefObject } from "react";
import { setSceneVisible } from "./state";

/** Segnala allo stage se l'elemento della scena è (quasi) a schermo. */
export function useSceneVisibility(id: string, ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSceneVisible(id, e.isIntersecting), { rootMargin: "10% 0px" });
    io.observe(el);
    return () => {
      io.disconnect();
      setSceneVisible(id, false);
    };
  }, [id, ref]);
}
