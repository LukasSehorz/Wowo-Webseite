"use client";

import clsx from "clsx";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { SourceLine } from "@/components/ui/SourceLine";
import { SpecList } from "@/components/ui/SpecList";
import { ui } from "@/content/global";
import { pressure } from "@/content/home";
import { formatNumber } from "@/lib/format";
import { MOTION_OK, gsap, useGSAP } from "@/lib/gsap";
import { PRESSURE_RAMP, renderPressureMap } from "@/lib/pressure-model";

type Side = "without" | "with";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (edge0: number, edge1: number, x: number) => {
  const k = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return k * k * (3 - 2 * k);
};

const rampGradient = `linear-gradient(to right, ${PRESSURE_RAMP.map(
  ([stop, [r, g, b]]) => `rgb(${r} ${g} ${b}) ${stop * 100}%`,
).join(", ")})`;

const figureLabel = `${pressure.figureLabel}. ${pressure.readouts
  .map(
    (row) =>
      `${row.label}: ${pressure.states.without} ${formatNumber(row.without, row.decimals)} ${row.unit}, ${pressure.states.with} ${formatNumber(row.with, row.decimals)} ${row.unit}`,
  )
  .join(". ")}.`;

/**
 * Dark band with the interactive pressure map: a canvas sensor grid morphs between the two
 * measured states. `t` lives in a ref and is written straight to canvas, read-outs and
 * slider, so dragging never re-renders React. The model itself is lib/pressure-model.ts.
 */
