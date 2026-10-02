// Contenuti del concept. Tutti i dati tecnici sono DIMOSTRATIVI.

export const SITE = {
  name: "LINEA D’ACQUA",
  payoff: "Tutto inizia da una linea.",
  limitlessUrl: process.env.NEXT_PUBLIC_LIMITLESS_URL || "https://www.limitlessmedia.it",
};

export type Model = {
  slug: string;
  code: string;
  name: string;
  tagline: string;
  intro: string;
  length: number; // m
  beam: number; // m
  guests: number;
  cabins: number;
  speed: number; // nodi
  range: number; // miglia nautiche
  image: string;
  imageAlt: string;
  /** posizione della linea di galleggiamento nell'immagine di profilo (0-1 dall'alto) */
  waterline: number;
  /** estensione orizzontale dello scafo nell'immagine (0-1) */
  hullX: [number, number];
  gallery: { src: string; alt: string }[];
  /** video dell'hero della pagina modello (in /media/video) */
  video: string;
  /** stanza del walk tour corto */
  tour: "salone" | "cabina" | "poppa";
};

export const MODELS: Model[] = [
  {
    slug: "libeccio",
    code: "LDA 24",
    name: "Libeccio",
    tagline: "Il vento che arriva dal largo.",
    intro: "Ventiquattro metri. Agile, basso, essenziale. Per chi conduce da sé.",
    length: 24,
    beam: 5.9,
    guests: 8,
    cabins: 4,
    speed: 28,
    range: 900,
    video: "fleet-libeccio",
    tour: "poppa",
    image: "/media/fleet-libeccio.webp",
    imageAlt: "LDA 24 Libeccio di profilo su fondo scuro: scafo blu notte, sovrastruttura bianca compatta, flybridge aperto",
    waterline: 0.715,
    hullX: [0.123, 0.852],
    gallery: [
      { src: "/media/bay-noon.webp", alt: "Uno yacht all'ancora in una baia ligure a mezzogiorno" },
      { src: "/media/macro-teak.webp", alt: "Dettaglio del ponte in teak con il comento nero" },
      { src: "/media/int-poppa.webp", alt: "Ponte di poppa in teak con piscina a sfioro al tramonto" },
    ],
  },
  {
    slug: "aurora",
    code: "LDA 32",
    name: "Aurora",
    tagline: "La prima luce, ogni giorno.",
    intro: "Trentadue metri. Il nostro modello più amato: l'equilibrio tra spazio e silenzio.",
    length: 32,
    beam: 7.2,
    guests: 10,
    cabins: 5,
    speed: 24,
    range: 1600,
    video: "hero-169",
    tour: "salone",
    image: "/media/fleet-aurora.webp",
    imageAlt: "LDA 32 Aurora di profilo su fondo scuro: scafo blu notte con filetto in ottone, due ponti bianchi, vetrate scure",
    waterline: 0.68,
    hullX: [0.05, 0.9],
    gallery: [
      { src: "/media/int-salone.webp", alt: "Il salone di Aurora: teak, pelle color sabbia e vetrate sul mare" },
      { src: "/media/int-cabina.webp", alt: "La cabina armatoriale con le finestre di scafo a filo d'acqua" },
      { src: "/media/bay-sunset.webp", alt: "Aurora all'ancora in una baia al tramonto" },
    ],
  },
  {
    slug: "notturno",
    code: "LDA 40",
    name: "Notturno",
    tagline: "Il mare dopo che tutti sono rientrati.",
    intro: "Quaranta metri. Tre ponti, scafo grafite. Pensato per le traversate lunghe.",
    length: 40,
    beam: 8.4,
    guests: 12,
    cabins: 6,
    speed: 21,
    range: 3200,
    video: "fleet-notturno",
    tour: "cabina",
    image: "/media/fleet-notturno.webp",
    imageAlt: "LDA 40 Notturno di profilo su fondo scuro: scafo grafite, tre ponti bianchi, linee lunghe e basse",
    waterline: 0.684,
    hullX: [0.063, 0.945],
    gallery: [
      { src: "/media/bay-night.webp", alt: "Uno yacht illuminato all'ancora di notte in una baia" },
      { src: "/media/macro-ottone.webp", alt: "Bitta in ottone satinato in primo piano" },
      { src: "/media/underwater.webp", alt: "Lo scafo visto da sott'acqua con i raggi di luce" },
    ],
  },
];

export const getModel = (slug: string) => MODELS.find((m) => m.slug === slug);

export const DAY = [
  { time: "06:12", minutes: 6 * 60 + 12, src: "/media/bay-dawn.webp", alt: "La baia all'alba: cielo rosa, mare immobile, lo yacht all'ancora", line: "Il mare è ancora vostro.", fg: "#f6ece6", bg: "#2a2533" },
  { time: "12:30", minutes: 12 * 60 + 30, src: "/media/bay-noon.webp", alt: "La baia a mezzogiorno: acqua turchese, scogliere e pini", line: "Un tuffo dove il fondale si vede.", fg: "#f2efe9", bg: "#0e2a3c" },
  { time: "19:34", minutes: 19 * 60 + 34, src: "/media/bay-sunset.webp", alt: "La baia al tramonto: il sole sull'orizzonte e una scia dorata sull'acqua", line: "Nessuno ha fretta di rientrare.", fg: "#f7e7cf", bg: "#3a2414" },
  { time: "20:48", minutes: 20 * 60 + 48, src: "/media/bay-blue.webp", alt: "La baia all'ora blu: cielo cobalto e scogliere in silhouette", line: "L'ora in cui il blu diventa un colore.", fg: "#dfe6f2", bg: "#0b1a3a" },
  { time: "21:40", minutes: 21 * 60 + 40, src: "/media/bay-night.webp", alt: "La baia di notte con lo yacht illuminato e la luna", line: "Le luci di bordo. E poi, il silenzio.", fg: "#f2efe9", bg: "#050a14" },
] as const;

