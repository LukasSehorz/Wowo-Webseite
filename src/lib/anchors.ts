// In-page anchors. Next.js does not scroll again when a link leads to the URL the page already
// has (for example the header pill on /gutscheine#anfrage after the visitor scrolled up), so
// links whose target is on the current page are handled here: scroll to the section and move
// focus into it. Everything else stays a normal navigation.

import type { MouseEvent } from "react";

export const MOTION_OK_QUERY = "(prefers-reduced-motion: no-preference)";

/** Marks the element inside a section that receives focus after an anchor scroll (else the section). */
export const ANCHOR_FOCUS_ATTRIBUTE = "data-anchor-focus";

function resolveOnCurrentPage(href: string): HTMLElement | null {
  if (typeof window === "undefined") return null;
  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return null;
  }
  if (url.origin !== window.location.origin || url.pathname !== window.location.pathname || url.hash.length < 2) {
    return null;
  }
  return document.getElementById(decodeURIComponent(url.hash.slice(1)));
}

/** Scrolls to an element on the current page, updates the hash and moves focus (no page scroll). */
export function scrollToAnchor(target: HTMLElement, hash: string) {
  const smooth =
    window.matchMedia(MOTION_OK_QUERY).matches && document.documentElement.classList.contains("smooth-anchors");
  if (window.location.hash !== hash) window.history.pushState(null, "", hash);
  target.scrollIntoView({ behavior: smooth ? "smooth" : "instant", block: "start" });
  const focusTarget = target.querySelector<HTMLElement>(`[${ANCHOR_FOCUS_ATTRIBUTE}]`) ?? target;
  if (!focusTarget.hasAttribute("tabindex") && focusTarget === target) focusTarget.tabIndex = -1;
  focusTarget.focus({ preventScroll: true });
}

/**
 * Click handler for links: returns true when the click was handled as an in-page scroll.
 * Modified clicks (new tab) and clicks with a pressed mouse button other than the main one are left alone.
 */
export function handleAnchorClick(event: MouseEvent<HTMLAnchorElement>, href: string): boolean {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return false;
  }
  const target = resolveOnCurrentPage(href);
  if (!target) return false;
  event.preventDefault();
  scrollToAnchor(target, new URL(href, window.location.href).hash);
  return true;
}
