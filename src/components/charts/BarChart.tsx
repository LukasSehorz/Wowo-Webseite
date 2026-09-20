import type { CSSProperties } from "react";
import type { BarDatum } from "@/content/studies";
import { formatNumber } from "@/lib/format";
import { ChartFrame } from "./ChartFrame";

type BarChartProps = {
  caption: string;
  data: BarDatum[];
  /** end of the value axis; the axis starts at zero */
  max: number;
  unit: string;
  decimals: number;
};

const BAR = 9;

/** Labelled horizontal bars from a zero baseline, one olive highlight, values at the row end. */
export function BarChart({ caption, data, max, unit, decimals }: BarChartProps) {
  const showUnit = unit === "%";
  const value = (datum: BarDatum) => `${formatNumber(datum.value, decimals)}${showUnit ? " %" : ""}`;
  const row = data.length > 3 ? 27 : 58;
  const height = row * data.length;
  const summary = data.map((datum) => `${datum.label}: ${formatNumber(datum.value, decimals)}\u00A0${unit}`).join(". ");

  return (
    <ChartFrame caption={caption} summary={summary}>
      <svg width="100%" height={height} className="block overflow-visible" role="presentation">
        <line x1="0" x2="0" y1="0" y2={height - 2} className="stroke-ink/25" strokeWidth="1" />
        {data.map((datum, index) => {
          const top = index * row;
          const width = `${(datum.value / max) * 100}%`;
          const fill = datum.highlight ? "fill-olive-500" : "fill-ink";
          return (
            <g key={datum.label}>
              <text
                x="8"
                y={top + 10}
                className={datum.highlight ? "fill-ink text-[0.75rem] font-semibold" : "fill-ink text-[0.75rem]"}
              >
                {datum.label}
              </text>
              <text
                x="100%"
                y={top + 10}
                textAnchor="end"
                className="chart-fade fill-ink text-[0.75rem] font-semibold tabular-nums"
                style={{ "--i": index } as CSSProperties}
              >
                {value(datum)}
              </text>
              <g className="chart-hbar" style={{ "--i": index } as CSSProperties}>
                <rect x="0" y={top + 15} width="8" height={BAR} className={fill} />
                <rect x="0" y={top + 15} width={width} height={BAR} rx="4" className={fill} />
              </g>
            </g>
          );
        })}
      </svg>
    </ChartFrame>
  );
}
