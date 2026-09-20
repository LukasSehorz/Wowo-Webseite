import type { StudyChart as StudyChartData } from "@/content/studies";
import { BarChart } from "./BarChart";
import { DotArray } from "./DotArray";
import { LineChart } from "./LineChart";
import { RatioBars } from "./RatioBars";

/** Picks the chart form that belongs to a study's data. */
export function StudyChart({ chart }: { chart: StudyChartData }) {
  switch (chart.type) {
    case "bars":
      return <BarChart {...chart} />;
    case "dots":
      return <DotArray {...chart} />;
    case "lines":
      return <LineChart {...chart} />;
    case "ratio":
      return <RatioBars {...chart} />;
  }
}
