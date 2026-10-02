import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { ViewTransition } from "react";
import "./globals.css";
import { SmoothScroll } from "@/components/global/SmoothScroll";
import { Grain } from "@/components/global/Grain";
import { Letterbox } from "@/components/global/Letterbox";
import { Header } from "@/components/global/Header";
import { Cursor } from "@/components/global/Cursor";
import { ConceptBadge } from "@/components/global/ConceptBadge";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "LINEA D’ACQUA — Tutto inizia da una linea",
    template: "%s — LINEA D’ACQUA",
  },
  description:
    "Yacht a motore su misura dai 24 ai 40 metri, costruiti a mano in Liguria. Concept di un cantiere immaginario realizzato da LIMITLESS.",
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  openGraph: {
    title: "LINEA D’ACQUA — Tutto inizia da una linea",
    description: "Un cantiere navale italiano immaginario. Un sito-film, concept di LIMITLESS.",
    locale: "it_IT",
    type: "website",
    siteName: "LINEA D’ACQUA",
  },
  icons: { icon: "/brand/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#060B12",
  colorScheme: "dark",
};

// L'intro si vede una volta per sessione: la classe va messa prima del primo paint.
const introScript = `try{if(location.pathname==='/'&&!sessionStorage.getItem('lda-intro-vista'))document.documentElement.classList.add('intro-attiva')}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: introScript }} />
        <a href="#contenuto" className="skip-link etichetta">
          Vai al contenuto
        </a>
        <SmoothScroll />
        <Header />
        <ViewTransition>
          <main id="contenuto" className="relative z-[1]">
            {children}
          </main>
        </ViewTransition>
        <Letterbox />
        <Grain />
        <Cursor />
        <ConceptBadge />
      </body>
    </html>
  );
}
