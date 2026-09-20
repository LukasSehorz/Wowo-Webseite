"use client";

import { MotionConfig } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { ScrollTrigger } from "@/lib/gsap";

type MotionProviderProps = { children: ReactNode };

/**
 * Motion respects the visitor's reduced-motion setting everywhere. ScrollTrigger re-measures
 * after web fonts have loaded and after every route change. A hash in the URL is honoured only
 * then: the browser's own anchor jump happens before hydration, and the reflow of fonts and
 * measured sections would leave the page beside its target. Smooth anchor scrolling is switched
 * on afterwards, so the correction itself stays instant (R1-06).
 */
export function MotionProvider({ children }: MotionProviderProps) {
  const pathname = usePathname();

  useEffect(() => {
    let cancelled = false;
    const settle = () => {
      if (cancelled) return;
      ScrollTrigger.refresh();
      const hash = window.location.hash;
      if (hash.length > 1) {
        try {
          document.querySelector(hash)?.scrollIntoView({ behavior: "instant", block: "start" });
        } catch {
          // a hash that is not a valid selector is simply ignored
        }
      }
      document.documentElement.classList.add("smooth-anchors");
      // styles that hand a control over to a JavaScript-only element key off this attribute
      document.documentElement.setAttribute("data-js", "");
    };
    document.fonts.ready.then(settle);
    const timer = window.setTimeout(settle, 600);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pathname]);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
