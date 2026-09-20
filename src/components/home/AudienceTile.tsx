"use client";

import clsx from "clsx";
import Image from "next/image";
import { useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { Audience } from "@/content/home";

type AudienceTileProps = {
  item: Audience;
  /** false while the photo file has not been delivered: the tile shows its mist placeholder */
  hasImage: boolean;
  sizes: string;
};

/**
 * 4:5 image card that is a button, not a link: hover or tap slides a navy panel with the
 * fact up from the bottom, the image zooms to 1.05 and the arrow turns 90°.
 */
export function AudienceTile({ item, hasImage, sizes }: AudienceTileProps) {
  const [open, setOpen] = useState(false);
  const pointer = useRef("mouse");
  const panelId = useId();

  return (
    <div
      data-open={open}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") setOpen(true);
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === "mouse") setOpen(false);
      }}
      onPointerDown={(event) => {
        pointer.current = event.pointerType;
      }}
      onClick={(event) => {
        // A mouse has already opened the panel by hovering; touch and keyboard toggle it.
        const byKeyboard = event.detail === 0;
        setOpen((value) => (pointer.current === "mouse" && !byKeyboard ? true : !value));
      }}
      className={clsx(
        "group media-frame relative aspect-4/5 cursor-pointer rounded-card has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-steel-400",
        hasImage ? "text-white" : "media-shimmer text-ink",
      )}
    >
      {hasImage ? (
        <>
          <Image
            src={item.image}
            alt={item.alt}
            fill
            sizes={sizes}
            className={clsx(
              "object-cover transition-transform duration-500 ease-ui group-hover:scale-105",
              open && "scale-105",
            )}
            style={{
              objectPosition: item.position,
              // one grade for the set: less saturation, a touch more contrast, one photo darkened
              filter: `saturate(0.82) contrast(1.04) brightness(${item.brightness ?? 1})`,
            }}
          />
          <div aria-hidden="true" className="absolute inset-0 bg-navy-900/12 mix-blend-multiply" />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-navy-900/70 to-transparent"
          />
        </>
      ) : null}

      <div className="absolute inset-x-0 bottom-0">
        <div
          aria-hidden="true"
          className={clsx(
            "absolute inset-0 bg-navy-900/88 transition-transform duration-500 ease-ui",
            open ? "translate-y-0" : "translate-y-full",
          )}
        />
        <div
          className={clsx(
            "relative px-6 pt-6 pb-5 transition-colors duration-500 ease-ui 2xl:px-10 2xl:pb-7",
            open && "text-white",
          )}
        >
          <div className="flex items-end justify-between gap-4">
            <h3 className="title-card">
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                className="text-left focus-visible:outline-none"
              >
                <span className="link-group">{item.title}</span>
              </button>
            </h3>
            <Icon
              name="arrow-right"
              size={20}
              strokeWidth={1.6}
              className={clsx("mb-1 shrink-0 transition-transform duration-500 ease-ui", open && "rotate-90")}
            />
          </div>
          <div
            id={panelId}
            className={clsx(
              "grid transition-[grid-template-rows,visibility] duration-500 ease-ui",
              open ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]",
            )}
          >
            <p className="overflow-hidden text-sm leading-normal">
              <span className="block pt-3">{item.text}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
