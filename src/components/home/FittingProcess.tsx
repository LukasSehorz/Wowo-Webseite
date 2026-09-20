"use client";

import clsx from "clsx";
import Image from "next/image";
import { useRef, useState } from "react";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { fitting } from "@/content/steps";
import { ScrollTrigger, gsap, useGSAP } from "@/lib/gsap";

const PIN_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
// The four steps share the whole pinned distance; the next sheet slides over right after step 4
// (with CSS sticky nothing can overlap before the pin releases, so a reserved tail only stalls).
const STEPS_END = 1;

const numeral = (index: number) => String(index + 1).padStart(2, "0");

/**
 * Fitting process. One list, two presentations:
 * – wide screens with motion: a full-bleed stage pinned below the header with CSS sticky, 300vh
 *   of scrolling in all. Scroll progress picks the active step (about 470 px each at 900 px
 *   viewport height), the background cross-fades between the four images.
 * – small screens and reduced motion: heading, then a scroll-snap row of four cards.
 */
export function FittingProcess() {
  const section = useRef<HTMLElement>(null);
  const railFill = useRef<HTMLSpanElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const [pinned, setPinned] = useState(false);
  const [active, setActive] = useState(0);
  const count = fitting.steps.length;

  useGSAP(
    () => {
      gsap.matchMedia().add(PIN_QUERY, () => {
        const header = getComputedStyle(document.documentElement).getPropertyValue("--header-h-scrolled").trim();
        setPinned(true);
        trigger.current = ScrollTrigger.create({
          trigger: section.current,
          start: `top ${header || "0px"}`,
          end: "bottom bottom",
          onUpdate: (self) => {
            const stepProgress = Math.min(1, self.progress / STEPS_END);
            setActive(Math.min(count - 1, Math.floor(stepProgress * count)));
            if (railFill.current) railFill.current.style.transform = `scaleY(${stepProgress})`;
          },
        });
        return () => {
          trigger.current?.kill();
          trigger.current = null;
          setPinned(false);
          setActive(0);
        };
      });
    },
    { scope: section },
  );

  const scrollToStep = (index: number) => {
    const st = trigger.current;
    if (!st) return;
    const top = st.start + (st.end - st.start) * STEPS_END * ((index + 0.5) / count);
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <section
      ref={section}
      id={fitting.id}
      data-pin={pinned ? "" : undefined}
      aria-labelledby="fitting-heading"
      className="sheet sheet-navy sheet-rounded scroll-mt-[-16px] unpinned:py-section pin:h-[300vh]"
    >
      <div className="pin:sticky pin:top-(--header-h-scrolled) pin:h-[calc(100svh-var(--header-h-scrolled))] pin:overflow-hidden pin:rounded-t-sheet">
        <div className="shell pin:absolute pin:inset-x-0 pin:bottom-[calc(72px+15.5rem)] pin:z-10">
          <Eyebrow tone="accent-dark">{fitting.eyebrow}</Eyebrow>
          <SplitHeading id="fitting-heading" lines={[fitting.heading]} onMedia className="h2-std mt-4 lg:mt-5" />
        </div>

        <div className="unpinned:shell">
          {/* unpinned: a snap row with a peek, and from 1280 px (reduced motion) four columns */}
          <ol className="unpinned:snap-row unpinned:mt-9 xl:unpinned:mx-0 xl:unpinned:grid xl:unpinned:grid-cols-4 xl:unpinned:gap-[18px] xl:unpinned:overflow-visible xl:unpinned:px-0">
            {fitting.steps.map((step, index) => {
              const current = index === active;
              return (
                <li key={step.id} aria-current={pinned && current ? "step" : undefined}>
                  <div
                    className={clsx(
                      "relative aspect-4/3 overflow-hidden rounded-card bg-navy-700",
                      "pin:absolute pin:inset-0 pin:aspect-auto pin:rounded-none pin:transition-opacity pin:duration-1000 pin:ease-smooth",
                      current ? "pin:opacity-100" : "pin:opacity-0",
                    )}
                  >
                    <Image
                      src={step.image.src}
                      alt={step.image.alt}
                      fill
                      sizes="(min-width: 1024px) 100vw, (min-width: 480px) 340px, 74vw"
                      className={clsx(
                        "object-cover pin:transition-transform pin:ease-linear",
                        current ? "pin:scale-[1.06] pin:duration-[7000ms]" : "pin:scale-100 pin:duration-[1200ms]",
                      )}
                      style={{ objectPosition: step.image.position }}
                    />
                    {/* one grade for all four photos: multiply keeps the blacks, alpha would fog them */}
                    <div aria-hidden="true" className="absolute inset-0 bg-[#8FA5B7] mix-blend-multiply" />
                  </div>

                  <div
                    className={clsx(
                      "mt-6",
                      "pin:absolute pin:bottom-[72px] pin:left-(--gutter) pin:z-10 pin:mt-0 pin:h-52 pin:w-[min(520px,50vw)] pin:transition-[opacity,transform] pin:duration-700 pin:ease-reveal",
                      current
                        ? "pin:opacity-100 pin:delay-150"
                        : "pin:pointer-events-none pin:translate-y-4 pin:opacity-0",
                    )}
                  >
                    <p className="flex items-baseline gap-4">
                      <span className="numeral-spacing text-[2.5rem] leading-none font-black text-olive-300 pin:text-[3.5rem]">
                        {numeral(index)}
                      </span>
                      <span className="sr-only">
                        {fitting.stepLabel} {index + 1}
                      </span>
                    </p>
                    <h3 className="title-card mt-3 pin:mt-4">{step.title}</h3>
                    <p className="mt-2.5 text-base leading-[1.6] text-steel-200 pin:mt-3 pin:text-white/90">
                      {step.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* legibility for the copy at the bottom left: two light directional gradients only */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(90deg,rgb(15_32_52/0.62)_0%,rgb(15_32_52/0.3)_34%,rgb(15_32_52/0)_60%)] pin:block"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[45%] bg-[linear-gradient(0deg,rgb(15_32_52/0.45),rgb(15_32_52/0))] pin:block"
        />

        <div className="absolute top-1/2 right-(--gutter) z-10 hidden -translate-y-1/2 pin:block">
          <div className="relative flex h-60 flex-col justify-between">
            <span aria-hidden="true" className="absolute inset-y-0 right-[5px] w-px bg-white/25" />
            <span
              ref={railFill}
              aria-hidden="true"
              className="absolute inset-y-0 right-[5px] w-px origin-top scale-y-0 bg-white"
            />
            {fitting.steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                onClick={() => scrollToStep(index)}
                aria-label={`${fitting.stepLabel} ${index + 1}: ${step.title}`}
                aria-current={index === active ? "step" : undefined}
                className="group relative flex items-center justify-end gap-3 py-1 text-xs leading-none tabular-nums"
              >
                <span
                  className={clsx(
                    "transition-opacity duration-500 ease-ui",
                    index === active ? "opacity-100" : "opacity-70 group-hover:opacity-100",
                  )}
                >
                  {numeral(index)}
                </span>
                <span
                  aria-hidden="true"
                  className={clsx(
                    "size-[11px] rounded-full border border-white transition-colors duration-500 ease-ui",
                    index <= active ? "bg-white" : "bg-navy-900",
                  )}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
