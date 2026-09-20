"use client";

import clsx from "clsx";
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";
import { QUERY_FINE_POINTER, useMediaQuery } from "@/lib/use-media-query";

type TiltCardProps = {
  /** maximum tilt in degrees */
  max?: number;
  /** size of the card (the perspective stage) */
  className?: string;
  /** radius and other surface classes of the tilting layer; the sheen inherits the radius */
  surfaceClassName?: string;
  children: ReactNode;
};

const spring = { stiffness: 120, damping: 18, mass: 0.8 };
const IDLE_RANGE = 0.1; // ±2° at the default maximum of 10°

/**
 * Pointer-driven 3D tilt with a light sheen that follows the pointer and springs back.
 * Touch devices get a slow idle float of ±2° while the card is in view.
 */
export function TiltCard({ max = 10, className, surfaceClassName, children }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const finePointer = useMediaQuery(QUERY_FINE_POINTER);
  const inView = useInView(ref, { amount: 0.3 });

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const sheenX = useSpring(useTransform(px, [0, 1], [10, 90]), spring);
  const sheenY = useSpring(useTransform(py, [0, 1], [0, 100]), spring);
  const sheen = useMotionTemplate`radial-gradient(60% 80% at ${sheenX}% ${sheenY}%, rgb(255 255 255 / 0.2), rgb(255 255 255 / 0) 60%)`;

  useEffect(() => {
    if (reduced || finePointer || !inView) return;
    const floatX = animate(px, [0.5 - IDLE_RANGE, 0.5 + IDLE_RANGE], {
      duration: 7,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "mirror",
    });
    const floatY = animate(py, [0.5 + IDLE_RANGE, 0.5 - IDLE_RANGE], {
      duration: 9,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "mirror",
    });
    return () => {
      floatX.stop();
      floatY.stop();
    };
  }, [reduced, finePointer, inView, px, py]);

  const onMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    px.set((event.clientX - rect.left) / rect.width);
    py.set((event.clientY - rect.top) / rect.height);
  };

  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <div ref={ref} className={className} style={{ perspective: 1200 }} onPointerMove={onMove} onPointerLeave={onLeave}>
      <motion.div
        className={clsx("relative size-full", surfaceClassName)}
        // No preserve-3d here: Chromium rasterises a preserve-3d layer at low resolution (blurred text).
        style={{ rotateX, rotateY }}
      >
        {children}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] mix-blend-soft-light"
          style={{ background: sheen }}
        />
      </motion.div>
    </div>
  );
}
