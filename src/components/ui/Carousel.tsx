"use client";

import clsx from "clsx";
import {
  Children,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { Magnetic } from "@/components/motion/Magnetic";
import { useMediaQuery } from "@/lib/use-media-query";
import { Icon } from "./Icon";

type CarouselProps = {
  label: string;
  previousLabel: string;
  nextLabel: string;
  /** classes for every slide, e.g. its width */
  slideClassName?: string;
  className?: string;
  children: ReactNode;
};

const DRAG_THRESHOLD = 6;
const ROW_QUERY = "(min-width: 768px)";

/**
 * Scroll-snap carousel in the pattern of the reference's review carousel: native horizontal
 * scrolling, mouse drag, arrow keys, two round arrow buttons centred below.
 * Below 768 px it is no carousel at all: the slides form a vertical stack with natural heights,
 * because a card that is taller than a phone screen cannot be read inside a horizontal gesture.
 * The scroll container is a named region around the list, so the list keeps its semantics.
 */
export function Carousel({ label, previousLabel, nextLabel, slideClassName, className, children }: CarouselProps) {
  const id = useId();
  const scroller = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const isRow = useMediaQuery(ROW_QUERY);
  const drag = useRef({ active: false, moved: false, startX: 0, startLeft: 0 });
  const [edges, setEdges] = useState({ start: true, end: false });
  const [dragging, setDragging] = useState(false);

  const slideOffsets = useCallback(() => {
    const el = scroller.current;
    if (!el || !list.current) return [];
    const inset = parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;
    const max = el.scrollWidth - el.clientWidth;
    // the scroller is the offset parent of the slides
    return Array.from(list.current.children, (child) =>
      Math.min(max, Math.max(0, (child as HTMLElement).offsetLeft - inset)),
    );
  }, []);

  const updateEdges = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({ start: el.scrollLeft <= 2, end: el.scrollLeft >= max - 2 });
  }, []);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateEdges);
    };
    const observer = new ResizeObserver(updateEdges);
    el.addEventListener("scroll", onScroll, { passive: true });
    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, [updateEdges]);

  const nearestIndex = (offsets: number[], left: number) =>
    offsets.reduce(
      (best, offset, index) => (Math.abs(offset - left) < Math.abs(offsets[best] - left) ? index : best),
      0,
    );

  const scrollToIndex = (index: number) => {
    const el = scroller.current;
    const offsets = slideOffsets();
    if (!el || offsets.length === 0) return;
    const target = offsets[Math.min(offsets.length - 1, Math.max(0, index))];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: target, behavior: reduced ? "auto" : "smooth" });
  };

  const step = (direction: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    scrollToIndex(nearestIndex(slideOffsets(), el.scrollLeft) + direction);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    const last = Children.count(children) - 1;
    const actions: Record<string, () => void> = {
      ArrowRight: () => step(1),
      ArrowLeft: () => step(-1),
      Home: () => scrollToIndex(0),
      End: () => scrollToIndex(last),
    };
    const action = actions[event.key];
    if (action) {
      event.preventDefault();
      action();
    }
  };

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || !scroller.current) return;
    drag.current = { active: true, moved: false, startX: event.clientX, startLeft: scroller.current.scrollLeft };
  };

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = scroller.current;
    const state = drag.current;
    if (!el || !state.active) return;
    const delta = event.clientX - state.startX;
    if (!state.moved && Math.abs(delta) < DRAG_THRESHOLD) return;
    if (!state.moved) {
      state.moved = true;
      el.setPointerCapture(event.pointerId);
      el.style.scrollSnapType = "none";
      setDragging(true);
    }
    el.scrollLeft = state.startLeft - delta;
  };

  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const el = scroller.current;
    const state = drag.current;
    if (!el || !state.active) return;
    state.active = false;
    if (!state.moved) return;
    setDragging(false);

    // Settle on the neighbour in drag direction, then hand control back to scroll snap.
    const offsets = slideOffsets();
    const travelled = state.startLeft - el.scrollLeft;
    const from = nearestIndex(offsets, state.startLeft);
    const index = Math.abs(travelled) > 60 ? from + (travelled < 0 ? 1 : -1) : nearestIndex(offsets, el.scrollLeft);
    const restoreSnap = () => {
      el.style.scrollSnapType = "";
    };
    el.addEventListener("scrollend", restoreSnap, { once: true });
    window.setTimeout(restoreSnap, 700);
    scrollToIndex(index);
    if (el.hasPointerCapture(event.pointerId)) el.releasePointerCapture(event.pointerId);
  };

  // A drag must not activate the links inside a slide.
  const onClickCapture = (event: MouseEvent) => {
    if (drag.current.moved) {
      event.preventDefault();
      event.stopPropagation();
      drag.current.moved = false;
    }
  };

  return (
    <div className={className}>
      <div
        ref={scroller}
        id={id}
        role="region"
        aria-label={label}
        tabIndex={isRow ? 0 : undefined}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        className={clsx(
          "no-scrollbar relative scroll-mt-[120px] md:snap-x md:snap-mandatory md:overflow-x-auto md:overscroll-x-contain",
          dragging ? "cursor-grabbing select-none" : "md:cursor-grab",
        )}
      >
        <ul ref={list} className="flex flex-col gap-4 md:w-max md:flex-row md:gap-(--card-gap)">
          {Children.map(children, (child) => (
            <li className={clsx("md:shrink-0 md:snap-start", slideClassName)}>{child}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex justify-center gap-3 max-md:hidden">
        <CarouselButton
          label={previousLabel}
          icon="chevron-left"
          controls={id}
          disabled={edges.start}
          onClick={() => step(-1)}
        />
        <CarouselButton
          label={nextLabel}
          icon="chevron-right"
          controls={id}
          disabled={edges.end}
          onClick={() => step(1)}
        />
      </div>
    </div>
  );
}

type CarouselButtonProps = {
  label: string;
  icon: "chevron-left" | "chevron-right";
  controls: string;
  disabled: boolean;
  onClick: () => void;
};

function CarouselButton({ label, icon, controls, disabled, onClick }: CarouselButtonProps) {
  return (
    <Magnetic>
      <button
        type="button"
        aria-label={label}
        aria-controls={controls}
        aria-disabled={disabled}
        onClick={disabled ? undefined : onClick}
        className={clsx(
          "inline-flex size-10 items-center justify-center rounded-full bg-ink text-white transition-[background-color,opacity] duration-500 ease-ui",
          disabled ? "cursor-default opacity-30" : "hover:bg-navy-700",
        )}
      >
        <Icon name={icon} size={18} strokeWidth={1.8} />
      </button>
    </Magnetic>
  );
}
