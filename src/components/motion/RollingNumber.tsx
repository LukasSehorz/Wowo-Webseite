"use client";

import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { easeUi } from "@/lib/easing";

type RollingNumberProps = {
  value: number;
  format: (value: number) => string;
  /** screen readers announce the new value when it changes (use for the one result that matters) */
  announce?: boolean;
  className?: string;
};

/**
 * A number that rolls to its new value in 600 ms (configurator totals). The moving text is
 * hidden from assistive technology, which reads the final value from a separate node.
 * With reduced motion the value changes at once.
 */
export function RollingNumber({ value, format, announce = false, className }: RollingNumberProps) {
  const node = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();
  const current = useMotionValue(value);
  // React renders the first value only; afterwards the motion value owns the text, so a
  // re-render can never flash the target before the roll.
  const [initial] = useState(() => format(value));

  useEffect(() => {
    if (reduced) {
      current.set(value);
      return;
    }
    const controls = animate(current, value, { duration: 0.6, ease: easeUi });
    return () => controls.stop();
  }, [value, reduced, current]);

  useMotionValueEvent(current, "change", (latest) => {
    if (node.current) node.current.textContent = format(latest);
  });

  return (
    <>
      <span ref={node} aria-hidden="true" className={className}>
        {initial}
      </span>
      <span className="sr-only" aria-live={announce ? "polite" : undefined} aria-atomic={announce ? true : undefined}>
        {format(value)}
      </span>
    </>
  );
}
