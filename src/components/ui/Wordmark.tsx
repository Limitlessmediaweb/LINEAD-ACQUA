import { useId } from "react";
import { WORDMARK } from "@/lib/wordmark";

type Props = {
  className?: string;
  /** riflesso distorto sotto la linea di galleggiamento */
  reflection?: boolean;
  /** linea in ottone sulla baseline */
  line?: boolean;
  title?: string;
};

/** Wordmark vettoriale. La linea in ottone è la linea di galleggiamento: sotto, il riflesso. */
export function Wordmark({ className, reflection = false, line = true, title = "LINEA D’ACQUA" }: Props) {
  const uid = useId().replace(/:/g, "");
  const PAD = 24;
  const W = WORDMARK.width + PAD * 2;
  const top = WORDMARK.capHeight + 8;
  const below = reflection ? WORDMARK.capHeight + 4 : 4;
  return (
    <svg viewBox={`0 ${-top} ${W} ${top + below}`} className={className} role="img" aria-label={title}>
      {reflection && (
        <defs>
          <linearGradient id={`f${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id={`m${uid}`} maskUnits="userSpaceOnUse" x="0" y="0" width={W} height={below}>
            <rect x="0" y="0" width={W} height={below} fill={`url(#f${uid})`} />
          </mask>
          <filter id={`r${uid}`} x="-5%" y="-10%" width="110%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.004 0.09" numOctaves="2" seed="7">
              <animate attributeName="baseFrequency" dur="9s" values="0.004 0.09;0.005 0.12;0.004 0.09" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" scale="9" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      )}
      <path d={WORDMARK.d} transform={`translate(${PAD} 0)`} fill="currentColor" />
      {reflection && (
        <g mask={`url(#m${uid})`}>
          <g filter={`url(#r${uid})`}>
            <path d={WORDMARK.d} transform={`translate(${PAD} 0) scale(1 -0.82)`} fill="currentColor" />
          </g>
        </g>
      )}
      {line && <line x1="0" x2={W} y1="0.75" y2="0.75" stroke="var(--color-ottone)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />}
    </svg>
  );
}
