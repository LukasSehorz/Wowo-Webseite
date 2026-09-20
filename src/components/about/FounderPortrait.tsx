import clsx from "clsx";
import Image from "next/image";

type FounderPortraitProps = {
  name: string;
  role: string;
  initials: string;
  tone: "navy" | "olive";
  /**
   * Path of the real portrait below /public (4:5, at least 1200 × 1500 px).
   * As soon as it is set in src/content/founders.ts it replaces the placeholder.
   */
  image?: string | null;
  sizes: string;
};

/**
 * Portrait card. Until the client delivers photographs it is a deliberate placeholder:
 * brand colour, large initials, the runner as a watermark. Never a generated face.
 */
export function FounderPortrait({ name, role, initials, tone, image, sizes }: FounderPortraitProps) {
  return (
    <figure
      className={clsx(
        "relative aspect-4/5 overflow-hidden rounded-card text-white",
        tone === "navy" ? "bg-navy-700" : "bg-olive-600",
      )}
    >
      {image ? (
        <>
          <Image src={image} alt={`Porträt von ${name}`} fill sizes={sizes} className="object-cover" />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-navy-900/70 to-transparent"
          />
        </>
      ) : (
        <>
          {/* Hier folgt das Porträtfoto. */}
          <span
            aria-hidden="true"
            className="display numeral-spacing absolute top-[7%] left-[8%] text-[clamp(4.5rem,9.5vw,9rem)] text-white/92"
          >
            {initials}
          </span>
          <Image
            src="/brand/mark-white.png"
            alt=""
            width={709}
            height={710}
            sizes="(min-width: 1024px) 24vw, 60vw"
            className="absolute -right-[12%] -bottom-[6%] h-auto w-[82%] opacity-8"
          />
        </>
      )}
      <figcaption className="absolute inset-x-0 bottom-0 px-4 pb-4 sm:px-6 sm:pb-5 2xl:px-10 2xl:pb-7">
        <span className="title-card block">{name}</span>
        <span className="mt-1 block text-sm leading-snug text-white/85">{role}</span>
      </figcaption>
    </figure>
  );
}
