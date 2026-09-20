import { formatNumber } from "@/lib/format";

type StatNumberProps = {
  value: number;
  decimals?: number;
  /** text after the number, e.g. " %" or " Mio." */
  suffix?: string;
  /** years are set without a thousands separator */
  isYear?: boolean;
};

/**
 * Display numeral in German number format. Number and unit stay on one line. The numerals are
 * static, as in the reference: Poppins has no tabular figures, so a count-up changes the width
 * of the number from frame to frame (review round 1, R1-16).
 */
export function StatNumber({ value, decimals = 0, suffix, isYear = false }: StatNumberProps) {
  return (
    <span className="display-stat inline-block whitespace-nowrap">
      {formatNumber(value, decimals, !isYear)}
      {suffix ? ` ${suffix.trim()}` : null}
    </span>
  );
}
