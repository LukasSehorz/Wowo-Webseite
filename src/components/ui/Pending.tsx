import { PENDING_LABEL, type Pending as PendingValue } from "@/config/site";

type PendingProps = {
  /** a confirmed value is printed as it is, `null` becomes the neutral placeholder */
  value?: PendingValue;
  tone?: "light" | "dark";
};

/** TODO(client) values: `null` renders „Angabe folgt“ in a muted tone, so nothing fake goes live. */
export function Pending({ value = null, tone = "light" }: PendingProps) {
  if (value) return <>{value}</>;
  return <span className={tone === "dark" ? "text-steel-200/70" : "text-slate-500"}>{PENDING_LABEL}</span>;
}
