"use client";

import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Magnetic } from "@/components/motion/Magnetic";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { headerCta, mainNav, site } from "@/config/site";
import { ui } from "@/content/global";
import { QUERY_DESKTOP, useMediaQuery } from "@/lib/use-media-query";
import { AnnouncementBar } from "./AnnouncementBar";
import { MobileMenu } from "./MobileMenu";

const HYSTERESIS = 10;

const isActive = (href: string, pathname: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

/**
 * Transparent over the home hero with the white lockup, solid paper everywhere else.
 * Once the page is scrolled past header height + 10 px (±10 px hysteresis) the bar shrinks
 * from 92 to 81 px, the backdrop fades in and both logo versions cross-fade (spec 4).
 */
export function Header() {
  const pathname = usePathname();
  const overHero = pathname === "/";
  const bar = useRef<HTMLDivElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // the bottom sheet starts 17 px above the header's bottom edge: 60 px over the hero, 108 px
  // while the marquee of an inner page is still visible (R2-04)
  const [sheetTop, setSheetTop] = useState(60);
  const isDesktop = useMediaQuery(QUERY_DESKTOP);

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const limit = (bar.current?.offsetHeight ?? 92) + 10;
      setScrolled((previous) => window.scrollY > (previous ? limit - HYSTERESIS : limit + HYSTERESIS));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    menuButton.current?.focus();
  }, []);

  const solid = !overHero || scrolled;

  return (
    <>
      {overHero ? null : <AnnouncementBar />}
      <header
        className={clsx(
          "pointer-events-none top-0 z-40 h-header",
          overHero ? "fixed inset-x-0" : "sticky",
          solid ? "text-ink" : "text-white",
        )}
      >
        <div
          ref={bar}
          className={clsx(
            "pointer-events-auto relative py-[16.5px] transition-[padding,color] duration-500 ease-nav",
            !scrolled && "lg:py-[22px]",
          )}
        >
          <div
            aria-hidden="true"
            className={clsx(
              "absolute inset-0 border-b border-line bg-paper transition-opacity delay-100 duration-500 ease-nav",
              solid ? "opacity-100" : "opacity-0",
            )}
          />
          <div className="shell relative grid min-h-11 grid-cols-[auto_1fr] items-center gap-6 lg:min-h-12 lg:grid-cols-[1fr_auto_1fr]">
            <Link
              href="/"
              aria-label={ui.homeLinkLabel}
              className="flex min-h-11 items-center gap-3 justify-self-start"
            >
              <span className="relative block size-9 shrink-0 lg:size-10">
                <Image
                  src="/brand/mark-white.png"
                  alt=""
                  width={40}
                  height={40}
                  loading="eager"
                  className={clsx(
                    "absolute inset-0 size-full object-contain transition-opacity duration-500 ease-nav",
                    solid ? "opacity-0" : "opacity-100",
                  )}
                />
                <Image
                  src="/brand/mark.png"
                  alt=""
                  width={40}
                  height={40}
                  loading="eager"
                  className={clsx(
                    "absolute inset-0 size-full object-contain transition-opacity duration-500 ease-nav",
                    solid ? "opacity-100" : "opacity-0",
                  )}
                />
              </span>
              <span className="flex flex-col gap-[3px] whitespace-nowrap">
                <span className="text-[0.75rem] leading-none font-semibold tracking-[0.06em] uppercase min-[400px]:text-[0.8125rem]">
                  {site.lockup.line1}
                </span>
                <span className="text-[0.6875rem] leading-none tracking-[0.18em]">{site.lockup.line2}</span>
              </span>
            </Link>

            <nav aria-label={ui.mainNavLabel} className="max-lg:hidden">
              <ul className="flex items-center gap-10">
                {mainNav.map((item) => {
                  const active = isActive(item.href, pathname);
                  return (
                    <li key={item.href}>
                      <Magnetic>
                        <Link
                          href={item.href}
                          aria-current={active ? "page" : undefined}
                          className="group nav-link relative flex h-12 items-center"
                        >
                          {item.label}
                          <span
                            aria-hidden="true"
                            className={clsx(
                              "absolute top-[calc(50%+16px)] left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-current transition-transform duration-300 ease-smooth",
                              active ? "scale-100" : "scale-0 group-hover:scale-100",
                            )}
                          />
                        </Link>
                      </Magnetic>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="flex items-center gap-2 justify-self-end">
              <Button href={headerCta.href} size="sm" variant={solid ? "solid" : "glass"} className="max-md:hidden">
                {headerCta.label}
              </Button>
              <button
                ref={menuButton}
                type="button"
                aria-label={ui.menu.open}
                aria-haspopup="dialog"
                aria-expanded={menuOpen}
                onClick={() => {
                  setSheetTop(Math.max(0, Math.round((bar.current?.getBoundingClientRect().bottom ?? 77) - 17)));
                  setMenuOpen(true);
                }}
                className="-mr-2.5 inline-flex size-11 items-center justify-center lg:hidden"
              >
                <Icon name="menu" size={24} strokeWidth={1.6} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu open={menuOpen && !isDesktop} top={sheetTop} pathname={pathname} onClose={closeMenu} />
    </>
  );
}
