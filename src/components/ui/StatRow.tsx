import clsx from "clsx";
import type { ReactNode } from "react";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { Icon, type IconName } from "./Icon";
import { SourceLine } from "./SourceLine";

export type StatItem = {
  id: string;
  icon: IconName;
  /** the display numeral: usually a <StatNumber>, or a text badge in the display voice */
  figure: ReactNode;
  label: string;
  source?: string;
};

type StatRowProps = {
  items: StatItem[];
  /** three columns, or four columns that fold to 2 × 2 on small screens */
  columns?: 3 | 4;
  className?: string;
};

/**
 * Stat trio of the reference's science page: 64 px round mist chip with a thin line icon,
 * display numeral, 14 px grey label and the source in 12 px, all centred.
 */
export function StatRow({ items, columns = 3, className }: StatRowProps) {
  return (
    <StaggerGroup
      as="ul"
      className={clsx(
        "mx-auto grid max-w-[1200px] gap-x-6 gap-y-12",
        columns === 3 ? "md:grid-cols-3" : "grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.id} className="flex flex-col items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-mist text-ink">
            <Icon name={item.icon} size={28} strokeWidth={1.4} />
          </span>
          <div className="mt-5">{item.figure}</div>
          <p className="caption mt-3 max-w-[330px]">{item.label}</p>
          {item.source ? <SourceLine className="mt-2.5 max-w-[330px]">{item.source}</SourceLine> : null}
        </li>
      ))}
    </StaggerGroup>
  );
}
