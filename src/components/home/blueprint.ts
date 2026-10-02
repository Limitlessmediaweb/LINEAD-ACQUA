// Profilo tecnico dello yacht LDA 32 "Aurora", ricalcato sulla foto /media/fleet-aurora.webp.
// Le coordinate sono scritte a metà scala (griglia di rilievo) e convertite nel sistema
// della foto originale (2688 × 1152) da `S()`: x*2, y*2+240.

export const VB = { w: 2688, h: 1152 };
/** linea di galleggiamento in proporzione all'altezza della foto */
export const WATERLINE = (272 * 2 + 240) / VB.h;

const S = (d: string) =>
  d.replace(/(-?\d+(?:\.\d+)?)[ ,](-?\d+(?:\.\d+)?)/g, (_, a: string, b: string) => `${+a * 2} ${+b * 2 + 240}`);

export type BPath = { d: string; kind: "linea" | "scafo" | "dettaglio" | "vetro" };

export const BLUEPRINT: BPath[] = [
  // linea di galleggiamento, oltre lo scafo come in un disegno di progetto
  { kind: "linea", d: S("M40 272 L1290 272") },
  // scafo: specchio di poppa, cavallino, prua, chiglia
  { kind: "scafo", d: S("M170 269 Q176 259 188 247 L238 197 L1208 182 L1191 271 L170 269") },
  // plancetta
  { kind: "dettaglio", d: S("M134 266 L172 266 L172 274 L136 274 Z") },
  // filetto in ottone sullo scafo
  { kind: "dettaglio", d: S("M215 225 L1135 221") },
  // falchetta del ponte principale
  { kind: "dettaglio", d: S("M242 191 L1206 183") },
  // sovrastruttura del ponte principale
  { kind: "scafo", d: S("M300 189 L300 160 Q302 155 316 155 L898 155 Q926 159 946 180 L946 186") },
  // vetrata del salone
  { kind: "vetro", d: S("M358 186 L380 161 L902 161 L936 182 Z") },
  // ponte superiore con lo sbalzo di poppa
  { kind: "scafo", d: S("M276 155 L276 141 L898 141 Q911 143 905 155") },
  // tuga del ponte superiore
  { kind: "scafo", d: S("M420 141 L468 102 L690 99 Q716 104 736 129 L736 141") },
  { kind: "vetro", d: S("M478 129 L496 105 L684 102 L724 129 Z") },
  // hard top
  { kind: "scafo", d: S("M380 88 Q384 80 400 79 L640 79 Q654 81 648 90 L600 95 L396 95 Q382 94 380 88 Z") },
  // albero e radar
  { kind: "dettaglio", d: S("M437 79 L437 38 M431 52 L443 52") },
  { kind: "dettaglio", d: S("M452 79 L452 67 Q460 57 468 67 L468 79") },
  // battagliole
  { kind: "dettaglio", d: S("M946 176 L1205 174 M244 186 L244 181 L346 180 M290 133 L420 131") },
  // oblò di scafo
  { kind: "vetro", d: S("M506 243 L522 243 M540 243 L556 243 M736 243 L752 243 M806 243 L822 243 M858 243 L874 243 M938 243 L954 243 M1028 243 L1044 243") },
];

/** Quote: linee di misura con terminali */
export const DIMENSIONS = {
  length: { d: S("M134 304 L1208 304 M134 296 L134 312 M1208 296 L1208 312"), labelX: (671 * 2) / VB.w, labelY: (304 * 2 + 240) / VB.h },
  height: { d: S("M1250 272 L1250 79 M1242 272 L1258 272 M1242 79 L1258 79"), labelX: (1262 * 2) / VB.w, labelY: (175 * 2 + 240) / VB.h },
};
