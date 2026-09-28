import clsx from "clsx";
import type { CSSProperties } from "react";
import type { Tone } from "@/content/studies";
import { toneFill } from "./tones";

type PeopleGridProps = {
  total: number;
  counts: [number, number];
  tones: [Tone, Tone];
  side: 0 | 1;
};

const ROWS = 5;

/**
 * Unit chart: one figure per person in five rows, filled column by column, so the affected
 * group grows from the left like a bar. On a switch the figures that change ripple from the
 * boundary, the others recolour in reading order.
 */
export function PeopleGrid({ total, counts, tones, side }: PeopleGridProps) {
  const count = counts[side];
  const low = Math.min(...counts);
  const high = Math.max(...counts);
  const shrinking = count === low;

  return (
    <div
      aria-hidden="true"
      className="grid max-w-[560px] auto-cols-fr grid-flow-col gap-x-[3px] gap-y-1 sm:gap-x-1 sm:gap-y-1.5"
      style={{ gridTemplateRows: `repeat(${ROWS}, auto)` }}
    >
      {Array.from({ length: total }, (_, index) => {
        const changing = index >= low && index < high;
        const delay = changing ? (shrinking ? high - 1 - index : index - low) * 45 : index * 6;
        return (
          <span
            key={index}
            className={clsx("person-glyph", index < count ? toneFill[tones[side]] : "bg-ink/12")}
            style={{ "--d": `${delay}ms` } as CSSProperties}
          />
        );
      })}
    </div>
  );
}
