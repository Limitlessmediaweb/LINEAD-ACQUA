import type { Metadata } from "next";
import Link from "next/link";
import { Compass } from "@/components/ui/Compass";

export const metadata: Metadata = { title: "Fuori rotta" };

export default function NotFound() {
  return (
    <section className="gutter relative flex min-h-[100svh] flex-col items-center justify-center text-center">
      <Compass className="size-40 md:size-52" />
      <p className="etichetta mt-12 text-[0.62rem] text-ottone">Errore 404</p>
      <h1 className="titolo mt-4 text-[clamp(3.4rem,10vw,8rem)] text-spuma">
        Fuori <em className="italic text-sabbia">rotta.</em>
      </h1>
      <p className="mt-6 max-w-sm text-sm leading-relaxed text-spuma/70">La pagina che cercate non è su nessuna carta nautica. La bussola sta ancora cercando il nord.</p>
      <Link
        prefetch={false}
        href="/"
        className="etichetta group mt-10 inline-flex items-center gap-4 border border-ottone/60 px-7 py-4 text-[0.66rem] text-spuma transition-colors duration-700 hover:bg-ottone hover:text-abisso"
      >
        Rientrate in porto
        <span aria-hidden className="block h-px w-6 bg-current transition-[width] duration-700 group-hover:w-10" />
      </Link>
    </section>
  );
}
