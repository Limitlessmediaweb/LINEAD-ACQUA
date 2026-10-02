"use client";

import { useEffect, useRef, useState } from "react";
import { on } from "@/lib/bus";

/**
 * Ambiente sonoro procedurale (Web Audio): onde lente + vento.
 * Nessun file audio da scaricare. Spento di default.
 * Quando si scende "sott'acqua" (audio:depth -> 1) il suono diventa ovattato.
 */
function createOcean(ctx: AudioContext) {
  const master = ctx.createGain();
  master.gain.value = 0;
  const muffle = ctx.createBiquadFilter();
  muffle.type = "lowpass";
  muffle.frequency.value = 16000;
  muffle.Q.value = 0.4;
  muffle.connect(master).connect(ctx.destination);

  const len = ctx.sampleRate * 6;
  // rumore marrone per la risacca
  const brown = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = brown.getChannelData(ch);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.2;
    }
  }
  // rumore bianco per il vento
  const white = ctx.createBuffer(1, len, ctx.sampleRate);
  const wd = white.getChannelData(0);
  for (let i = 0; i < len; i++) wd[i] = Math.random() * 2 - 1;

  const waves = ctx.createBufferSource();
  waves.buffer = brown;
  waves.loop = true;
  const wavesLp = ctx.createBiquadFilter();
  wavesLp.type = "lowpass";
  wavesLp.frequency.value = 700;
  const wavesGain = ctx.createGain();
  wavesGain.gain.value = 0.55;
  waves.connect(wavesLp).connect(wavesGain).connect(muffle);

  // respiro delle onde: LFO lentissimi su volume e filtro
  const swell = ctx.createOscillator();
  swell.frequency.value = 0.085;
  const swellAmt = ctx.createGain();
  swellAmt.gain.value = 0.32;
  swell.connect(swellAmt).connect(wavesGain.gain);
  const swellF = ctx.createGain();
  swellF.gain.value = 380;
  swell.connect(swellF).connect(wavesLp.frequency);

  const wind = ctx.createBufferSource();
  wind.buffer = white;
  wind.loop = true;
  const windBp = ctx.createBiquadFilter();
  windBp.type = "bandpass";
  windBp.frequency.value = 900;
  windBp.Q.value = 0.7;
  const windGain = ctx.createGain();
  windGain.gain.value = 0.018;
  const gust = ctx.createOscillator();
  gust.frequency.value = 0.04;
  const gustAmt = ctx.createGain();
  gustAmt.gain.value = 500;
  gust.connect(gustAmt).connect(windBp.frequency);
  wind.connect(windBp).connect(windGain).connect(muffle);

  [waves, wind, swell, gust].forEach((n) => n.start());

  return {
    setOn(onOff: boolean) {
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setTargetAtTime(onOff ? 0.5 : 0, t, onOff ? 0.8 : 0.35);
    },
    setDepth(depth: number) {
      const t = ctx.currentTime;
      const f = 16000 * Math.pow(320 / 16000, Math.min(1, Math.max(0, depth)));
      muffle.frequency.setTargetAtTime(f, t, 0.25);
      windGain.gain.setTargetAtTime(0.018 * (1 - depth), t, 0.25);
    },
  };
}

export function SoundToggle() {
  const [enabled, setEnabled] = useState(false);
  const engine = useRef<ReturnType<typeof createOcean> | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const depth = useRef(0);

  useEffect(
    () =>
      on("audio:depth", (d) => {
        depth.current = d;
        engine.current?.setDepth(d);
      }),
    []
  );

  const toggle = async () => {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctxRef.current = new Ctx();
      engine.current = createOcean(ctxRef.current);
      engine.current.setDepth(depth.current);
    }
    if (ctxRef.current.state === "suspended") await ctxRef.current.resume();
    const next = !enabled;
    engine.current!.setOn(next);
    setEnabled(next);
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      className="etichetta group flex items-center gap-3 py-3 text-spuma/80 transition-colors duration-700 hover:text-spuma"
    >
      <span aria-hidden className="flex h-3 items-end gap-[2px]">
        {[0.5, 1, 0.7, 0.35].map((h, i) => (
          <span
            key={i}
            className="w-px origin-bottom bg-ottone transition-transform duration-700"
            style={{
              height: "100%",
              transform: `scaleY(${enabled ? h : 0.15})`,
              animation: enabled ? `eq 1.6s ${i * 0.2}s ease-in-out infinite alternate` : "none",
            }}
          />
        ))}
      </span>
      <span>Suono</span>
      <span className="sr-only">{enabled ? "attivo" : "spento"}</span>
      <style>{`@keyframes eq{from{transform:scaleY(.2)}to{transform:scaleY(1)}}@media (prefers-reduced-motion: reduce){[style*="eq "]{animation:none!important}}`}</style>
    </button>
  );
}
