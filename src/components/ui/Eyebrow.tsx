import clsx from "clsx";
import type { ReactNode } from "react";

type EyebrowProps = {
  /** olive accent on light surfaces, light olive on dark ones, muted for neutral labels */
  tone?: "accent" | "accent-dark" | "muted";
  className?: string;
  children: ReactNode;
};

const toneClass = {
  accent: "text-olive-600",
  "accent-dark": "text-olive-300",
  muted: "text-slate-500",
};

export function Eyebrow({ tone = "accent", className, children }: EyebrowProps) {
  return <p className={clsx("eyebrow", toneClass[tone], className)}>{children}</p>;
}
