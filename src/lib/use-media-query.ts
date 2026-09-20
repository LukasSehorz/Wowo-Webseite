"use client";

import { useSyncExternalStore } from "react";

/** Returns false on the server and during hydration, then the live match. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const QUERY_FINE_POINTER = "(hover: hover) and (pointer: fine)";
export const QUERY_REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
export const QUERY_DESKTOP = "(min-width: 1024px)";
