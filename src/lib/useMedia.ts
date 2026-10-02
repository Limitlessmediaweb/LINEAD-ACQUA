"use client";

import { useSyncExternalStore } from "react";

/** matchMedia reattivo, sicuro in SSR (sul server restituisce `server`). */
export function useMedia(query: string, server = false) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => server
  );
}

let webgl: boolean | undefined;
function hasWebGL() {
  if (webgl === undefined) {
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
  }
  return webgl;
}

const noop = () => () => {};

/** Il film usa gli shader solo se c'è WebGL e l'utente non ha chiesto meno movimento. */
export function useFilmCaps() {
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const mobile = useMedia("(max-width: 767px)");
  const fine = useMedia("(pointer: fine)");
  const gl = useSyncExternalStore(noop, hasWebGL, () => false);
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  return { reduced, mobile, fine, gl: gl && !reduced && hydrated, hydrated };
}