export const ROOMS = [
  {
    id: "salone",
    name: "Il salone",
    caption: "Undici metri di luce, da murata a murata.",
    poster: "/media/video/int-salone-poster.webp",
    labels: [
      { text: "Teak birmano", x: 0.62, y: 0.82, lx: 0.74, ly: 0.62 },
      { text: "Pelle nabuk", x: 0.26, y: 0.7, lx: 0.24, ly: 0.48 },
      { text: "Ottone satinato", x: 0.35, y: 0.52, lx: 0.3, ly: 0.3 },
    ],
  },
  {
    id: "cabina",
    name: "La cabina armatoriale",
    caption: "Il mare all'altezza del cuscino.",
    poster: "/media/video/int-cabina-poster.webp",
    labels: [
      { text: "Lino naturale", x: 0.55, y: 0.62, lx: 0.68, ly: 0.5 },
      { text: "Teak birmano", x: 0.16, y: 0.42, lx: 0.24, ly: 0.24 },
      { text: "Vetro di scafo", x: 0.84, y: 0.4, lx: 0.86, ly: 0.2 },
    ],
  },
  {
    id: "poppa",
    name: "Il ponte di poppa",
    caption: "La piscina finisce dove inizia il mare.",
    poster: "/media/video/int-poppa-poster.webp",
    labels: [
      { text: "Piscina a sfioro", x: 0.5, y: 0.6, lx: 0.56, ly: 0.36 },
      { text: "Teak birmano", x: 0.6, y: 0.9, lx: 0.76, ly: 0.74 },
      { text: "Pelle nautica", x: 0.2, y: 0.78, lx: 0.26, ly: 0.58 },
    ],
  },
] as const;

export const MATERIALS = [
  { id: "teak", name: "Teak", latin: "Tectona grandis", note: "Birmano, stagionato tre anni. Ogni doga è scelta a mano.", src: "/media/macro-teak.webp", alt: "Macro della venatura del teak oliato con il comento nero" },
  { id: "pelle", name: "Pelle", latin: "Nabuk color sabbia", note: "Cucita a sellaio, un punto alla volta.", src: "/media/macro-pelle.webp", alt: "Macro delle cuciture a sellaio su pelle nabuk color sabbia" },
  { id: "ottone", name: "Ottone", latin: "Satinato a mano", note: "Spazzolato in una sola direzione, come la scia.", src: "/media/macro-ottone.webp", alt: "Macro di una bitta in ottone satinato con riflessi dorati" },
  { id: "vetro", name: "Vetro", latin: "Stratificato, fumé", note: "Il mare resta fuori. La vista, no.", src: "/media/macro-vetro.webp", alt: "Macro di un vetro scuro con gocce d'acqua di mare e il tramonto sfocato" },
] as const;

export const HULLS = [
  { id: "blu", name: "Blu notte", swatch: "#0d1824", src: "/media/fleet-aurora.webp" },
  { id: "perla", name: "Bianco perla", swatch: "#e9e4da", src: "/media/hull-perla.webp" },
  { id: "grafite", name: "Grafite", swatch: "#3b3f44", src: "/media/hull-grafite.webp" },
  { id: "verde", name: "Verde inglese", swatch: "#0f3b2a", src: "/media/hull-verde.webp" },
] as const;

export const WOODS = [
  { id: "teak", name: "Teak birmano", src: "/media/wood-teak.webp" },
  { id: "rovere", name: "Rovere fumé", src: "/media/wood-rovere.webp" },
  { id: "noce", name: "Noce canaletto", src: "/media/wood-noce.webp" },
] as const;

export const CHAPTERS = [
  { n: 1, roman: "I", title: "L'orizzonte", id: "orizzonte" },
  { n: 2, roman: "II", title: "La linea", id: "linea" },
  { n: 3, roman: "III", title: "Un giorno in mare", id: "giorno" },
  { n: 4, roman: "IV", title: "A bordo", id: "bordo" },
  { n: 5, roman: "V", title: "Materia", id: "materia" },
  { n: 6, roman: "VI", title: "La flotta", id: "flotta" },
  { n: 7, roman: "VII", title: "Il vostro yacht", id: "configuratore" },
  { n: 8, roman: "VIII", title: "Sotto la superficie", id: "superficie" },
] as const;

export const NAV = [
  { href: "/", label: "Il film", img: "/media/hero-169.webp" },
  { href: "/flotta/aurora", label: "La flotta", img: "/media/fleet-aurora.webp" },
  { href: "/cantiere", label: "Il cantiere", img: "/media/cantiere-capannone.webp" },
  { href: "/contatti", label: "Contatti", img: "/media/bay-blue.webp" },
] as const;
