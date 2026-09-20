"use client";

import { Fragment, useRef } from "react";
import { MOTION_OK, SplitText, gsap, useGSAP } from "@/lib/gsap";

type SplitHeadingProps = {
  as?: "h1" | "h2" | "h3" | "p";
  /** One entry per line. The breaks are real from 768 px and free-flowing below. */
  lines: string[];
  /** Headings on full-bleed media start 250 ms later (spec 8.2). */
  onMedia?: boolean;
  id?: string;
  className?: string;
};

/**
 * Word-by-word heading reveal: each word rises by 90 % of its height while fading in,
 * 1000 ms, 30 ms apart, once. Words are inline blocks that reflow on resize and font swap, so
 * no re-split is needed; the split is reverted when the reveal has finished (and on unmount),
 * which leaves the plain heading in the DOM. While split, SplitText sets the aria-label.
 */
export function SplitHeading({ as = "h2", lines, onMedia = false, id, className }: SplitHeadingProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const Tag = as as "h2";

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      gsap.matchMedia().add(MOTION_OK, () => {
        const split = SplitText.create(el, { type: "words", aria: "auto" });
        el.setAttribute("data-revealed", "");

        gsap
          .timeline({
            scrollTrigger: { trigger: el, start: "top 92%" },
            onComplete: () => split.revert(),
          })
          .fromTo(
            split.words,
            { yPercent: 90, opacity: 0 },
            { yPercent: 0, opacity: 1, duration: 1, ease: "reveal", stagger: 0.03 },
            onMedia ? 0.25 : 0,
          );

        return () => split.revert();
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} id={id} data-split="" className={className}>
      {lines.map((line, index) => (
        <Fragment key={line}>
          {index > 0 ? (
            <>
              {" "}
              <br className="max-md:hidden" />
            </>
          ) : null}
          {line}
        </Fragment>
      ))}
    </Tag>
  );
}
