"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { handleAnchorClick } from "@/lib/anchors";

type AnchorLinkProps = ComponentProps<typeof Link> & { href: string };

/**
 * next/link plus the in-page anchor handling of lib/anchors.ts. Every internal link of the site
 * goes through here, so a hash target on the current page always scrolls, even when the URL
 * already carries that hash.
 */
export function AnchorLink({ href, onClick, ...rest }: AnchorLinkProps) {
  return (
    <Link
      {...rest}
      href={href}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        handleAnchorClick(event, href);
      }}
    />
  );
}
