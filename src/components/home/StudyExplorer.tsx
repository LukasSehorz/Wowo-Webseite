"use client";

import clsx from "clsx";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { studies, studiesIntro } from "@/content/studies";
import { easeUi } from "@/lib/easing";
import { MOTION_OK } from "@/lib/gsap";
import { useIsClient } from "@/lib/use-is-client";
import { useMediaQuery } from "@/lib/use-media-query";
import { StudyDetails } from "./StudyDetails";
import { StudyPanel } from "./StudyPanel";

type Side = 0 | 1;

// from here the questions form a column beside the stage, below a chip row
const COLUMN_QUERY = "(min-width: 1280px)";
const KEY_STEP: Record<string, number> = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 };

/**
 * One study at a time. The questions form a tab list (a column from 1280 px, a swipeable chip row
 * below), the stage shows the chosen study and „Genauer ansehen“ opens its full record.
 * All panels share one grid cell, so the stage and the record always have the height of the
 * tallest study and the page never moves when the question changes.
 * Every study first appears in its comparison state and plays once to the result when the stage
 * is in view; the switch hands control to the visitor. Without motion everything is static.
 */
export function StudyExplorer() {
  const baseId = useId();
  const [active, setActive] = useState(0);
  const [sides, setSides] = useState<Side[]>(() => studies.map(() => 1));
  const [played, setPlayed] = useState<boolean[]>(() => studies.map(() => false));
  const [open, setOpen] = useState(false);
  const isClient = useIsClient();
  const motionOk = useMediaQuery(MOTION_OK);
  const stage = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const inView = useInView(stage, { amount: 0.5 });
  const reduced = useReducedMotion();
  const column = useMediaQuery(COLUMN_QUERY);

  const tabId = (index: number) => `${baseId}-tab-${index}`;
  const panelId = (index: number) => `${baseId}-panel-${index}`;
  const detailsId = `${baseId}-details`;

  // The server renders every result state. With motion allowed a graphic shows its comparison
  // state until it has played once (or the visitor has used its switch).
  const shownSide = (index: number): Side => (motionOk && !played[index] ? 0 : sides[index]);

  const markPlayed = useCallback((index: number) => {
    setPlayed((current) => current.map((value, i) => value || i === index));
  }, []);

  useEffect(() => {
    if (!inView || !motionOk || played[active]) return;
    const timer = window.setTimeout(() => markPlayed(active), 650);
    return () => window.clearTimeout(timer);
  }, [inView, motionOk, played, active, markPlayed]);

  // phones: keep the chosen chip inside the scrolling row
  useEffect(() => {
    const row = list.current;
    const tab = tabs.current[active];
    if (!row || !tab || row.scrollWidth <= row.clientWidth) return;
    const inset = parseFloat(getComputedStyle(row).paddingLeft) || 0;
    const start = tab.offsetLeft - inset;
    const end = tab.offsetLeft + tab.offsetWidth + inset - row.clientWidth;
    const target = row.scrollLeft > start ? start : row.scrollLeft < end ? end : null;
    if (target !== null) row.scrollTo({ left: target, behavior: reduced ? "auto" : "smooth" });
  }, [active, reduced]);

  const choose = (index: number) => setActive(index);

  const onSide = (index: number, side: Side) => {
    markPlayed(index);
    setSides((current) => current.map((value, i) => (i === index ? side : value)));
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const last = studies.length - 1;
    let next: number | null = null;
    if (event.key in KEY_STEP) next = (active + KEY_STEP[event.key] + studies.length) % studies.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = last;
    if (next === null) return;
    event.preventDefault();
    choose(next);
    tabs.current[next]?.focus();
  };

  const fade = (current: boolean) =>
    reduced
      ? { duration: 0 }
      : current
        ? { duration: 0.45, delay: 0.12, ease: easeUi }
        : { duration: 0.2, ease: "linear" as const };

  return (
    <div className="grid gap-y-5 xl:grid-cols-[minmax(0,4fr)_minmax(0,9fr)] xl:gap-x-16">
      <div
        ref={list}
        role="tablist"
        aria-label={studiesIntro.listLabel}
        aria-orientation={column ? "vertical" : "horizontal"}
        data-study-tabs=""
        onKeyDown={onKeyDown}
        className="no-scrollbar relative -mx-gutter flex gap-2 overflow-x-auto overscroll-x-contain px-gutter xl:mx-0 xl:flex-col xl:gap-0 xl:self-start xl:overflow-visible xl:border-t xl:border-line xl:px-0"
      >
        {studies.map((study, index) => {
          const selected = index === active;
          return (
            <button
              key={study.id}
              ref={(node) => {
                tabs.current[index] = node;
              }}
              type="button"
              role="tab"
              id={tabId(index)}
              aria-selected={selected}
              aria-controls={panelId(index)}
              tabIndex={selected ? 0 : -1}
              onClick={() => choose(index)}
              className={clsx(
                "group flex min-h-11 w-[11.5rem] shrink-0 items-center gap-4 rounded-2xl px-4 py-2.5 text-left text-sm leading-snug transition-colors duration-300 ease-ui",
                "xl:min-h-0 xl:w-full xl:rounded-none xl:border-b xl:border-line xl:bg-transparent xl:px-0 xl:py-6 xl:text-xl",
                selected
                  ? "bg-ink text-white xl:text-ink"
                  : "bg-mist text-ink hover:bg-mist-deep xl:text-slate-500 xl:hover:bg-transparent xl:hover:text-ink",
              )}
            >
              <span
                aria-hidden="true"
                className={clsx(
                  "hidden w-6 shrink-0 text-sm tabular-nums xl:inline",
                  selected ? "text-olive-600" : "text-slate-500",
                )}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="xl:flex-1 xl:tracking-[-0.015em]">{study.question}</span>
              <Icon
                name="arrow-right"
                size={20}
                strokeWidth={1.6}
                className={clsx(
                  "hidden shrink-0 transition-[opacity,translate] duration-500 ease-ui xl:block",
                  selected ? "opacity-100" : "-translate-x-2 opacity-0",
                )}
              />
            </button>
          );
        })}
      </div>

      <div data-study-stage="" className="min-w-0 xl:col-start-2">
        <div ref={stage} className="rounded-panel bg-mist p-5 sm:p-8 xl:p-12">
          <div className="grid">
            {studies.map((study, index) => {
              const current = index === active;
              return (
                <motion.div
                  key={study.id}
                  id={panelId(index)}
                  role="tabpanel"
                  aria-labelledby={tabId(index)}
                  data-study-panel=""
                  inert={isClient && !current}
                  initial={false}
                  animate={
                    current
                      ? { opacity: 1, y: 0, visibility: "visible" }
                      : { opacity: 0, transitionEnd: { visibility: "hidden", y: 10 } }
                  }
                  transition={fade(current)}
                  className={clsx("col-start-1 row-start-1", !current && "pointer-events-none")}
                >
                  <StudyPanel study={study} side={shownSide(index)} onSide={(side) => onSide(index, side)} />
                </motion.div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          aria-expanded={open}
          aria-controls={detailsId}
          data-study-details-toggle=""
          onClick={() => setOpen((value) => !value)}
          className="group mt-3 flex min-h-12 items-center gap-3 text-base font-medium"
        >
          <span className="flex size-9 items-center justify-center rounded-full border border-ink/20 transition-colors duration-300 group-hover:border-ink">
            <Icon
              name="plus"
              size={16}
              strokeWidth={1.8}
              className={clsx("transition-transform duration-500 ease-ui", open && "rotate-45")}
            />
          </span>
          <span className="link-group">{studiesIntro.detailsToggle}</span>
        </button>

        <motion.div
          id={detailsId}
          role="region"
          aria-label={studiesIntro.detailsToggle}
          data-study-details=""
          initial={false}
          animate={
            open ? { height: "auto", visibility: "visible" } : { height: 0, transitionEnd: { visibility: "hidden" } }
          }
          transition={reduced ? { duration: 0 } : { duration: 0.35, ease: easeUi }}
          className="overflow-hidden"
        >
          <div className="grid pt-3 pb-2">
            {studies.map((study, index) => {
              const current = index === active;
              return (
                <motion.div
                  key={study.id}
                  data-study-detail=""
                  inert={isClient && !current}
                  initial={false}
                  animate={
                    current
                      ? { opacity: 1, visibility: "visible" }
                      : { opacity: 0, transitionEnd: { visibility: "hidden" } }
                  }
                  transition={fade(current)}
                  className="col-start-1 row-start-1"
                >
                  <StudyDetails study={study} />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
