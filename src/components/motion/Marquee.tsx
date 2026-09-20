import clsx from "clsx";

type MarqueeProps = {
  items: string[];
  className?: string;
};

const COPIES = 3;
const REPEATS_PER_TRACK = 2;

/**
 * CSS marquee: identical tracks move left by their own width in 46 s, linear, forever.
 * Only the first set of items is exposed to assistive technology. Paused for reduced motion.
 */
export function Marquee({ items, className }: MarqueeProps) {
  return (
    <div className={clsx("flex overflow-hidden whitespace-nowrap", className)}>
      {Array.from({ length: COPIES }, (_, copy) => (
        <ul key={copy} className="marquee-track" aria-hidden={copy > 0 ? true : undefined}>
          {Array.from({ length: REPEATS_PER_TRACK }).flatMap((_, repeat) =>
            items.map((item) => (
              <li
                key={`${repeat}-${item}`}
                aria-hidden={copy === 0 && repeat > 0 ? true : undefined}
                className="flex items-center"
              >
                <span className="px-[clamp(28px,4vw,64px)]">{item}</span>
                <span aria-hidden="true" className="size-1 rounded-full bg-current opacity-80" />
              </li>
            )),
          )}
        </ul>
      ))}
    </div>
  );
}
