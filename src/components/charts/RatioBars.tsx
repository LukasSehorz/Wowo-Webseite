import type { CSSProperties } from "react";
import { formatNumber } from "@/lib/format";
import { ChartFrame } from "./ChartFrame";

type RatioRow = { label: string; value: number; low: number; high: number; highlight?: boolean };

type RatioBarsProps = {
  caption: string;
  /** end of the value axis in percent; the axis starts at zero */
  max: number;
  reference: { value: number; label: string };
  rows: RatioRow[];
};

const ROW = 52;
const BAR = 10;
const HEAD = 24;

/** Horizontal bars against a 100 % reference line, each with its confidence interval below. */
export function RatioBars({ caption, max, reference, rows }: RatioBarsProps) {
  const pct = (value: number) => `${(value / max) * 100}%`;
  const height = HEAD + rows.length * ROW;
  const summary = [
    `${reference.label}: ${reference.value}\u00A0%`,
    ...rows.map((row) => `${row.label}: ${row.value}\u00A0%, Konfidenzintervall ${row.low} bis ${row.high}\u00A0%`),
  ].join(". ");

  return (
    <ChartFrame caption={caption} summary={summary}>
      <svg width="100%" height={height} className="block overflow-visible" role="presentation">
        <line x1="0" x2="0" y1={HEAD} y2={height - 6} className="stroke-ink/25" strokeWidth="1" />
        <line
          x1={pct(reference.value)}
          x2={pct(reference.value)}
          y1={14}
          y2={height - 6}
          className="stroke-ink/45"
          strokeWidth="1"
        />
        <text x={pct(reference.value)} y="9" textAnchor="middle" className="fill-slate-500 text-[0.6875rem]">
          {reference.label}
        </text>

        {rows.map((row, index) => {
          const top = HEAD + index * ROW;
          const fill = row.highlight ? "fill-olive-500" : "fill-ink";
          const whiskerY = top + 17 + BAR + 8;
          return (
            <g key={row.label}>
              <text
                x="8"
                y={top + 11}
                className={row.highlight ? "fill-ink text-[0.75rem] font-semibold" : "fill-ink text-[0.75rem]"}
              >
                {row.label}
              </text>
              <text
                x="100%"
                y={top + 11}
                textAnchor="end"
                className="chart-fade fill-ink text-[0.75rem] font-semibold tabular-nums"
                style={{ "--i": index } as CSSProperties}
              >
                {formatNumber(row.value)}&nbsp;%
              </text>
              <g className="chart-hbar" style={{ "--i": index } as CSSProperties}>
                <rect x="0" y={top + 17} width="8" height={BAR} className={fill} />
                <rect x="0" y={top + 17} width={pct(row.value)} height={BAR} rx="4" className={fill} />
              </g>
              <g className="chart-fade" style={{ "--i": index * 2 } as CSSProperties}>
                <line
                  x1={pct(row.low)}
                  x2={pct(row.high)}
                  y1={whiskerY}
                  y2={whiskerY}
                  className="stroke-ink"
                  strokeWidth="1.5"
                />
                <line
                  x1={pct(row.low)}
                  x2={pct(row.low)}
                  y1={whiskerY - 4}
                  y2={whiskerY + 4}
                  className="stroke-ink"
                  strokeWidth="1.5"
                />
                <line
                  x1={pct(row.high)}
                  x2={pct(row.high)}
                  y1={whiskerY - 4}
                  y2={whiskerY + 4}
                  className="stroke-ink"
                  strokeWidth="1.5"
                />
                <text x="8" y={whiskerY + 4} className="fill-slate-500 text-[0.6875rem] tabular-nums">
                  {row.low} bis {row.high}
                </text>
              </g>
            </g>
          );
        })}
      </svg>
    </ChartFrame>
  );
}
