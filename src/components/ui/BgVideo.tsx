"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useMedia } from "@/lib/useMedia";

/** Video di sfondo: muto, in loop, parte solo quando è visibile. Con meno movimento resta il poster. */
export function BgVideo({ name, alt, className = "", priority = false }: { name: string; alt: string; className?: string; priority?: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()));
    io.observe(v);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div className={`absolute inset-0 ${className}`}>
      <Image src={`/media/video/${name}-poster.webp`} alt={alt} fill priority={priority} sizes="100vw" className="object-cover" />
      {!reduced && (
        <video ref={ref} className="absolute inset-0 h-full w-full object-cover" muted loop playsInline preload="metadata" aria-hidden tabIndex={-1}>
          <source src={`/media/video/${name}.webm`} type="video/webm" />
          <source src={`/media/video/${name}.mp4`} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
