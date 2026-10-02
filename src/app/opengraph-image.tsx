import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { WORDMARK } from "@/lib/wordmark";

export const alt = "LINEA D’ACQUA — Tutto inizia da una linea. Concept di LIMITLESS.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Immagine Open Graph generata: fotogramma dell'hero + wordmark con la linea in ottone.
export default async function OG() {
  const bg = await readFile(join(process.cwd(), "src/assets/og-base.jpg"));
  const src = `data:image/jpeg;base64,${bg.toString("base64")}`;
  const W = 760;
  const H = (W * WORDMARK.capHeight) / WORDMARK.width;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#060B12" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={1200} height={630} alt="" style={{ position: "absolute", inset: 0 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(6,11,18,0.92), rgba(6,11,18,0.1) 70%)" }} />
        <div style={{ position: "absolute", left: 72, bottom: 92, display: "flex", flexDirection: "column" }}>
          <svg width={W} height={H} viewBox={`0 ${-WORDMARK.capHeight} ${WORDMARK.width} ${WORDMARK.capHeight}`}>
            <path d={WORDMARK.d} fill="#F2EFE9" />
          </svg>
          <div style={{ width: W + 40, height: 2, background: "#B8925A", marginTop: 6 }} />
          <div style={{ marginTop: 22, color: "#C9B99A", fontSize: 20, letterSpacing: 6 }}>TUTTO INIZIA DA UNA LINEA — CONCEPT LIMITLESS</div>
        </div>
      </div>
    ),
    size
  );
}
