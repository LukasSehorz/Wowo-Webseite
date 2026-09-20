import type { ReactNode } from "react";

type ChipProps = { children: ReactNode };

/** Pill tag on a mist surface, 14 px (spec 7.3). */
export function Chip({ children }: ChipProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-mist px-4 py-1.5 text-sm leading-snug">{children}</span>
  );
}
