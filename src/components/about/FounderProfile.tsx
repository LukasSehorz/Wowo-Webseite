import clsx from "clsx";
import { Reveal } from "@/components/motion/Reveal";
import { Chip } from "@/components/ui/Chip";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { profiles } from "@/content/about";
import type { Founder } from "@/content/founders";
import { FounderPortrait } from "./FounderPortrait";
import { Timeline } from "./Timeline";

type FounderProfileProps = {
  founder: Founder;
  /** portrait on the right: every second row */
  reversed?: boolean;
};

/**
 * One founder: portrait card (placeholder until the client delivers a photo) beside role,
 * name, short biography, qualification chips and the career timeline. On wide screens the
 * portrait stays in view while the timeline scrolls past.
 */
export function FounderProfile({ founder, reversed = false }: FounderProfileProps) {
  const headingId = `${founder.id}-heading`;

  return (
    <article
      aria-labelledby={headingId}
      className={clsx(
        "grid gap-x-16 gap-y-9 xl:gap-x-24",
        reversed ? "lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]" : "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]",
      )}
    >
      <div className={clsx(reversed && "lg:order-2")}>
        <Reveal className="mx-auto max-w-[520px] lg:sticky lg:top-[105px] lg:mx-0 lg:max-w-none">
          <FounderPortrait
            name={founder.name}
            role={founder.role}
            initials={founder.initials}
            tone={founder.tone}
            image={founder.image}
            sizes="(min-width: 1024px) 40vw, (min-width: 560px) 520px, 100vw"
          />
        </Reveal>
      </div>

      <div>
        <Eyebrow>{founder.role}</Eyebrow>
        <h2 id={headingId} className="h3-std mt-3">
          {founder.name}
        </h2>
        <p className="mt-5 max-w-[640px] text-base leading-[1.6]">{founder.bio}</p>

        <h3 className="eyebrow mt-9 text-slate-500">{profiles.qualificationsLabel}</h3>
        <ul className="mt-3 flex flex-wrap gap-2">
          {founder.qualifications.map((qualification) => (
            <li key={qualification}>
              <Chip>{qualification}</Chip>
            </li>
          ))}
        </ul>

        <h3 className="eyebrow mt-10 text-slate-500">{profiles.timelineLabel}</h3>
        <div className="mt-5">
          <Timeline entries={founder.timeline} />
        </div>
      </div>
    </article>
  );
}
