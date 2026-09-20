"use client";

import { useRef, useState } from "react";
import { formatNumber } from "@/lib/format";
import { MOTION_OK, gsap, useGSAP } from "@/lib/gsap";

type StatNumberProps = {
  value: number;
  decimals?: number;
  /** text after the number, e.g. " %" or " Mio." */
  suffix?: string;
  /** years are set without a thousands separator */
  isYear?: boolean;
};

/**
 * Display numeral in German number format, counting up from zero when it scrolls into view.
 *
 * Poppins has no tabular figures, so the digits of a running number have different widths and
 * the number would jitter (review round 1, R1-16). Every character therefore sits in a cell of
 * a fixed width: digits get `0.62em` (the widest digit of Poppins 900 at this tracking),
 * separators keep their natural width. The layout is identical in every frame, so only the
 * glyphs change.
 *
 * Years count up from twelve years earlier instead of from zero, so „2018“ never reads as a
 * wrong year while it runs. The final value is rendered on the server, so search engines,
 * screen readers, printouts and visitors with reduced motion always see the real number.
 */
export function StatNumber({ value, decimals = 0, suffix, isYear = false }: StatNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      gsap.matchMedia().add(MOTION_OK, () => {
        // A year counting up from zero would read as a wrong number for a second, so years
        // start twelve years earlier. Everything else counts up from zero.
        const from = isYear ? value - 12 : 0;
        const counter = { current: from };
        setDisplay(from);

        const tween = gsap.to(counter, {
          current: value,
          duration: 1.6,
          ease: "power2.out",
          paused: true,
          onUpdate: () => setDisplay(counter.current),
          onComplete: () => setDisplay(value),
        });

        // An IntersectionObserver instead of a ScrollTrigger: the numerals sit inside a
        // StaggerGroup that starts them shifted and invisible, so a trigger measuring the
        // element's own position would fire against the pre-animation layout and could miss.
        const observer = new IntersectionObserver(
          (entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            observer.disconnect();
            tween.play();
          },
          { rootMargin: "0px 0px -15% 0px" },
        );
        observer.observe(el);

        // Reduced motion and the cleanup of a re-run both land on the final value.
        return () => {
          observer.disconnect();
          tween.kill();
          setDisplay(value);
        };
      });
    },
    { scope: ref, dependencies: [value, isYear] },
  );

  const text = formatNumber(display, decimals, !isYear);
  const unit = suffix ? ` ${suffix.trim()}` : null;

  // While the number runs, assistive technology reads the final value instead of every
  // intermediate step; the rest of the time the visible text is the accessible name.
  const running = display !== value;

  return (
    <span
      ref={ref}
      className="display-stat inline-block whitespace-nowrap tabular-cells"
      aria-label={running ? `${formatNumber(value, decimals, !isYear)}${unit ?? ""}` : undefined}
    >
      <span aria-hidden={running || undefined}>
        {text.split("").map((character, index) => (
          <span key={index} className={/\d/.test(character) ? "digit-cell" : undefined}>
            {character}
          </span>
        ))}
        {unit}
      </span>
    </span>
  );
}
