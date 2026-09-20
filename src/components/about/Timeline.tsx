"use client";

import clsx from "clsx";
import { useRef } from "react";
import type { TimelineEntry } from "@/content/founders";
import { DESKTOP, MOTION_OK, gsap, useGSAP } from "@/lib/gsap";

type TimelineProps = { entries: TimelineEntry[] };

const YEAR = /^\d{4}$/;

/**
 * Career timeline: hairline rail with olive dots. A steel line fills the rail with the
 * scroll position (scrubbed) and the entries rise in one after another when the list enters.
 * Without motion the rail is simply filled.
 */
export function Timeline({ entries }: TimelineProps) {
  const root = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLSpanElement>(null);
  const list = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        const items = list.current ? Array.from(list.current.children) : [];
        const desktop = window.matchMedia(DESKTOP).matches;
        list.current?.setAttribute("data-revealed", "");

        gsap.fromTo(
          fill.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top 70%", end: "bottom 60%", scrub: true },
          },
        );
        gsap.fromTo(
          items,
          { y: desktop ? 30 : 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            ease: "power1.out",
            stagger: 0.08,
            clearProps: "transform,opacity",
            scrollTrigger: { trigger: root.current, start: "top 85%" },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative">
      <span aria-hidden="true" className="absolute top-2 bottom-2 left-[4.5px] w-px bg-line" />
      <span
        ref={fill}
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-[4.5px] w-px origin-top bg-steel-400"
      />
      <ol ref={list} data-stagger="">
        {entries.map((entry) => (
          <li
            key={`${entry.period}-${entry.text}`}
            className="relative grid gap-x-6 gap-y-1 pb-7 pl-9 last:pb-0 md:grid-cols-[200px_minmax(0,1fr)]"
          >
            <span aria-hidden="true" className="absolute top-[7px] left-0 size-2.5 rounded-full bg-olive-500" />
            <p className="leading-[1.1]">
              {/* years in the display voice, „bis“ and „Seit“ in Poppins 500 so the label does not shout */}
              {entry.period.split(" ").map((word, index) => (
                <span
                  key={`${index}-${word}`}
                  className={clsx(
                    index > 0 && "ml-1.5",
                    YEAR.test(word) ? "display-small text-[1.375rem]" : "text-[0.9375rem] font-medium text-slate-500",
                  )}
                >
                  {word}
                </span>
              ))}
            </p>
            <p className="text-base leading-[1.6] md:pt-px">{entry.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
