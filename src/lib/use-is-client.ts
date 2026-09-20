"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/** false on the server and during hydration, true once the component runs in the browser. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
