"use client";

import { useEffect, useRef } from "react";
import { MQ } from "@/lib/gsap";

/** Grana di pellicola animata in canvas (opacità ~5%), 12 fotogrammi al secondo. */
export function Grain() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;
    const TILE = 192;
    const tiles = Array.from({ length: 5 }, () => {
      const c = document.createElement("canvas");
      c.width = c.height = TILE;
      const cx = c.getContext("2d")!;
      const img = cx.createImageData(TILE, TILE);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = Math.random() * 255;
        img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
        img.data[i + 3] = 255;
      }
      cx.putImageData(img, 0, 0);
      return ctx.createPattern(c, "repeat")!;
    });

    const resize = () => {
      // risoluzione dimezzata: grana più "organica" e costo minimo
      canvas.width = Math.ceil(window.innerWidth / 1.5);
      canvas.height = Math.ceil(window.innerHeight / 1.5);
    };
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;
    let raf = 0;
    let last = 0;
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < 1000 / 12) return;
      last = t;
      frame = (frame + 1) % tiles.length;
      ctx.save();
      ctx.translate(-Math.random() * TILE, -Math.random() * TILE);
      ctx.fillStyle = tiles[frame];
      ctx.fillRect(0, 0, canvas.width + TILE, canvas.height + TILE);
      ctx.restore();
    };
    const still = window.matchMedia(MQ.reduced).matches;
    if (still) {
      ctx.fillStyle = tiles[0];
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      raf = requestAnimationFrame(draw);
    }
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !still) raf = requestAnimationFrame(draw);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <>
      <canvas
        ref={ref}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[80] h-full w-full opacity-[0.05] mix-blend-overlay"
      />
      {/* vignettatura */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[79]"
        style={{ background: "radial-gradient(120% 90% at 50% 50%, transparent 55%, rgb(0 0 0 / 0.55) 100%)" }}
      />
    </>
  );
}
