import clsx from "clsx";
import type { ReactNode } from "react";
import { AnchorLink } from "./AnchorLink";
import { Icon } from "./Icon";

type ArrowLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

/** 16 px text plus a 20 px arrow. The underline draws in from the left on hover (spec 7.2). */
export function ArrowLink({ href, className, children }: ArrowLinkProps) {
  return (
    <AnchorLink
      href={href}
      className={clsx(
        "group inline-flex items-center gap-1.5 text-base leading-tight pointer-coarse:min-h-11",
        className,
      )}
    >
      <span className="link-group">{children}</span>
      <Icon
        name="arrow-right"
        size={20}
        strokeWidth={1.6}
        className="shrink-0 transition-transform duration-500 ease-ui group-hover:translate-x-1"
      />
    </AnchorLink>
  );
}
