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

// ───────────── Cancello WebGL ─────────────
// Su desktop gli shader partono subito (servono all'intro). Su mobile three.js si carica
// alla prima interazione (tocco, rotella, tasto): il primo caricamento resta leggero e veloce.
let interacted = false;
const glListeners = new Set<() => void>();
let armed = false;
function armGate() {
  if (armed || typeof window === "undefined") return;
  armed = true;
  const evs = ["pointerdown", "touchstart", "wheel", "keydown"] as const;
  const go = () => {
    evs.forEach((e) => window.removeEventListener(e, go));
    interacted = true;
    glListeners.forEach((l) => l());
  };
  evs.forEach((e) => window.addEventListener(e, go, { passive: true }));
}

/** true quando gli shader possono essere caricati (vedi sopra). */
export function useGLGate() {
  const caps = useFilmCaps();
  const touched = useSyncExternalStore(
    (cb) => {
      armGate();
      glListeners.add(cb);
      return () => {
        glListeners.delete(cb);
      };
    },
    () => interacted,
    () => false
  );
  return caps.gl && (!caps.mobile || touched);
}
