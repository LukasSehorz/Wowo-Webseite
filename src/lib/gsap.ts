"use client";

// Single place where GSAP plugins and the easing tokens are registered.
// Import gsap, ScrollTrigger, SplitText and useGSAP from here, never from "gsap" directly.

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, useGSAP);

  // Same curves as the CSS tokens --ease-* in globals.css
  CustomEase.create("reveal", "0.16,1,0.3,1");
  CustomEase.create("ui", "0.3,1,0.3,1");
  CustomEase.create("nav", "0.6,0,0.4,1");
  CustomEase.create("smooth", "0.7,0,0.3,1");
  CustomEase.create("drawer", "0.7,0,0.2,1");
  CustomEase.create("fill", "0.25,0.1,0.25,1");

  ScrollTrigger.config({ ignoreMobileResize: true });
}

/*
 * One-shot reveals rely on ScrollTrigger's default toggleActions ("play none none none") and do NOT
 * set `once: true`. A `once` trigger kills itself as soon as it fires. When a page mounts with
 * content already in view, GSAP force-refreshes earlier triggers while it creates the next one;
 * a trigger that removes itself from the list in the middle of that loop makes GSAP read a stale
 * index and throw (seen on client-side navigation to /gutscheine#anfrage).
 */
export const MOTION_OK = "(prefers-reduced-motion: no-preference)";
export const FINE_POINTER = "(hover: hover) and (pointer: fine)";
export const DESKTOP = "(min-width: 768px)";

export { gsap, ScrollTrigger, SplitText, useGSAP };
