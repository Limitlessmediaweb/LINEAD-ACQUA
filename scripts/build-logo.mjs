// Genera il wordmark "LINEA D’ACQUA" in tracciati vettoriali (Cormorant Garamond Light)
// -> public/brand/logo.svg  (logo completo con linea in ottone e riflesso distorto)
// -> src/lib/wordmark.ts    (dati del tracciato per i componenti React)
// Uso: node scripts/build-logo.mjs  (richiede raw/fonts/cormorant-300.ttf)
import fs from "node:fs";
import path from "node:path";
import opentype from "opentype.js";

import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const font = opentype.parse(fs.readFileSync(path.join(root, "raw/fonts/cormorant-300.ttf")).buffer);

const TEXT = "LINEA D’ACQUA";
const SIZE = 120; // unità
const TRACK = 0.16 * SIZE; // tracking largo, da etichetta di lusso

const f2 = (n) => (Math.round(n * 100) / 100).toString();
const toD = (cmds) => cmds.map((c) => c.type === "Z" ? "Z" : c.type === "Q" ? `Q${f2(c.x1)} ${f2(c.y1)} ${f2(c.x)} ${f2(c.y)}` : c.type === "C" ? `C${f2(c.x1)} ${f2(c.y1)} ${f2(c.x2)} ${f2(c.y2)} ${f2(c.x)} ${f2(c.y)}` : `${c.type}${f2(c.x)} ${f2(c.y)}`).join("");

// Composizione lettera per lettera con tracking.
let x = 0;
const glyphPaths = [];
for (const ch of TEXT) {
  const g = font.charToGlyph(ch);
  const p = g.getPath(x, 0, SIZE);
  glyphPaths.push(toD(p.commands));
  x += (g.advanceWidth / font.unitsPerEm) * SIZE + TRACK;
}
const textWidth = x - TRACK;

// Bounding box verticale reale.
const full = font.getPath(TEXT, 0, 0, SIZE);
const bb = full.getBoundingBox();
const capTop = Math.floor(bb.y1); // negativo (sopra la baseline)
const d = glyphPaths.join(" ");

const PAD_X = 40;
const W = Math.ceil(textWidth + PAD_X * 2);
const ABOVE = Math.ceil(-capTop) + 16;
const BELOW = Math.ceil(-capTop) + 10;
const H = ABOVE + BELOW;
const baseline = ABOVE;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-labelledby="t">
  <title id="t">LINEA D’ACQUA — cantiere navale italiano (concept)</title>
  <defs>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="reflMask" maskUnits="userSpaceOnUse" x="0" y="${baseline}" width="${W}" height="${BELOW}">
      <rect x="0" y="${baseline}" width="${W}" height="${BELOW}" fill="url(#fade)"/>
    </mask>
    <filter id="ripple" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.09" numOctaves="2" seed="7" result="n">
        <animate attributeName="baseFrequency" dur="9s" values="0.004 0.09;0.005 0.11;0.004 0.09" repeatCount="indefinite"/>
      </feTurbulence>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
  </defs>
  <g fill="#F2EFE9" transform="translate(${PAD_X} ${baseline})">
    <path d="${d}"/>
  </g>
  <g mask="url(#reflMask)">
    <g filter="url(#ripple)" fill="#F2EFE9" transform="translate(${PAD_X} ${baseline}) scale(1 -0.82)">
      <path d="${d}"/>
    </g>
  </g>
  <line x1="0" y1="${baseline + 0.5}" x2="${W}" y2="${baseline + 0.5}" stroke="#B8925A" stroke-width="1.5"/>
</svg>
`;

fs.writeFileSync(path.join(root, "public/brand/logo.svg"), svg);
fs.writeFileSync(
  path.join(root, "src/lib/wordmark.ts"),
  `// Generato da scripts/build-logo.mjs — non modificare a mano.
export const WORDMARK = {
  d: ${JSON.stringify(d)},
  /** larghezza del testo (unità) */
  width: ${Math.ceil(textWidth)},
  /** altezza delle maiuscole sopra la baseline (unità) */
  capHeight: ${Math.ceil(-capTop)},
} as const;
`
);
console.log("logo ok", { W, H, textWidth: Math.round(textWidth), cap: -capTop });
