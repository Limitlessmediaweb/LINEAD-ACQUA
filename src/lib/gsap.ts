"use client";

// Registrazione unica dei plugin GSAP (tutti gratuiti da GSAP 3.13).
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";
import { Flip } from "gsap/Flip";
import { CustomEase } from "gsap/CustomEase";
import { useGSAP } from "@gsap/react";

let registered = false;

export function registerGsap() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVGPlugin, Flip, CustomEase, useGSAP);
  // L'ease del progetto: lento in entrata e in uscita, senza rimbalzi.
  CustomEase.create("lusso", "0.65, 0, 0.35, 1");
  gsap.defaults({ ease: "lusso", duration: 1.4 });
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

registerGsap();

export { gsap, ScrollTrigger, SplitText, DrawSVGPlugin, MorphSVGPlugin, Flip, CustomEase, useGSAP };

/** Media query condivise per gsap.matchMedia(). */
export const MQ = {
  motion: "(prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
  desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
} as const;
