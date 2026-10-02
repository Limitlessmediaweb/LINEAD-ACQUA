import type { Metadata } from "next";
import Image from "next/image";
import { Reveal, SplitReveal } from "@/components/ui/Reveal";
import { Timeline } from "@/components/model/Timeline";
import { Footer } from "@/components/global/Footer";

export const metadata: Metadata = {
  title: "Il cantiere",
  description: "La storia (dimostrativa) di un cantiere navale ligure: artigianato, teak e una linea in ottone.",
};

export default function CantierePage() {
  return (
    <>
      <section className="relative h-[100svh] min-h-[560px] overflow-clip">
        <Image
          src="/media/cantiere-capannone.webp"
          alt="Lo scafo blu notte di uno yacht in costruzione nel capannone del cantiere, con la luce dorata che entra dal portellone aperto sul mare"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div aria-hidden className="scrim-t absolute inset-x-0 top-0 h-1/2" />
        <div aria-hidden className="scrim-b absolute inset-x-0 bottom-0 h-2/3" />
        <div className="gutter absolute inset-x-0 bottom-[12svh]">
          <Reveal stagger={0}>
            <p className="etichetta text-[0.62rem] text-sabbia">Il cantiere — Lavagna, Liguria [dimostrativo]</p>
          </Reveal>
          <SplitReveal className="titolo mt-5 max-w-5xl text-[clamp(3.2rem,10vw,9rem)] text-spuma">
            Costruiti a mano. <em className="italic text-sabbia">Lentamente.</em>
          </SplitReveal>
        </div>
      </section>

      <section className="gutter py-[16svh]" aria-labelledby="storia">
        <Reveal className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1fr_1.3fr] md:gap-24">
          <p className="etichetta text-[0.62rem] text-ottone">La storia</p>
          <div>
            <h2 id="storia" className="titolo text-[clamp(2.2rem,5vw,4.2rem)] text-spuma">
              Un capannone, il mare davanti, e nessuna fretta.
            </h2>
            <p className="mt-8 max-w-xl text-base leading-relaxed text-spuma/75">
              LINEA D’ACQUA nasce nel 1987 come rimessa per barche in legno. Da allora costruiamo pochi yacht a motore, tra i 24 e i 40 metri, ciascuno
              disegnato insieme a chi lo condurrà. La storia che leggete è dimostrativa: il cantiere non esiste, la cura sì.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="relative overflow-clip" aria-labelledby="artigianato">
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[100svh]">
            <Image
              src="/media/cantiere-mani.webp"
              alt="Le mani di un artigiano piallano una doga di teak, con i trucioli che si arricciano sul banco"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <Reveal className="gutter flex flex-col justify-center gap-8 py-[14svh]">
            <p className="etichetta text-[0.62rem] text-ottone">Artigianato</p>
            <h2 id="artigianato" className="titolo text-[clamp(2.2rem,4.6vw,4rem)] text-spuma">
              Tremila disegni. Poi le mani.
            </h2>
            <ul className="space-y-5 text-sm leading-relaxed text-spuma/75">
              <li className="border-t border-spuma/10 pt-5">
                <span className="numero mr-3 text-ottone">01</span>Teak birmano stagionato tre anni, scelto doga per doga.
              </li>
              <li className="border-t border-spuma/10 pt-5">
                <span className="numero mr-3 text-ottone">02</span>Pelli cucite a sellaio, un punto alla volta.
              </li>
              <li className="border-t border-spuma/10 pt-5">
                <span className="numero mr-3 text-ottone">03</span>Ottone satinato a mano, in una sola direzione.
              </li>
              <li className="border-t border-spuma/10 pt-5">
                <span className="numero mr-3 text-ottone">04</span>Quattro yacht all’anno. Non uno di più.
              </li>
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="gutter py-[16svh]" aria-labelledby="tempo">
        <Reveal className="mx-auto mb-20 max-w-4xl text-center">
          <p className="etichetta text-[0.62rem] text-ottone">Il tempo</p>
          <h2 id="tempo" className="titolo mt-4 text-[clamp(2.2rem,5vw,4.2rem)] text-spuma">
            Trentanove anni, <em className="italic text-sabbia">una linea.</em>
          </h2>
          <p className="etichetta mt-4 text-[0.62rem] text-spuma/60">Cronologia dimostrativa</p>
        </Reveal>
        <Timeline />
      </section>
      <Footer />
    </>
  );
}
