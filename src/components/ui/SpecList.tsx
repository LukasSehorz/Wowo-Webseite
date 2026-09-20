import clsx from "clsx";
import type { ReactNode } from "react";

export type SpecRow = { id: string; label: ReactNode; value: ReactNode };

type SpecListProps = {
  rows: SpecRow[];
  tone?: "light" | "dark";
  /** phones: 52 px rows with 13 px labels, so the list fits beside a figure on one screen */
  dense?: boolean;
  /** values are sentences: below 640 px they move under the label, indented like its text */
  stack?: boolean;
  className?: string;
};

/** Label left, value right, hairlines between the rows (spec 7.4, product card spec rows). */
export function SpecList({ rows, tone = "light", dense = false, stack = false, className }: SpecListProps) {
  const line = tone === "dark" ? "border-line-dark" : "border-line";
  return (
    <dl className={clsx("border-t", line, className)}>
      {rows.map((row) => (
        <div
          key={row.id}
          className={clsx(
            "border-b",
            stack
              ? "flex flex-col gap-1.5 py-3.5 sm:min-h-14 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-[15px]"
              : "flex min-h-14 items-center justify-between gap-6 py-[15px]",
            dense && "min-h-[52px] py-2.5 lg:min-h-14 lg:py-[15px]",
            line,
          )}
        >
          <dt
            className={clsx(
              "leading-snug",
              dense ? "text-[0.8125rem] lg:text-[0.9375rem]" : "text-[0.9375rem]",
              tone === "dark" ? "text-steel-200" : "text-ink",
            )}
          >
            {row.label}
          </dt>
          {/* may wrap: content that must stay on one line sets whitespace-nowrap itself */}
          <dd className={clsx("min-w-0", stack ? "pl-[34px] text-left sm:pl-0 sm:text-right" : "text-right")}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
