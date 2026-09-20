"use client";

import clsx from "clsx";
import { useRef, type ReactNode } from "react";
import { MOTION_OK, gsap, useGSAP } from "@/lib/gsap";

type ImageRevealProps = {
  className?: string;
  children: ReactNode;
};

/**
 * The first child (the media) scales from 1.3 to 1 inside the clipped, rounded wrapper,
 * 1300 ms, once (spec 8.4). Further children such as captions stay still.
 */
export function ImageReveal({ className, children }: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      const media = el?.firstElementChild;
      if (!el || !media) return;

      gsap.matchMedia().add(MOTION_OK, () => {
        el.setAttribute("data-revealed", "");
        gsap
          .timeline({ scrollTrigger: { trigger: el, start: "top 92%" } })
          // Only the transform is cleared afterwards: next/image keeps its own inline styles on the element.
          .fromTo(media, { scale: 1.3 }, { scale: 1, duration: 1.3, ease: "reveal", clearProps: "transform" });
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} data-image-reveal="" className={clsx("media-frame", className)}>
      {children}
    </div>
  );
}
