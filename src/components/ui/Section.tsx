import clsx from "clsx";
import type { ReactNode, Ref } from "react";

type SectionProps = {
  ref?: Ref<HTMLElement>;
  id?: string;
  /** background of the sheet; "none" for sections that paint their own media */
  tone?: "paper" | "navy" | "none";
  /** rounded top corners: use after full-bleed media or a differently coloured section */
  rounded?: boolean;
  /** standard vertical rhythm of 72 px (54 px below 768 px) */
  padded?: boolean;
  className?: string;
  labelledBy?: string;
  label?: string;
  children: ReactNode;
};

/**
 * One "sheet" of the page. Its background continues underneath the following
 * section by the sheet radius, so a following rounded sheet reveals it (spec 8.11).
 */
export function Section({
  ref,
  id,
  tone = "paper",
  rounded = false,
  padded = true,
  className,
  labelledBy,
  label,
  children,
}: SectionProps) {
  return (
    <section
      ref={ref}
      id={id}
      aria-labelledby={labelledBy}
      aria-label={label}
      className={clsx(
        "sheet",
        tone === "paper" && "sheet-paper",
        tone === "navy" && "sheet-navy",
        rounded && "sheet-rounded",
        padded && "py-section",
        className,
      )}
    >
      {children}
    </section>
  );
}
