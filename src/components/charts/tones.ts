import type { Tone } from "@/content/studies";

// Olive marks Formthotics, ink and slate the comparisons (BRIEF 3.1: olive is the chart primary on light).
export const toneFill: Record<Tone, string> = {
  accent: "bg-olive-500",
  neutral: "bg-ink",
  muted: "bg-slate-500",
};

export const toneText: Record<Tone, string> = {
  accent: "text-olive-600",
  neutral: "text-ink",
  muted: "text-slate-500",
};
