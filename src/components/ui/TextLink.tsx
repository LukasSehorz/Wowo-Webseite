import clsx from "clsx";
import type { ReactNode } from "react";
import { AnchorLink } from "./AnchorLink";

type TextLinkProps = {
  href: string;
  /** "cta": underline is visible and retracts on hover. "quiet": underline draws in on hover. */
  variant?: "cta" | "quiet";
  external?: boolean;
  className?: string;
  children: ReactNode;
};

export function TextLink({ href, variant = "quiet", external = false, className, children }: TextLinkProps) {
  const classes = clsx(variant === "cta" ? "link-cta" : "link-quiet", className);

  if (external || /^(https?:|mailto:|tel:)/.test(href)) {
    const newTab = external || href.startsWith("http");
    return (
      <a href={href} className={classes} {...(newTab ? { target: "_blank", rel: "noopener" } : {})}>
        {children}
      </a>
    );
  }

  return (
    <AnchorLink href={href} className={classes}>
      {children}
    </AnchorLink>
  );
}
