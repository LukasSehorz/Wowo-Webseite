"use client";

import clsx from "clsx";
import Image, { getImageProps } from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { QUERY_REDUCED_MOTION, useMediaQuery } from "@/lib/use-media-query";
import { Magnetic } from "./Magnetic";

type VideoLoopProps = {
  /** path without extension: `${base}.webm`, `${base}.mp4` and the poster `${base}.jpg` must exist (16:9) */
  base: string;
  /** optional 4:5 cut of the same footage for phones (below 768 px): sources and poster */
  portraitBase?: string;
  /** the hero loads its poster with priority and may preload the video */
  eager?: boolean;
  /** `sizes` of the landscape poster; a 16:9 file that fills a taller box needs more than 100vw */
  posterSizes?: string;
  objectPosition?: string;
  /** layers between footage and pause chip, e.g. legibility overlays */
  overlay?: ReactNode;
  labels: { pause: string; play: string };
  className?: string;
  chipClassName?: string;
};

const PHONE = "(max-width: 767px)";
const LANDSCAPE = { width: 1920, height: 1080 };
const PORTRAIT = { width: 864, height: 1080 };

/**
 * Muted looping footage: the poster paints first, the sources are attached only when the block
 * comes near the viewport, playback runs only while it is in view and the video cross-fades in
 * over 200 ms. With a portrait cut, phones get the 4:5 files for poster and video (decided by
 * media query before the sources are injected). Autoplay always comes with a pause chip; with
 * reduced motion the video stays paused until the visitor starts it.
 */
export function VideoLoop({
  base,
  portraitBase,
  eager = false,
  posterSizes = "100vw",
  objectPosition = "50% 50%",
  overlay,
  labels,
  className,
  chipClassName,
}: VideoLoopProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const reducedMotion = useMediaQuery(QUERY_REDUCED_MOTION);
  const [sourceBase, setSourceBase] = useState<string | null>(null);
  const [inView, setInView] = useState(false);
  const [userChoice, setUserChoice] = useState<"play" | "pause" | null>(null);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = wrapper.current;
    if (!el) return;
    const nearObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSourceBase(portraitBase && window.matchMedia(PHONE).matches ? portraitBase : base);
          nearObserver.disconnect();
        }
      },
      { rootMargin: "75% 0px" },
    );
    const viewObserver = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    nearObserver.observe(el);
    viewObserver.observe(el);
    return () => {
      nearObserver.disconnect();
      viewObserver.disconnect();
    };
  }, [base, portraitBase]);

  const wantsPlayback = userChoice === "play" || (userChoice === null && !reducedMotion);
  const shouldPlay = sourceBase !== null && inView && wantsPlayback;

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (shouldPlay) {
      el.play().catch(() => setPlaying(false));
    } else {
      el.pause();
    }
  }, [shouldPlay]);

  const toggle = () => setUserChoice(playing ? "pause" : "play");
  const posterClass = "absolute inset-0 size-full object-cover";

  return (
    <div ref={wrapper} className={clsx("overflow-hidden bg-navy-900", className)}>
      {portraitBase ? (
        <ArtDirectedPoster
          base={base}
          portraitBase={portraitBase}
          eager={eager}
          className={posterClass}
          objectPosition={objectPosition}
        />
      ) : (
        <Image
          src={`${base}.jpg`}
          alt=""
          fill
          sizes={posterSizes}
          quality={eager ? 90 : 75}
          preload={eager}
          className="object-cover"
          style={{ objectPosition }}
        />
      )}
      {sourceBase ? (
        <video
          ref={video}
          muted
          loop
          playsInline
          // "none": one request at play time. With "metadata" Chromium aborts its first request when
          // play() arrives later and re-requests in ranges (R2-05); only the hero preloads (brief 2).
          preload={eager ? "auto" : "none"}
          poster={`${sourceBase}.jpg`}
          aria-hidden="true"
          tabIndex={-1}
          onPlaying={() => {
            setPlaying(true);
            setVisible(true);
          }}
          onPause={() => setPlaying(false)}
          className={clsx(
            "absolute inset-0 size-full object-cover transition-opacity duration-200 ease-linear",
            visible ? "opacity-100" : "opacity-0",
          )}
          style={{ objectPosition }}
        >
          <source src={`${sourceBase}.webm`} type="video/webm" />
          <source src={`${sourceBase}.mp4`} type="video/mp4" />
        </video>
      ) : null}
      {overlay}
      <Magnetic className={clsx("absolute z-20", chipClassName)}>
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? labels.pause : labels.play}
          aria-pressed={!playing}
          className="chip-glass"
        >
          <Icon name={playing ? "pause" : "play"} size={22} />
        </button>
      </Magnetic>
    </div>
  );
}

type PosterProps = {
  base: string;
  portraitBase: string;
  eager: boolean;
  className: string;
  objectPosition: string;
};

/** Poster with art direction: the 4:5 file below 768 px, the 16:9 file from 768 px (docs: getImageProps). */
function ArtDirectedPoster({ base, portraitBase, eager, className, objectPosition }: PosterProps) {
  const common = { alt: "", sizes: "100vw", quality: eager ? 90 : 75 };
  const {
    props: { srcSet: landscape },
  } = getImageProps({ ...common, ...LANDSCAPE, src: `${base}.jpg` });
  const {
    props: { srcSet: portrait, ...rest },
  } = getImageProps({ ...common, ...PORTRAIT, src: `${portraitBase}.jpg` });

  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={landscape} sizes="100vw" />
      <img
        {...rest}
        alt=""
        srcSet={portrait}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding="async"
        className={className}
        style={{ objectPosition }}
      />
    </picture>
  );
}
