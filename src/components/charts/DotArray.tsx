import type { CSSProperties } from "react";
import { ChartFrame } from "./ChartFrame";

type DotGroup = { label: string; count: number; highlight?: boolean };

type DotArrayProps = {
  caption: string;
  total: number;
  groups: DotGroup[];
};

const COLUMNS = 10;
const PITCH = 12;
const RADIUS = 4;

/** Unit chart: one dot per person, the affected ones are filled in sequence. */
export function DotArray({ caption, total, groups }: DotArrayProps) {
  const rows = Math.ceil(total / COLUMNS);
  const size = COLUMNS * PITCH;
  const summary = groups.map((group) => `${group.label}: ${group.count} von ${total}`).join(". ");

  return (
    <ChartFrame caption={caption} summary={summary}>
      <div className="grid grid-cols-2 gap-6">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="text-[0.75rem] leading-tight text-ink">
              <span className={group.highlight ? "font-semibold" : undefined}>{group.label}</span>
              <span className="mt-0.5 block font-semibold tabular-nums">
                {group.count} von {total}
              </span>
            </p>
            <svg
              viewBox={`0 0 ${size} ${rows * PITCH}`}
              className="mt-2 block w-full max-w-[100px] overflow-visible"
              role="presentation"
            >
              {Array.from({ length: total }, (_, index) => {
                const cx = (index % COLUMNS) * PITCH + PITCH / 2;
                const cy = Math.floor(index / COLUMNS) * PITCH + PITCH / 2;
                const on = index < group.count;
                if (!on) return <circle key={index} cx={cx} cy={cy} r={RADIUS} className="fill-ink/15" />;
                return (
                  <circle
                    key={index}
                    cx={cx}
                    cy={cy}
                    r={RADIUS}
                    className={group.highlight ? "chart-dot-on fill-olive-500" : "chart-dot-on fill-ink"}
                    style={{ "--i": index } as CSSProperties}
                  />
                );
              })}
            </svg>
          </div>
        ))}
      </div>
    </ChartFrame>
  );
}
