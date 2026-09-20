"use client";

import { useRef, type ReactNode } from "react";
import { DESKTOP, MOTION_OK, gsap, useGSAP } from "@/lib/gsap";

type StaggerGroupProps = {
  as?: "div" | "ul" | "ol";
  className?: string;
  children: ReactNode;
};

/**
 * Direct children rise 50 px (30 px below 768 px) while fading in,
 * 500 ms each and 100 ms apart (300 ms / 50 ms on small screens), once (spec 8.6).
 */
export function StaggerGroup({ as = "div", className, children }: StaggerGroupProps) {
  const ref = useRef<HTMLDivElement>(null);
  const Tag = as as "div";

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      gsap.matchMedia().add(MOTION_OK, () => {
        const desktop = window.matchMedia(DESKTOP).matches;
        el.setAttribute("data-revealed", "");
        gsap.timeline({ scrollTrigger: { trigger: el, start: "top 88%" } }).fromTo(
          Array.from(el.children),
          { y: desktop ? 50 : 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: desktop ? 0.5 : 0.3,
            ease: "power1.out",
            stagger: desktop ? 0.1 : 0.05,
            clearProps: "transform,opacity",
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} data-stagger="" className={className}>
      {children}
    </Tag>
  );
}
