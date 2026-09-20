import type { ReactNode } from "react";

type ConfigGroupProps = {
  index: number;
  title: string;
  /** "radiogroup" when the group is a single choice */
  role?: "group" | "radiogroup";
  /** small note at the right of the heading, e.g. the placeholder price note */
  note?: string;
  children: ReactNode;
};

/** Numbered group of the configurator card. Groups are separated by hairlines. */
export function ConfigGroup({ index, title, role = "group", note, children }: ConfigGroupProps) {
  const headingId = `config-group-${index}`;
  return (
    <div
      role={role}
      aria-labelledby={headingId}
      className="border-t border-line py-8 first-of-type:border-t-0 first-of-type:pt-0 last-of-type:pb-0 md:py-10"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h3 id={headingId} className="flex items-baseline gap-3">
          <span aria-hidden="true" className="display-small text-[1.0625rem] text-olive-600">
            {String(index).padStart(2, "0")}
          </span>
          <span className="title-sm">{title}</span>
        </h3>
        {note ? <p className="source-line">{note}</p> : null}
      </div>
      <div className="mt-6">{children}</div>
    </div>
  );
}
