import { FounderPortrait } from "@/components/about/FounderPortrait";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { founders } from "@/content/founders";
import { foundersTeaser } from "@/content/home";

/** Text left, the two portrait cards right. */
export function FoundersTeaser() {
  return (
    <Section labelledBy="founders-heading">
      <Container className="grid items-center gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] xl:gap-x-24">
        <div>
          <Eyebrow>{foundersTeaser.eyebrow}</Eyebrow>
          <SplitHeading id="founders-heading" lines={[foundersTeaser.heading]} className="h2-std mt-4 lg:mt-5" />
          <Reveal>
            <p className="mt-4 max-w-[560px] text-base leading-[1.6] lg:mt-8">{foundersTeaser.text}</p>
          </Reveal>
          <ArrowLink href={foundersTeaser.link.href} className="mt-7">
            {foundersTeaser.link.label}
          </ArrowLink>
        </div>

        <StaggerGroup className="grid grid-cols-2 gap-3 md:gap-(--card-gap)">
          {founders.map((founder) => (
            <FounderPortrait
              key={founder.id}
              name={founder.name}
              role={founder.role}
              initials={founder.initials}
              tone={founder.tone}
              image={founder.image}
              sizes="(min-width: 1024px) 26vw, 46vw"
            />
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  );
}
