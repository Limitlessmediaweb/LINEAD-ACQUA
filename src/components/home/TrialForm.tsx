"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { MODELS } from "@/lib/data";

type Errors = Partial<Record<"nome" | "email" | "modello" | "periodo", string>>;

const PERIODI = ["Primavera 2027", "Estate 2027", "Autunno 2027", "Da concordare insieme"];

function validate(data: FormData): Errors {
  const e: Errors = {};
  const nome = String(data.get("nome") || "").trim();
  const email = String(data.get("email") || "").trim();
  if (nome.length < 2) e.nome = "Ci dite come vi chiamate?";
  if (!email) e.email = "Serve un indirizzo email per rispondervi.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = "Questo indirizzo non sembra completo.";
  if (!data.get("modello")) e.modello = "Scegliete un modello, anche solo per iniziare.";
  if (!data.get("periodo")) e.periodo = "Indicate un periodo indicativo.";
  return e;
}

/** "Richiedi una prova in mare": modulo minimale, validazione e conferma animata. Nessun invio reale. */
export function TrialForm() {
  const root = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const uid = useId();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        gsap.from(".prova-in", {
          opacity: 0,
          y: 18,
          duration: 1.4,
          stagger: 0.1,
          ease: "lusso",
          scrollTrigger: { trigger: root.current, start: "top 75%" },
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  const confirm = () => {
    const reduced = window.matchMedia(MQ.reduced).matches;
    gsap.to(form.current, { opacity: 0, y: -10, duration: reduced ? 0.01 : 0.9, ease: "lusso", onComplete: () => setSent(true) });
  };

  // conferma: la linea in ottone si disegna sotto "A presto, a bordo."
  useGSAP(
    () => {
      if (!sent) return;
      const reduced = window.matchMedia(MQ.reduced).matches;
      root.current?.querySelector<HTMLElement>(".prova-ok")?.focus();
      gsap
        .timeline({ defaults: { ease: "lusso" } })
        .fromTo(".prova-ok", { opacity: 0 }, { opacity: 1, duration: reduced ? 0.01 : 1.2 })
        .fromTo(".prova-ok-linea path", { drawSVG: "0%" }, { drawSVG: "100%", duration: reduced ? 0.01 : 1.8 }, "<0.3");
    },
    { scope: root, dependencies: [sent] }
  );

  const submit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget);
    const e = validate(data);
    setErrors(e);
    const first = Object.keys(e)[0];
    if (first) {
      ev.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    // TODO: collegare l'invio reale (API/CRM del cantiere). Nel concept nessun dato lascia il browser.
    confirm();
  };

  const field = "mt-2 w-full border-0 border-b border-spuma/25 bg-transparent px-0 py-3 text-base text-spuma placeholder:text-spuma/30 transition-colors duration-500 focus:border-ottone focus:outline-none focus:ring-0 aria-[invalid=true]:border-[#d9a28a]";
  const err = (k: keyof Errors) =>
    errors[k] ? (
      <p id={`${uid}-${k}-e`} className="mt-2 text-xs text-[#e7b9a5]">
        {errors[k]}
      </p>
    ) : null;

  return (
    <div ref={root} className="gutter relative mx-auto max-w-5xl">
      <div className="grid gap-14 md:grid-cols-[1fr_1.2fr] md:gap-20">
        <div>
          <p className="prova-in etichetta text-[0.62rem] text-ottone">Prova in mare</p>
          <h2 className="prova-in titolo mt-4 text-[clamp(2.4rem,5vw,4.2rem)] text-spuma">
            Richiedi una <em className="italic text-sabbia">prova in mare.</em>
          </h2>
          <p className="prova-in mt-6 max-w-sm text-sm leading-relaxed text-spuma/70">
            Una giornata a bordo, dal porto di Lavagna [dimostrativo]. Vi richiamiamo noi, con calma, per scegliere data e rotta.
          </p>
        </div>

        <div className="relative min-h-[26rem]">
          {!sent ? (
            <form ref={form} onSubmit={submit} noValidate className="space-y-7" aria-describedby={`${uid}-nota`}>
              <div className="prova-in">
                <label htmlFor={`${uid}-nome`} className="etichetta text-[0.6rem] text-sabbia">
                  Nome e cognome
                </label>
                <input
                  id={`${uid}-nome`}
                  name="nome"
                  autoComplete="name"
                  className={field}
                  aria-invalid={!!errors.nome}
                  aria-describedby={errors.nome ? `${uid}-nome-e` : undefined}
                />
                {err("nome")}
              </div>
              <div className="prova-in">
                <label htmlFor={`${uid}-email`} className="etichetta text-[0.6rem] text-sabbia">
                  Email
                </label>
                <input
                  id={`${uid}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  className={field}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? `${uid}-email-e` : undefined}
                />
                {err("email")}
              </div>
              <div className="prova-in grid gap-7 sm:grid-cols-2">
                <div className="relative">
                  <label htmlFor={`${uid}-modello`} className="etichetta text-[0.6rem] text-sabbia">
                    Modello di interesse
                  </label>
                  <select
                    id={`${uid}-modello`}
                    name="modello"
                    defaultValue=""
                    className={`${field} appearance-none`}
                    aria-invalid={!!errors.modello}
                    aria-describedby={errors.modello ? `${uid}-modello-e` : undefined}
                  >
                    <option value="" disabled className="bg-abisso">
                      Scegliete…
                    </option>
                    {MODELS.map((m) => (
                      <option key={m.slug} value={m.slug} className="bg-abisso">
                        {m.code} {m.name}
                      </option>
                    ))}
                  </select>
                  <svg aria-hidden viewBox="0 0 10 6" className="pointer-events-none absolute right-1 top-[2.9rem] w-2.5 text-ottone"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1" /></svg>
                  {err("modello")}
                </div>
                <div className="relative">
                  <label htmlFor={`${uid}-periodo`} className="etichetta text-[0.6rem] text-sabbia">
                    Periodo
                  </label>
                  <select
                    id={`${uid}-periodo`}
                    name="periodo"
                    defaultValue=""
                    className={`${field} appearance-none`}
                    aria-invalid={!!errors.periodo}
                    aria-describedby={errors.periodo ? `${uid}-periodo-e` : undefined}
                  >
                    <option value="" disabled className="bg-abisso">
                      Scegliete…
                    </option>
                    {PERIODI.map((p) => (
                      <option key={p} value={p} className="bg-abisso">
                        {p}
                      </option>
                    ))}
                  </select>
                  <svg aria-hidden viewBox="0 0 10 6" className="pointer-events-none absolute right-1 top-[2.9rem] w-2.5 text-ottone"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1" /></svg>
                  {err("periodo")}
                </div>
              </div>
              <div className="prova-in flex flex-wrap items-center justify-between gap-6 pt-2">
                <p id={`${uid}-nota`} className="max-w-xs text-xs leading-relaxed text-spuma/50">
                  Concept dimostrativo: il modulo non invia dati.
                </p>
                <button
                  type="submit"
                  className="etichetta group relative flex items-center gap-4 border border-ottone/60 px-7 py-4 text-[0.66rem] text-spuma transition-colors duration-700 hover:bg-ottone hover:text-abisso"
                >
                  Richiedi la prova
                  <span aria-hidden className="block h-px w-6 bg-current transition-[width] duration-700 group-hover:w-10" />
                </button>
              </div>
            </form>
          ) : (
            <div className="prova-ok flex min-h-[20rem] flex-col justify-center" role="status" tabIndex={-1}>
              <p className="titolo text-[clamp(2.6rem,6vw,5rem)] text-spuma">
                A presto, <em className="italic text-sabbia">a bordo.</em>
              </p>
              <svg className="prova-ok-linea mt-4 h-3 w-[min(100%,26rem)]" viewBox="0 0 400 12" preserveAspectRatio="none" aria-hidden>
                <path d="M2 8 C 80 3, 160 10, 240 6 S 360 4, 398 7" fill="none" stroke="var(--color-ottone)" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-spuma/70">
                Abbiamo preso nota della richiesta. In un sito vero, a questo punto, il cantiere vi scriverebbe entro un giorno.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
