"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { Wordmark } from "@/components/ui/Wordmark";
import { SoundToggle } from "./Sound";
import { Menu } from "./Menu";

export function Header() {
  const [open, setOpen] = useState(false);
  // le immagini di sfondo del menu si scaricano solo dopo la prima apertura
  const [armed, setArmed] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <>
      <header className="gutter pointer-events-none fixed inset-x-0 top-0 z-[75] flex items-center justify-between pt-3 md:pt-5">
        <Link prefetch={false} href="/" aria-label="LINEA D’ACQUA, torna all’inizio" className="pointer-events-auto block py-3 text-spuma">
          <Wordmark className="h-[12px] w-auto md:h-[15px]" line={false} />
        </Link>
        <div className="pointer-events-auto flex items-center gap-5 md:gap-10">
          <SoundToggle />
          <button
            type="button"
            onClick={() => {
              setArmed(true);
              setOpen((o) => !o);
            }}
            aria-expanded={open}
            aria-controls="menu-principale"
            className="etichetta group relative z-[90] flex items-center gap-3 py-3 text-spuma/90 hover:text-spuma"
          >
            <span>{open ? "Chiudi" : "Menu"}</span>
            <span aria-hidden className="relative block h-[7px] w-7">
              <span
                className={`absolute left-0 top-0 h-px w-full bg-current transition-transform duration-700 [transition-timing-function:var(--ease-lusso)] ${
                  open ? "translate-y-[3px] rotate-[8deg]" : ""
                }`}
              />
              <span
                className={`absolute bottom-0 left-0 h-px w-full origin-left bg-ottone transition-transform duration-700 [transition-timing-function:var(--ease-lusso)] ${
                  open ? "-translate-y-[3px] -rotate-[8deg]" : "scale-x-[0.6] group-hover:scale-x-100"
                }`}
              />
            </span>
          </button>
        </div>
      </header>
      <Menu open={open} onClose={close} armed={armed} />
    </>
  );
}
