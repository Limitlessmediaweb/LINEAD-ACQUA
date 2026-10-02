"use client";

/**
 * Contatore meccanico: ogni cifra è un rullo 0-9 che scorre fino al valore.
 * Le cifre partono con un leggero ritardo l'una dall'altra, come un contachilometri.
 */
export function Odometer({
  value,
  decimals = 0,
  digits = 2,
  className = "",
}: {
  value: number;
  decimals?: number;
  /** cifre intere minime (rulli vuoti a sinistra) */
  digits?: number;
  className?: string;
}) {
  const [int, dec] = value.toFixed(decimals).split(".");
  const padded = int.padStart(digits, " ");
  const chars = (decimals ? `${padded},${dec}` : padded).split("");
  const label = decimals ? `${int},${dec}` : int;

  return (
    <span className={`inline-flex overflow-clip leading-none ${className}`} aria-label={label} role="text">
      {chars.map((c, i) =>
        c === "," ? (
          <span key={i} aria-hidden>
            ,
          </span>
        ) : (
          <span key={i} aria-hidden className="relative inline-block h-[1em] w-[0.62em] overflow-clip">
            <span
              className="absolute inset-x-0 top-0 flex flex-col items-center transition-transform duration-[1500ms] [transition-timing-function:var(--ease-lusso)] motion-reduce:transition-none"
              style={{
                transform: `translateY(${-(c === " " ? 0 : Number(c) + 1)}em)`,
                transitionDelay: `${(chars.length - i) * 70}ms`,
              }}
            >
              <span className="h-[1em]"> </span>
              {Array.from({ length: 10 }, (_, d) => (
                <span key={d} className="h-[1em]">
                  {d}
                </span>
              ))}
            </span>
          </span>
        )
      )}
    </span>
  );
}
