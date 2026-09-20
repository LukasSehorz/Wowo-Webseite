"use client";

import clsx from "clsx";
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { PointerEvent, ReactNode } from "react";

type MagneticProps = {
  /** maximum travel in px to each side */
  reach?: number;
  className?: string;
  children: ReactNode;
};

const spring = { stiffness: 140, damping: 24, mass: 1 };

/** Pointer-fine only: the element follows the pointer by at most ±5 px and springs back (spec 8.17). */
export function Magnetic({ reach = 5, className, children }: MagneticProps) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, spring);
  const springY = useSpring(y, spring);

  const onMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (reduced || event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(((event.clientX - rect.left) / rect.width - 0.5) * 2 * reach);
    y.set(((event.clientY - rect.top) / rect.height - 0.5) * 2 * reach);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <span className={clsx("inline-flex", className)} onPointerMove={onMove} onPointerLeave={onLeave}>
      <motion.span className="inline-flex" style={{ x: springX, y: springY }}>
        {children}
      </motion.span>
    </span>
  );
}
