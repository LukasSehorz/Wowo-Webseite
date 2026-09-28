import clsx from "clsx";
import { RollingNumber } from "@/components/motion/RollingNumber";
import type { StudyVisual } from "@/content/studies";
import { formatNumber } from "@/lib/format";
import { toneFill } from "./tones";

type BarsVisual = Extract<StudyVisual, { type: "bars" }>;

type CompareBarsProps = Omit<BarsVisual, "type"> & { side: 0 | 1 };

/**
 * Thick horizontal bars from zero on a white track. With a `reference` the track stands for the
 * comparison (the full length, labelled at its end), so the part a bar leaves free is the
 * difference. The width moves in 800 ms when the switch changes.
 */
export function CompareBars({ max, reference, rows, side }: CompareBarsProps) {
  const single = rows.length === 1;

  return (
    <div aria-hidden="true" className={clsx("flex flex-col", single ? "gap-2" : "gap-5")}>
      {rows.map((row, index) => (
        <div key={row.label ?? index}>
          {row.label && (
            <div className="mb-2 flex items-baseline justify-between gap-4 text-sm leading-tight">
              <span className={clsx(row.tones[side] === "accent" && "font-semibold")}>{row.label}</span>
              {row.showValue && (
                <RollingNumber
                  value={row.values[side]}
                  format={(value) => formatNumber(value)}
                  className="font-semibold tabular-nums"
                />
              )}
            </div>
          )}
          <div
            className={clsx(
              "relative overflow-hidden rounded-full bg-white",
              reference && "bar-hatch",
              single ? "h-11 sm:h-14" : "h-7 sm:h-8",
            )}
          >
            <div
              className={clsx("bar-fill absolute inset-y-0 left-0 rounded-full", toneFill[row.tones[side]])}
              style={{ width: `${(row.values[side] / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
      {reference && (
        <p className="flex items-center justify-end gap-2 text-xs leading-none text-slate-500">
          {reference}
          <span className="h-3 w-px bg-ink/30" />
        </p>
      )}
    </div>
  );
}
