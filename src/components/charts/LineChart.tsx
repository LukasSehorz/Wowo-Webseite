import type { CSSProperties } from "react";
import { ChartFrame } from "./ChartFrame";

type Series = {
  label: string;
  values: number[];
  highlight?: boolean;
  dashed?: boolean;
  labelAt?: { point: number; position: "above" | "below" };
};

type LineChartProps = {
  caption: string;
  yMax: number;
  points: { label: string; month: number }[];
  series: Series[];
};

// 160 px SVG with a 120 px plot between the 100 and 0 gridlines; y is in pixels, so the plot
// keeps its height on phones, only x (percent) follows the card width
const HEIGHT = 160;
const TOP = 8;
const BOTTOM = 128;
// horizontal layout in percent of the width: plot area, then a column for the end values
const X_START = 9;
const X_END = 80;
const AXIS_END = 83;
const END_COLUMN = 86;
const END_ROW = 16;
const DASH = "4 3";

const neutralStrokes = ["stroke-slate-500", "stroke-ink"];
const neutralFills = ["fill-slate-500", "fill-ink"];

/**
 * Three measurement points on a true time axis (months), value axis from zero. Labelling is
 * built for a three-second read: the two series that differ after three months carry name and
 * value there, and where all lines meet after twelve months the values stand beside the end
 * points in a column of line keys. Series differ by colour and, where flagged, by a dash pattern,
 * so no value depends on colour alone. The legend names every line.
 * Segments are separate lines so that x can be a percentage while text keeps its size.
 */
export function LineChart({ caption, yMax, points, series }: LineChartProps) {
  const lastIndex = points.length - 1;
  const lastMonth = points[lastIndex].month;
  const x = (month: number) => `${X_START + (month / lastMonth) * (X_END - X_START)}%`;
  const y = (value: number) => BOTTOM - (value / yMax) * (BOTTOM - TOP);

  const neutralOrder = series.filter((item) => !item.highlight);
  const styled = series.map((item) => {
    const tone = neutralOrder.indexOf(item) % neutralStrokes.length;
    return {
      ...item,
      stroke: item.highlight ? "stroke-olive-500" : neutralStrokes[tone],
      fill: item.highlight ? "fill-olive-500" : neutralFills[tone],
      dash: item.dashed ? DASH : undefined,
    };
  });
  // the highlighted series is drawn last, so its marks stay visible where lines overlap
  const drawOrder = [...styled].sort((a, b) => Number(a.highlight ?? false) - Number(b.highlight ?? false));

  const byEndValue = [...styled].sort((a, b) => b.values[lastIndex] - a.values[lastIndex]);
  const endMean = byEndValue.reduce((sum, item) => sum + y(item.values[lastIndex]), 0) / byEndValue.length;
  const endRowY = (row: number) => Math.max(TOP + 3, endMean - ((byEndValue.length - 1) / 2) * END_ROW) + row * END_ROW;

  const summary = series
    .map((item) => `${item.label}: ${points.map((point, index) => `${point.label} ${item.values[index]}`).join(", ")}`)
    .join(". ");

  const legend = (
    <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.6875rem] leading-tight text-ink">
      {styled.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5">
          <svg width="18" height="8" aria-hidden="true">
            <line x1="1" x2="17" y1="4" y2="4" strokeWidth="2" strokeDasharray={item.dash} className={item.stroke} />
          </svg>
          <span className={item.highlight ? "font-semibold" : undefined}>{item.label}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <ChartFrame caption={caption} summary={summary} legend={legend}>
      <svg width="100%" height={HEIGHT} className="block overflow-visible" role="presentation">
        <line x1="0" x2={`${AXIS_END}%`} y1={BOTTOM} y2={BOTTOM} className="stroke-ink/25" strokeWidth="1" />
        <line x1="0" x2={`${AXIS_END}%`} y1={TOP} y2={TOP} className="stroke-ink/10" strokeWidth="1" />
        <text x="0" y={BOTTOM - 4} className="fill-slate-500 text-[0.625rem]">
          0
        </text>
        <text x="0" y={TOP + 11} className="fill-slate-500 text-[0.625rem]">
          {yMax}
        </text>

        {points.map((point, index) => {
          const last = index === lastIndex;
          return (
            <g key={point.label}>
              <line
                x1={x(point.month)}
                x2={x(point.month)}
                y1={BOTTOM}
                y2={BOTTOM + 4}
                className="stroke-ink/25"
                strokeWidth="1"
              />
              {/* On the true time axis the first two ticks are close: the first label is centred on its
                  tick, the last one is set against the right edge, so none of them collide on narrow cards. */}
              <text
                x={last ? "100%" : x(point.month)}
                y={BOTTOM + 18}
                dx={index === 0 || last ? 0 : -3}
                textAnchor={last ? "end" : index === 0 ? "middle" : "start"}
                className="fill-slate-500 text-[0.6875rem]"
              >
                {point.label}
              </text>
            </g>
          );
        })}

        <g className="chart-wipe">
          {/* an unpainted rectangle gives the wipe the size of the whole plot, so no stroke is clipped */}
          <rect x="0" y="0" width="100%" height={HEIGHT} fill="none" />
          {drawOrder.map((item) =>
            item.values
              .slice(1)
              .map((value, index) => (
                <line
                  key={`${item.label}-${points[index].label}`}
                  x1={x(points[index].month)}
                  y1={y(item.values[index])}
                  x2={x(points[index + 1].month)}
                  y2={y(value)}
                  strokeWidth="2"
                  strokeLinecap={item.dash ? "butt" : "round"}
                  strokeDasharray={item.dash}
                  className={item.stroke}
                />
              )),
          )}
        </g>

        {drawOrder.map((item) =>
          item.values.map((value, index) => (
            <circle
              key={`${item.label}-${points[index].label}`}
              cx={x(points[index].month)}
              cy={y(value)}
              r="4"
              strokeWidth="2"
              className={`chart-fade stroke-mist ${item.fill}`}
              style={{ "--i": index * 4 } as CSSProperties}
            />
          )),
        )}

        {styled.map((item) => {
          if (!item.labelAt) return null;
          const { point, position } = item.labelAt;
          const value = item.values[point];
          return (
            <text
              key={item.label}
              x={x(points[point].month)}
              dx="-4"
              y={y(value) + (position === "above" ? -16 : 20)}
              className={`chart-fade fill-ink text-[0.6875rem] tabular-nums ${item.highlight ? "font-semibold" : ""}`}
              style={{ "--i": point * 4 } as CSSProperties}
            >
              {item.label} <tspan className="font-semibold">{value}</tspan>
            </text>
          );
        })}

        {/* end values as a column of line keys: a nested svg is placed by percent and drawn in pixels */}
        {byEndValue.map((item, row) => (
          <svg
            key={item.label}
            x={`${END_COLUMN}%`}
            y={endRowY(row) - 6}
            width="56"
            height="12"
            className="chart-fade overflow-visible"
            style={{ "--i": lastIndex * 4 } as CSSProperties}
          >
            <line x1="0" x2="15" y1="6" y2="6" strokeWidth="2" strokeDasharray={item.dash} className={item.stroke} />
            <text x="21" y="10" className="fill-ink text-[0.6875rem] font-semibold tabular-nums">
              {item.values[lastIndex]}
            </text>
          </svg>
        ))}
      </svg>
    </ChartFrame>
  );
}
