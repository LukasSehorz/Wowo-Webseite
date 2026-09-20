"use client";

import clsx from "clsx";
import { motion } from "motion/react";
import { useId, useState, type ReactNode } from "react";
import { easeUi } from "@/lib/easing";
import { Icon } from "./Icon";

export type AccordionItem = { id: string; question: string; answer: ReactNode };

type AccordionProps = {
  items: AccordionItem[];
  tone?: "light" | "dark";
  /** inside a bordered card: no hairline above the first and below the last row */
  flush?: boolean;
  className?: string;
};

/**
 * One item open at a time. Height animates in 300 ms linear, the content fades in during
 * the second half, the plus icon turns 45° in 500 ms (spec 7.5). Closed answers stay in
 * the DOM for search engines and are hidden from keyboard and screen readers.
 */
export function Accordion({ items, tone = "light", flush = false, className }: AccordionProps) {
  const baseId = useId();
  const [openId, setOpenId] = useState<string | null>(null);
  const [closingId, setClosingId] = useState<string | null>(null);
  const line = tone === "dark" ? "border-line-dark" : "border-line";

  const toggle = (id: string) => {
    setClosingId(openId);
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className={clsx(!flush && "border-t", line, className)}>
      {items.map((item) => {
        const open = openId === item.id;
        const buttonId = `${baseId}-${item.id}-button`;
        const panelId = `${baseId}-${item.id}-panel`;
        return (
          <div key={item.id} className={clsx("border-b", flush && "last:border-b-0", line)}>
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center justify-between gap-6 py-7 text-left text-base leading-tight font-medium lg:py-8 lg:text-xl"
              >
                <span>{item.question}</span>
                <Icon
                  name="plus"
                  size={20}
                  className={clsx("shrink-0 transition-transform duration-500 ease-ui", open && "rotate-45")}
                />
              </button>
            </h3>
            <motion.div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              initial={false}
              animate={{ height: open ? "auto" : 0 }}
              transition={{ duration: 0.3, ease: "linear" }}
              onAnimationComplete={() => {
                if (!open && closingId === item.id) setClosingId(null);
              }}
              className="overflow-hidden"
              style={{ visibility: open || closingId === item.id ? "visible" : "hidden" }}
            >
              <motion.div
                initial={false}
                animate={{ opacity: open ? 1 : 0, y: open ? 0 : 10 }}
                transition={{ duration: 0.15, delay: open ? 0.15 : 0, ease: easeUi }}
                className={clsx(
                  "max-w-[660px] pb-8 text-base leading-[1.6]",
                  tone === "dark" ? "text-steel-200" : "text-ink",
                )}
              >
                {item.answer}
              </motion.div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
