"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { gsap, useGSAP, MQ } from "@/lib/gsap";
import { emit } from "@/lib/bus";
import { SITE } from "@/lib/data";
import { useGLGate } from "@/lib/useMedia";
import { glState } from "@/components/gl/state";
import { Wordmark } from "@/components/ui/Wordmark";

const DiveView = dynamic(() => import("@/components/gl/scenes").then((m) => m.DiveView), { ssr: false });

const LINKS = [
  { href: "/flotta/aurora", label: "Flotta" },
  { href: "/cantiere", label: "Cantiere" },
  { href: "/contatti", label: "Contatti" },
  { href: "/privacy", label: "Privacy" },
];

/** Footer: si risale in superficie (shader al contrario) e il wordmark si specchia nell'acqua. */
export function Footer({ rise = false }: { rise?: boolean }) {
  const root = useRef<HTMLElement>(null);
  const gate = useGLGate();
  const [glReady, setGlReady] = useState(false);
  const onReady = useCallback(() => setGlReady(true), []);
  const useGL = rise && gate;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.motion, () => {
        if (rise) {
          gsap.fromTo(
            glState.rise,
            { progress: 0 },
            {
              progress: 1,
              ease: "none",
              scrollTrigger: {
                trigger: root.current,
                start: "top bottom",
                end: "top top",
                scrub: 1.2,
                onUpdate: (self) => emit("audio:depth", 1 - self.progress),
              },
            }
          );
          gsap.fromTo(".footer-sotto", { opacity: 1 }, { opacity: 0, ease: "none", scrollTrigger: { trigger: root.current, start: "top 80%", end: "top 10%", scrub: true } });
        }
        gsap.from(".footer-in", {
          opacity: 0,
          y: 16,
          duration: 1.6,
          stagger: 0.12,
          ease: "lusso",
          scrollTrigger: { trigger: root.current, start: "top 45%" },
        });
      });
      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <footer ref={root} className="relative h-[100svh] min-h-[600px] overflow-clip" data-film>
      <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: useGL && glReady ? 0 : 1 }} aria-hidden>
        <Image src="/media/bay-blue.webp" alt="" fill sizes="100vw" className="object-cover" />
        {rise && (
          <div className="footer-sotto absolute inset-0 opacity-0 motion-safe:opacity-100">
            <Image src="/media/underwater.webp" alt="" fill sizes="100vw" className="object-cover" />
          </div>
        )}
      </div>
      {useGL && <DiveView above="/media/bay-blue.webp" below="/media/underwater.webp" mode="rise" onReady={onReady} />}
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-abisso via-abisso/55 to-abisso/10" />

      <div className="gutter absolute inset-x-0 bottom-0 pb-16 md:pb-14">
        <Wordmark reflection className="footer-in w-full text-spuma" title="LINEA D’ACQUA" />
        <div className="footer-in mt-2 flex flex-col gap-8 md:mt-0 md:flex-row md:items-end md:justify-between">
          <nav aria-label="Piè di pagina">
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <Link prefetch={false} href={l.href} className="etichetta py-2 text-[0.62rem] text-spuma/75 transition-colors duration-500 hover:text-spuma">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-2 text-xs text-spuma/55 md:text-right">
            <p>Cantiere immaginario — tutti i dati sono dimostrativi.</p>
            <p>
              Realizzato da{" "}
              <a
                href={SITE.limitlessUrl}
                target="_blank"
                rel="noopener"
                className="text-spuma/85 underline decoration-ottone/70 underline-offset-4 transition-colors hover:text-spuma"
              >
                LIMITLESS
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
