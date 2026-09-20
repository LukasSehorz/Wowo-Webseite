import clsx from "clsx";
import type { ReactNode } from "react";
import { ui } from "@/content/global";

type SourceLineProps = {
  tone?: "light" | "dark";
  /** visually hidden prefix, so the accessible name starts with „Quelle“ although nothing is shown */
  label?: string;
  className?: string;
  children: ReactNode;
};

/**
 * 12 px source or footnote line that accompanies every statistic. The word „Quelle“ is
 * not printed (the client avoids colon constructions); screen readers still hear it first.
 */
export function SourceLine({ tone = "light", label = ui.source, className, children }: SourceLineProps) {
  return (
    <p className={clsx("source-line", tone === "dark" && "text-steel-200/80", className)}>
      <span className="sr-only">{label} </span>
      {children}
    </p>
  );
}
