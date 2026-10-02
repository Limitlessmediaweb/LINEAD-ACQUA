import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MODELS, ROOMS, getModel } from "@/lib/data";
import { BgVideo } from "@/components/ui/BgVideo";
import { Reveal, SplitReveal } from "@/components/ui/Reveal";
import { ModelSpecs, MiniTour } from "@/components/model/ModelParts";
import { Footer } from "@/components/global/Footer";

export function generateStaticParams() {
  return MODELS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const m = getModel(slug);
  if (!m) return {};
  return {
    title: `${m.code} ${m.name}`,
    description: `${m.code} “${m.name}”: ${m.length} metri, ${m.guests} ospiti, ${m.cabins} cabine. ${m.tagline} Dati dimostrativi.`,
  };
}

export default async function ModelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = getModel(slug);
  if (!m) notFound();
  const i = MODELS.indexOf(m);
  const next = MODELS[(i + 1) % MODELS.length];
  const room = ROOMS.find((r) => r.id === m.tour)!;

  return (
    <>
      <section className="relative h-[100svh] min-h-[560px] overflow-clip">
        <BgVideo name={m.video} alt={`${m.code} ${m.name} in navigazione, ripreso dall'alto`} priority />
        <div aria-hidden className="scrim-t absolute inset-x-0 top-0 h-1/2" />
        <div aria-hidden className="scrim-b absolute inset-x-0 bottom-0 h-2/3" />
        <div className="gutter absolute inset-x-0 bottom-[12svh]">
          <Reveal stagger={0}>
            <p className="etichetta flex items-center gap-4 text-[0.62rem] text-sabbia">
              <Link prefetch={false} href="/#flotta" className="hover:text-spuma">
                La flotta
              </Link>
              <span aria-hidden className="h-px w-8 bg-ottone/60" />
              <span className="numero text-ottone">{m.code}</span>
            </p>
          </Reveal>
          <SplitReveal className="titolo mt-5 text-[clamp(4rem,15vw,13rem)] italic text-spuma">{m.name}</SplitReveal>
          <Reveal stagger={0} delay={0.9}>
            <p className="mt-4 max-w-md text-base leading-relaxed text-spuma/80">{m.tagline}</p>
          </Reveal>
        </div>
      </section>

      <section className="py-[16svh]" aria-labelledby="scheda">
        <Reveal className="gutter mx-auto mb-14 max-w-6xl md:mb-20">
          <p className="etichetta text-[0.62rem] text-ottone">Scheda tecnica</p>
          <h2 id="scheda" className="titolo mt-4 max-w-3xl text-[clamp(2.2rem,5vw,4.2rem)] text-spuma">
            {m.intro}
          </h2>
        </Reveal>
        <ModelSpecs model={m} />
      </section>

      <MiniTour room={m.tour} title={room.name} caption={room.caption} />

      <section className="gutter py-[16svh]" aria-labelledby="galleria">
        <Reveal className="mx-auto mb-12 flex max-w-6xl items-end justify-between">
          <h2 id="galleria" className="titolo text-[clamp(2.2rem,5vw,4.2rem)] text-spuma">
            Galleria
          </h2>
          <p className="etichetta text-[0.62rem] text-spuma/60">Immagini generate per il concept</p>
        </Reveal>
        <Reveal className="mx-auto grid max-w-6xl gap-4 md:grid-cols-[1.4fr_1fr] md:grid-rows-2 md:gap-5">
          {m.gallery.map((g, k) => (
            <figure key={g.src} className={`relative overflow-clip ${k === 0 ? "aspect-[4/3] md:row-span-2 md:aspect-auto" : "aspect-video"}`} data-cursor="scopri">
              <Image src={g.src} alt={g.alt} fill sizes="(max-width: 768px) 92vw, 50vw" className="object-cover transition-transform duration-[2400ms] [transition-timing-function:var(--ease-lusso)] hover:scale-[1.04]" />
            </figure>
          ))}
        </Reveal>
      </section>

      <section className="gutter border-t border-spuma/10 py-[14svh]">
        <Reveal className="mx-auto flex max-w-6xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="etichetta text-[0.62rem] text-sabbia">Modello successivo</p>
            <Link prefetch={false} href={`/flotta/${next.slug}`} className="group mt-4 block" data-cursor="scopri">
              <span className="numero mr-4 text-lg text-ottone">{next.code}</span>
              <span className="titolo text-[clamp(3rem,9vw,7rem)] italic text-spuma transition-colors duration-700 group-hover:text-sabbia">{next.name}</span>
            </Link>
          </div>
          <Link
            prefetch={false}
            href="/#prova"
            className="etichetta group flex items-center gap-4 self-start border border-ottone/60 px-7 py-4 text-[0.66rem] text-spuma transition-colors duration-700 hover:bg-ottone hover:text-abisso md:self-auto"
          >
            Richiedi una prova in mare
            <span aria-hidden className="block h-px w-6 bg-current transition-[width] duration-700 group-hover:w-10" />
          </Link>
        </Reveal>
      </section>
      <Footer />
    </>
  );
}
