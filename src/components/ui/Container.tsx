import clsx from "clsx";
import type { ReactNode } from "react";

type ContainerProps = {
  className?: string;
  children: ReactNode;
};

/** Full-width column with the site gutters (20 / 36 / 48 px), capped at 1820 px of content. */
export function Container({ className, children }: ContainerProps) {
  return <div className={clsx("shell", className)}>{children}</div>;
}
