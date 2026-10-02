import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal, SplitReveal } from "@/components/ui/Reveal";
import { Footer } from "@/components/global/Footer";

export const metadata: Metadata = {
  title: "Contatti",
  description: "Come raggiungere il cantiere LINEA D’ACQUA (concept).",
};

const ROWS = [
  { label: "Cantiere", value: "[DA COMPLETARE] — indirizzo, Lavagna (GE)" },
  { label: "Telefono", value: "[DA COMPLETARE]" },
  { label: "Email", value: "[DA COMPLETARE]" },
  { label: "Visite", value: "Su appuntamento, dal lunedì al venerdì" },
];

export default function ContattiPage() {
  return (
    <>
      <section className="relative min-h-[100svh] overflow-clip pb-[12svh] pt-[24svh]">
        <Image src="/media/bay-blue.webp" alt="" fill priority sizes="100vw" className="object-cover opacity-40" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-abisso/60 via-abisso/70 to-abisso" />
        <div className="gutter relative mx-auto max-w-6xl">
          <Reveal stagger={0}>
            <p className="etichetta text-[0.62rem] text-ottone">Contatti</p>
          </Reveal>
          <SplitReveal className="titolo mt-5 text-[clamp(3.4rem,10vw,9rem)] text-spuma">
            Venite a <em className="italic text-sabbia">trovarci.</em>
          </SplitReveal>
          <Reveal className="mt-16 grid gap-16 md:grid-cols-[1.3fr_1fr]">
            <dl className="divide-y divide-spuma/10 border-y border-spuma/10">
              {ROWS.map((r) => (
                <div key={r.label} className="grid grid-cols-[7rem_1fr] gap-6 py-5 md:grid-cols-[9rem_1fr]">
                  <dt className="etichetta pt-1 text-[0.62rem] text-sabbia">{r.label}</dt>
                  <dd className="text-base text-spuma/85">{r.value}</dd>
                </div>
              ))}
            </dl>
            <div className="space-y-6">
              <p className="titolo text-3xl leading-snug text-spuma">Il modo migliore per conoscerci resta una giornata in mare.</p>
              <Link
                prefetch={false}
                href="/#prova"
                className="etichetta group inline-flex items-center gap-4 border border-ottone/60 px-7 py-4 text-[0.66rem] text-spuma transition-colors duration-700 hover:bg-ottone hover:text-abisso"
              >
                Richiedi una prova in mare
                <span aria-hidden className="block h-px w-6 bg-current transition-[width] duration-700 group-hover:w-10" />
              </Link>
              <p className="text-xs text-spuma/60">Cantiere immaginario: i recapiti sono da completare.</p>
            </div>
          </Reveal>
        </div>
      </section>
      <Footer />
    </>
  );
}
