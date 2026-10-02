// Stato condiviso tra DOM (GSAP) e scene WebGL. GSAP anima direttamente questi oggetti,
// le scene li leggono in useFrame: nessun re-render React durante lo scroll.

export const glState = {
  intro: {
    /** 0-1: comparsa dell'acqua sotto la linea */
    water: 0,
    /** 0-1: il wordmark sale sopra la linea (il riflesso lo segue) */
    rise: 0,
    /** 1 = intro visibile, 0 = dissolta */
    fade: 1,
    /** tempo dell'ultima "goccia" sulla linea */
    pulse: -10,
  },
  hero: {
    video: null as HTMLVideoElement | null,
    /** 0-1 opacità della scena (dissolve dall'intro) */
    fade: 1,
    /** zoom lento allo scroll */
    zoom: 0,
    /** increspature: x, y (uv 0-1), tempo d'inizio, intensità */
    ripples: Array.from({ length: 12 }, () => [0, 0, -100, 0] as [number, number, number, number]),
    rippleIndex: 0,
  },
  dive: {
    /** 0 = sopra la superficie, 1 = completamente sott'acqua */
    progress: 0,
  },
  rise: {
    /** footer: 0 = sott'acqua, 1 = di nuovo in superficie */
    progress: 0,
  },
};

export function addRipple(x: number, y: number, time: number, strength = 1) {
  const h = glState.hero;
  h.ripples[h.rippleIndex] = [x, y, time, strength];
  h.rippleIndex = (h.rippleIndex + 1) % h.ripples.length;
}

// Registro delle scene visibili: il Canvas va in pausa quando nessuna lo è.
const visible = new Set<string>();
const listeners = new Set<(any: boolean) => void>();

export function setSceneVisible(id: string, isVisible: boolean) {
  if (isVisible) visible.add(id);
  else visible.delete(id);
  listeners.forEach((l) => l(visible.size > 0));
}

export function onAnyVisible(fn: (any: boolean) => void) {
  listeners.add(fn);
  fn(visible.size > 0);
  return () => {
    listeners.delete(fn);
  };
}

/** Il tempo di riferimento delle scene (secondi), condiviso con il DOM per le increspature. */
export const clock = { start: typeof performance !== "undefined" ? performance.now() : 0 };
export const now = () => (performance.now() - clock.start) / 1000;
