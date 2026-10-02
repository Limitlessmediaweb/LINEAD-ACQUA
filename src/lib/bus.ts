// Piccolo bus di eventi globale (letterbox, audio, intro) senza dipendenze.
type Handler<T> = (payload: T) => void;

export type Events = {
  /** chiude leggermente le bande e le riapre (cambio capitolo) */
  "letterbox:pulse": void;
  /** imposta l'altezza di base delle bande in px */
  "letterbox:base": number;
  /** 0 = superficie, 1 = completamente sott'acqua (per l'audio) */
  "audio:depth": number;
  "intro:done": void;
  "menu:toggle": boolean;
  /** capitolo attivo nella home (1-8, 0 = nessuno) */
  "chapter:active": number;
  /** la texture video dell'hero è pronta in WebGL */
  "gl:heroReady": void;
  /** capitoli armati fino a questo numero (1-8); 99 = tutti */
  "film:armTo": number;
};

const map = new Map<keyof Events, Set<Handler<never>>>();
// ultimo valore emesso: chi si iscrive dopo lo riceve subito (eventi "di stato")
const last = new Map<keyof Events, unknown>();
const STICKY: (keyof Events)[] = ["letterbox:base", "chapter:active", "film:armTo"];

export function on<K extends keyof Events>(key: K, fn: Handler<Events[K]>) {
  if (!map.has(key)) map.set(key, new Set());
  map.get(key)!.add(fn as Handler<never>);
  if (STICKY.includes(key) && last.has(key)) fn(last.get(key) as Events[K]);
  return () => {
    map.get(key)?.delete(fn as Handler<never>);
  };
}

export function emit<K extends keyof Events>(key: K, ...payload: Events[K] extends void ? [] : [Events[K]]) {
  last.set(key, payload[0]);
  map.get(key)?.forEach((fn) => (fn as Handler<unknown>)(payload[0]));
}
