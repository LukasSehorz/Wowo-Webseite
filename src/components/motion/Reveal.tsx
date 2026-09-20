"use client";

import { useRef, type ReactNode } from "react";
import { MOTION_OK, gsap, useGSAP } from "@/lib/gsap";

type RevealProps = {
  /** seconds */
  delay?: number;
  className?: string;
  children: ReactNode;
};

/** Block reveal: rises 32 px while fading in, 1200 ms, once (spec 8.3). */
export function Reveal({ delay = 0, className, children }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      gsap.matchMedia().add(MOTION_OK, () => {
        el.setAttribute("data-revealed", "");
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: "top 90%" } })
          .fromTo(
            el,
            { y: 32, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.2, ease: "reveal", clearProps: "transform,opacity" },
            delay,
          );
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} data-reveal="" className={className}>
      {children}
    </div>
  );
}
