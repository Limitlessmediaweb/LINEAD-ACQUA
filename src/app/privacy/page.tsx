import type { Metadata } from "next";
import { Footer } from "@/components/global/Footer";

export const metadata: Metadata = {
  title: "Privacy (bozza)",
  description: "Informativa privacy in bozza per il concept LINEA D’ACQUA.",
};

export default function PrivacyPage() {
  return (
    <>
      <article className="gutter mx-auto max-w-3xl pb-[16svh] pt-[24svh]">
        <p className="etichetta inline-block border border-ottone/60 px-3 py-1.5 text-[0.58rem] text-ottone">Bozza — da validare con un consulente</p>
        <h1 className="titolo mt-8 text-[clamp(3rem,8vw,6rem)] text-spuma">Privacy</h1>
        <div className="mt-12 space-y-8 text-[0.95rem] leading-relaxed text-spuma/75 [&_h2]:titolo [&_h2]:text-3xl [&_h2]:text-spuma">
          <p>
            Questo sito è un concept dimostrativo realizzato da LIMITLESS per un cantiere immaginario. Non raccoglie dati personali, non usa cookie di
            profilazione e non invia a terzi le informazioni inserite nei moduli.
          </p>
          <h2>Dati inseriti nel modulo</h2>
          <p>
            Il modulo “Richiedi una prova in mare” verifica i campi direttamente nel browser e non trasmette nulla. In una versione reale qui andranno indicati
            titolare del trattamento, finalità, base giuridica, tempi di conservazione e diritti dell’interessato. [DA COMPLETARE]
          </p>
          <h2>Cookie e archiviazione locale</h2>
          <p>
            Il sito usa solo la memoria di sessione del browser per ricordare che l’introduzione è già stata vista. Nessun cookie, nessun tracciamento.
          </p>
          <h2>Contatti</h2>
          <p>[DA COMPLETARE]</p>
        </div>
      </article>
      <Footer />
    </>
  );
}
