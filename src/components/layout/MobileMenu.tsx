"use client";

import clsx from "clsx";
import { AnimatePresence, motion, useDragControls, type PanInfo } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { headerCta, legalNav, mainNav, site } from "@/config/site";
import { announcements, footer, ui } from "@/content/global";
import { easeDrawer, easeReveal } from "@/lib/easing";

type MobileMenuProps = {
  open: boolean;
  /** distance of the sheet's top edge from the viewport top, in px */
  top: number;
  pathname: string;
  onClose: () => void;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Bottom sheet as in the reference: the panel starts just below the header's lower edge, has a
 * 20 px top radius and a grab handle, slides up in 600 ms, the navy backdrop fades in over
 * 800 ms and the items appear one after another (spec 12).
 */
export function MobileMenu({ open, top, pathname, onClose }: MobileMenuProps) {
  const panel = useRef<HTMLDivElement>(null);
  const dragControls = useDragControls();
  const { phone, email } = site.contact;
  const contactLines = [
    phone ? { label: phone, href: `tel:${phone.replace(/\s/g, "")}` } : null,
    email ? { label: email, href: `mailto:${email}` } : null,
  ].filter((line) => line !== null);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel.current) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = items[0];
      const last = items[items.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    panel.current?.querySelector<HTMLElement>(FOCUSABLE)?.focus();

    return () => {
      root.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) onClose();
  };

  return (
    <AnimatePresence>
      {open ? (
        <div key="mobile-menu" className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            aria-hidden="true"
            onClick={onClose}
            className="absolute inset-0 bg-navy-900/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: easeDrawer }}
          />
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={ui.menu.title}
            className="absolute inset-x-0 bottom-0 flex flex-col overflow-hidden rounded-t-[20px] bg-paper text-ink"
            style={{ top }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.6, ease: easeDrawer }}
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={onDragEnd}
          >
            <div
              onPointerDown={(event) => dragControls.start(event)}
              className="flex h-9 shrink-0 touch-none items-start justify-center pt-2.5"
            >
              <span aria-hidden="true" className="h-1 w-10 rounded-full bg-ink/15" />
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={ui.menu.close}
              className="absolute top-4 right-3 inline-flex size-11 items-center justify-center rounded-full"
            >
              <Icon name="close" size={22} />
            </button>

            <nav aria-label={ui.mainNavLabel} className="flex-1 overflow-y-auto px-gutter pt-8 pb-10">
              <ul>
                {mainNav.map((item, index) => {
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <motion.li
                      key={item.href}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.25 + index * 0.08, ease: easeReveal }}
                    >
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className="flex min-h-11 items-center gap-3 py-2.5 text-2xl leading-none font-semibold tracking-[-0.025em]"
                      >
                        {item.label}
                        <span
                          aria-hidden="true"
                          className={clsx("size-1.5 rounded-full bg-olive-600", active ? "opacity-100" : "opacity-0")}
                        />
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              {/* the three claims of the announcement bar, quiet, so the sheet does not stay empty */}
              <motion.ul
                aria-label={ui.claimsLabel}
                className="mt-9 space-y-2 border-t border-line pt-6 text-[0.8125rem] leading-snug font-medium text-slate-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4, ease: easeReveal }}
              >
                {announcements.map((claim) => (
                  <li key={claim} className="flex items-baseline gap-2.5">
                    <span aria-hidden="true" className="size-1 shrink-0 translate-y-[-3px] rounded-full bg-olive-600" />
                    {claim}
                  </li>
                ))}
              </motion.ul>

              {/* contact lines fill the lower part of the sheet as soon as the client's data exists */}
              {contactLines.length > 0 ? (
                <motion.address
                  className="mt-8 not-italic"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.45, ease: easeReveal }}
                >
                  <p className="eyebrow text-slate-500">{footer.columns.contact}</p>
                  <ul className="mt-3 space-y-1">
                    {contactLines.map((line) => (
                      <li key={line.href}>
                        <a href={line.href} className="link-quiet touch-target text-lg leading-tight font-medium">
                          {line.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.address>
              ) : null}
            </nav>

            <motion.div
              className="flex shrink-0 flex-wrap items-center justify-between gap-x-6 gap-y-4 bg-mist px-gutter pt-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5, ease: easeReveal }}
            >
              <Button href={headerCta.href} size="sm" onClick={onClose}>
                {headerCta.label}
              </Button>
              <ul className="flex gap-5 text-[0.8125rem] text-slate-500">
                {legalNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} onClick={onClose} className="link-quiet touch-target">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
