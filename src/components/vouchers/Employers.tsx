import Image from "next/image";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { StatNumber } from "@/components/ui/StatNumber";
import { StatRow } from "@/components/ui/StatRow";
import type { IconName } from "@/components/ui/Icon";
import { employerClassification, employerFacts } from "@/content/facts";
import { employers } from "@/content/vouchers";

const icons: IconName[] = ["standing", "calendar", "shield"];

/** Three arguments for employers in the stat pattern, then the honest classification of what is proven. */
export function Employers() {
  return (
    <Section labelledBy="employers-heading">
      <Container>
        <SplitHeading
          id="employers-heading"
          lines={[employers.heading]}
          className="h2-std mx-auto max-w-[900px] text-center"
        />

        {/* a low band (16:9, 3:1 from 768 px) keeps the crop on the floor and the people */}
        <ImageReveal className="mt-8 aspect-video rounded-card md:aspect-[3/1] lg:mt-9">
          <Image
            src={employers.image.src}
            alt={employers.image.alt}
            fill
            sizes="(min-width: 1920px) 1820px, 100vw"
            className="object-cover"
            style={{ objectPosition: employers.image.position, filter: "saturate(0.82) contrast(1.04)" }}
          />
          {/* the grade of the audience tiles plus the multiply grade of the photographic bands */}
          <div aria-hidden="true" className="absolute inset-0 bg-navy-900/12 mix-blend-multiply" />
          <div aria-hidden="true" className="absolute inset-0 bg-[#8FA5B7] mix-blend-multiply" />
        </ImageReveal>

        <StatRow
          className="mt-12 md:mt-16"
          items={employerFacts.map((fact, index) => ({
            id: fact.source + index,
            icon: icons[index],
            figure:
              fact.kind === "number" ? (
                <StatNumber value={fact.value} decimals={fact.decimals} suffix={fact.suffix} />
              ) : (
                <span className="display-stat inline-block whitespace-nowrap">{fact.badge}</span>
              ),
            label: fact.label,
            source: fact.source,
          }))}
        />

        <Reveal>
          <p className="body-lg mx-auto mt-12 max-w-[760px] text-center md:mt-16">{employerClassification}</p>
        </Reveal>
      </Container>
    </Section>
  );
}
