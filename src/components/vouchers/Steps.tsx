"use client";

import { useRef } from "react";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { voucherSteps } from "@/content/steps";
import { DESKTOP, MOTION_OK, gsap, useGSAP } from "@/lib/gsap";

/**
 * Four steps in a row. A hairline connects the numbered chips and draws itself from the first
 * to the last one when the row becomes visible, while the steps rise in one after another.
 * Below 1024 px the steps stack and the line runs down the left side.
 */
export function Steps() {
  const root = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLSpanElement>(null);
  const list = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add(MOTION_OK, () => {
        const items = list.current ? Array.from(list.current.children) : [];
        const desktop = window.matchMedia(DESKTOP).matches;
        const horizontal = window.matchMedia("(min-width: 1024px)").matches;
        list.current?.setAttribute("data-revealed", "");

        gsap
          .timeline({ scrollTrigger: { trigger: root.current, start: "top 82%" } })
          .fromTo(
            line.current,
            horizontal ? { scaleX: 0 } : { scaleY: 0 },
            { scaleX: 1, scaleY: 1, duration: 1.4, ease: "smooth", clearProps: "transform" },
            0,
          )
          .fromTo(
            items,
            { y: desktop ? 50 : 30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: "power1.out", stagger: 0.18, clearProps: "transform,opacity" },
            0,
          );
      });
    },
    { scope: root },
  );

  return (
    <Section id="ablauf" labelledBy="steps-heading">
      <Container>
        <SplitHeading id="steps-heading" lines={[voucherSteps.heading]} className="h2-std" />

        <div ref={root} className="relative mt-10 lg:mt-14">
          {/* from the centre of the first chip to the centre of the last one */}
          <span
            ref={line}
            aria-hidden="true"
            className="absolute top-8 bottom-8 left-8 w-px origin-top bg-ink/25 lg:top-8 lg:right-[calc(25%-2rem-13.5px)] lg:bottom-auto lg:left-8 lg:h-px lg:w-auto lg:origin-left"
          />
          <ol ref={list} data-stagger="" className="relative grid gap-y-9 lg:grid-cols-4 lg:gap-x-[18px]">
            {voucherSteps.steps.map((step, index) => (
              <li key={step.title} className="flex gap-6 lg:block lg:pr-6">
                <span className="display-small flex size-16 shrink-0 items-center justify-center rounded-full bg-mist text-xl">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="pt-1.5 lg:pt-0">
                  <h3 className="title-sm lg:mt-7">{step.title}</h3>
                  <p className="mt-2.5 text-base leading-[1.6] lg:mt-3">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}
