"use client";

import { useInView } from "motion/react";
import { useRef, type ReactNode } from "react";

type ChartFrameProps = {
  /** what is plotted, including the unit */
  caption: string;
  /** every plotted value in words, for screen readers */
  summary: string;
  legend?: ReactNode;
  children: ReactNode;
};

/**
 * Chart area of 168 px, anchored to its lower edge. The marks draw once when half of the figure is visible,
 * also inside a horizontally scrolling carousel (CSS in globals.css, [data-chart]).
 */
export function ChartFrame({ caption, summary, legend, children }: ChartFrameProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });

  return (
    <figure ref={ref} data-chart={inView ? "drawn" : "pending"} className="flex min-h-[168px] flex-col">
      <figcaption className="text-[0.6875rem] leading-[1.35] text-slate-500">{caption}</figcaption>
      {legend}
      <div className="mt-auto pt-2.5" aria-hidden="true">
        {children}
      </div>
      <p className="sr-only">{summary}</p>
    </figure>
  );
}
