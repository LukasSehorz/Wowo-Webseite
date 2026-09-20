"use client";

import { useRef, type ReactNode } from "react";
import { FINE_POINTER, MOTION_OK, gsap, useGSAP } from "@/lib/gsap";

type FooterRevealProps = { children: ReactNode };

/**
 * Footer reveal of the reference (spec 8.12): while the footer enters, the panel travels
 * from −50 % to its place and a dark veil on top fades out. Scrubbed, desktop only.
 */
export function FooterReveal({ children }: FooterRevealProps) {
  const root = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;

      gsap.matchMedia().add(`(min-width: 768px) and ${FINE_POINTER} and ${MOTION_OK}`, () => {
        const timeline = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom bottom", scrub: true },
        });
        timeline.fromTo(el, { yPercent: -50 }, { yPercent: 0 }, 0);
        timeline.fromTo(veil.current, { opacity: 0.8 }, { opacity: 0 }, 0);
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative">
      {children}
      <div
        ref={veil}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-b-sheet bg-navy-900 opacity-0"
      />
    </div>
  );
}