export function PressureMap() {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const glow = useRef<HTMLCanvasElement>(null);
  const slider = useRef<HTMLInputElement>(null);
  const valueNodes = useRef<(HTMLSpanElement | null)[]>([]);
  const changeNodes = useRef<(HTMLSpanElement | null)[]>([]);
  const t = useRef(1);
  const tween = useRef<gsap.core.Tween | null>(null);
  const [side, setSide] = useState<Side>("with");

  const draw = useCallback(() => {
    const box = stage.current;
    const main = canvas.current;
    const halo = glow.current;
    if (!box || !main || !halo || box.clientWidth === 0) return;
    const width = box.clientWidth;
    const height = box.clientHeight;
    renderPressureMap(main, {
      t: t.current,
      width,
      height,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      cell: width < 420 ? 7 : 9,
      gap: width < 420 ? 1.25 : 1.5,
    });
    // the soft glow behind the map is a small blurred copy of the same frame
    const w = Math.round(width / 3);
    const h = Math.round(height / 3);
    if (halo.width !== w) halo.width = w;
    if (halo.height !== h) halo.height = h;
    const context = halo.getContext("2d");
    context?.clearRect(0, 0, w, h);
    context?.drawImage(main, 0, 0, w, h);
  }, []);

  const apply = useCallback(
    (next: number, syncSide = true) => {
      t.current = next;
      draw();
      pressure.readouts.forEach((row, index) => {
        const value = valueNodes.current[index]?.firstChild;
        if (value) value.nodeValue = formatNumber(lerp(row.without, row.with, next), row.decimals);
        const change = changeNodes.current[index];
        // the published change belongs to the insole state: dimmed until the map gets there
        if (change) change.style.opacity = String(lerp(0.3, 1, smoothstep(0.55, 1, next)));
      });
      const input = slider.current;
      if (input) {
        input.value = String(next);
        input.style.setProperty("--range-fill", `${next * 100}%`);
        input.setAttribute(
          "aria-valuetext",
          next <= 0.01 ? pressure.states.without : next >= 0.99 ? pressure.states.with : `${Math.round(next * 100)} %`,
        );
      }
      if (syncSide) setSide(next >= 0.5 ? "with" : "without");
    },
    [draw],
  );

  // The segmented control answers at once, the map follows in 900 ms.
  const select = useCallback(
    (next: Side) => {
      const target = next === "with" ? 1 : 0;
      tween.current?.kill();
      setSide(next);
      if (!window.matchMedia(MOTION_OK).matches) {
        apply(target);
        return;
      }
      const state = { value: t.current };
      tween.current = gsap.to(state, {
        value: target,
        duration: 0.9,
        ease: "smooth",
        onUpdate: () => apply(state.value, false),
      });
    },
    [apply],
  );

  useEffect(() => {
    const box = stage.current;
    if (!box) return;
    const observer = new ResizeObserver(draw);
    observer.observe(box);
    return () => observer.disconnect();
  }, [draw]);

  // First visit: the map starts in the "boot only" state and morphs once (2.2 s, smooth easing)
  // as soon as its centre has entered the lower quarter of the viewport, so the arch is in view.
  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        apply(0);
        const state = { value: 0 };
        tween.current = gsap.to(state, {
          value: 1,
          duration: 2.2,
          ease: "smooth",
          scrollTrigger: { trigger: stage.current, start: "center 75%" },
          onUpdate: () => apply(state.value),
        });
        return () => tween.current?.kill();
      });
    },
    { scope: stage },
  );

  const onSliderInput = (value: string) => {
    tween.current?.kill();
    apply(Number(value));
  };

  const onSliderKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    const direction = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[event.key];
    if (!direction) return;
    event.preventDefault();
    tween.current?.kill();
    apply(Math.max(0, Math.min(1, Math.round((t.current + direction * 0.1) * 10) / 10)));
  };

  return (
    <Section id={pressure.id} tone="navy" rounded labelledBy="pressure-heading" className="scroll-mt-[-16px]">
      <Container className="grid items-center gap-x-12 gap-y-8 lg:grid-cols-2 lg:gap-y-10 xl:grid-cols-[minmax(0,1fr)_minmax(0,560px)] xl:gap-x-24">
        {/* Below 1024 px the wrapper dissolves: intro, then switch, map, slider and legend, then the
            read-outs, so that map, switch and values share one phone screen (R1-04). */}
        <div className="contents lg:block">
          <div className="order-1">
            <Eyebrow tone="accent-dark">{pressure.eyebrow}</Eyebrow>
            <SplitHeading
              id="pressure-heading"
              lines={[pressure.heading]}
              className="h2-std mt-4 max-w-[640px] lg:mt-5"
            />
            <p className="mt-4 max-w-[600px] text-base leading-[1.6] text-steel-200 lg:mt-8">{pressure.text}</p>
          </div>

          <div className="order-3 lg:mt-9">
            <SpecList
              tone="dark"
              dense
              className="max-w-[600px]"
              rows={pressure.readouts.map((row, index) => ({
                id: row.id,
                label: row.label,
                value: (
                  <span className="flex items-center justify-end gap-3">
                    <span className="text-lg leading-none font-medium whitespace-nowrap text-white tabular-nums">
                      <span
                        ref={(node) => {
                          valueNodes.current[index] = node;
                        }}
                      >
                        {formatNumber(row.with, row.decimals)}
                      </span>
                      {` ${row.unit}`}
                    </span>
                    <span
                      ref={(node) => {
                        changeNodes.current[index] = node;
                      }}
                      className="min-w-[4.25rem] rounded-full border border-line-dark px-2.5 py-1.5 text-center text-xs leading-none whitespace-nowrap text-olive-300 tabular-nums"
                    >
                      {row.change}
                    </span>
                  </span>
                ),
              }))}
            />

            <p className="mt-7 max-w-[600px] text-base leading-[1.6] text-white">{pressure.explanation}</p>
            <SourceLine tone="dark" label={ui.noteAndSource} className="mt-5 max-w-[600px]">
              {pressure.note}
            </SourceLine>
          </div>
        </div>

        <div className="order-2 mx-auto flex w-full max-w-[560px] flex-col items-center">
          {/* phones: the canvas keeps 7:8 at min(343px, 44svh) tall; from 1024 px it fills the column */}
          <div
            ref={stage}
            role="img"
            aria-label={figureLabel}
            className="relative order-2 h-[min(343px,44svh)] w-auto max-w-full aspect-[7/8] lg:order-none lg:h-auto lg:w-full"
          >
            <canvas
              ref={glow}
              aria-hidden="true"
              className="absolute inset-0 size-full scale-105 opacity-45 blur-[18px]"
            />
            <canvas ref={canvas} aria-hidden="true" className="absolute inset-0 size-full" />
          </div>

          <div className="contents lg:mt-6 lg:flex lg:w-full lg:flex-col lg:items-center lg:gap-6">
            <fieldset className="relative order-1 mb-4 grid w-full max-w-[440px] grid-cols-2 rounded-full bg-white/8 p-1 lg:order-none lg:mb-0">
              <legend className="sr-only">{pressure.toggleLabel}</legend>
              <span
                aria-hidden="true"
                className={clsx(
                  "absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-white transition-transform duration-500 ease-ui",
                  side === "with" && "translate-x-full",
                )}
              />
              {(["without", "with"] as const).map((key) => (
                <label
                  key={key}
                  className={clsx(
                    "relative flex min-h-11 cursor-pointer items-center justify-center rounded-full px-2 text-center text-xs leading-tight font-medium whitespace-nowrap transition-colors duration-500 ease-ui has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-steel-400 min-[400px]:px-3 min-[400px]:text-[0.8125rem] sm:text-sm",
                    side === key ? "text-ink" : "text-white",
                  )}
                >
                  <input
                    type="radio"
                    name="pressure-state"
                    value={key}
                    checked={side === key}
                    onChange={() => select(key)}
                    className="sr-only"
                  />
                  {pressure.states[key]}
                </label>
              ))}
            </fieldset>

            <input
              ref={slider}
              type="range"
              min={0}
              max={1}
              step={0.01}
              defaultValue={1}
              aria-label={pressure.sliderLabel}
              aria-valuetext={pressure.states.with}
              onInput={(event) => onSliderInput(event.currentTarget.value)}
              onKeyDown={onSliderKeyDown}
              className="range order-3 mt-3 w-full max-w-[440px] lg:order-none lg:mt-0"
            />

            <div className="order-4 mt-3 flex items-center gap-3 text-xs leading-none text-steel-200 lg:order-none lg:mt-0">
              <span>{pressure.legend.low}</span>
              <span
                aria-hidden="true"
                className="h-1.5 w-28 rounded-full sm:w-40"
                style={{ background: rampGradient }}
              />
              <span>{pressure.legend.high}</span>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
