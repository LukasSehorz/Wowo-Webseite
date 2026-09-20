import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { technology } from "@/content/home";

/** Header row with an outline pill, then four feature columns (home #5 of the reference). 2×2 on small screens. */
export function Technology() {
  return (
    <Section rounded labelledBy="technology-heading">
      <Container>
        <div className="flex flex-col gap-4 lg:gap-8">
          <SplitHeading id="technology-heading" lines={[technology.heading]} className="h2-std" />
          <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <Reveal>
              <p className="max-w-[896px] text-base leading-[1.6]">{technology.text}</p>
            </Reveal>
            <Button href={technology.button.href} external variant="outline" icon="arrow-up-right" className="shrink-0">
              {technology.button.label}
            </Button>
          </div>
        </div>

        <StaggerGroup
          as="ul"
          className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 lg:mt-14 lg:grid-cols-4 lg:gap-x-[50px]"
        >
          {technology.features.map((feature) => (
            <li key={feature.title}>
              <div className="media-frame aspect-square rounded-card">
                <Image
                  src={feature.image}
                  alt={feature.alt}
                  fill
                  sizes="(min-width: 1024px) 22vw, 46vw"
                  className="object-cover"
                />
              </div>
              <h3 className="title-sm mt-6">{feature.title}</h3>
              {/* 2 × 2 on phones: 167 px columns need smaller type and hyphenation */}
              <p className="mt-3 text-[0.9375rem] leading-[1.55] hyphens-auto md:text-base md:leading-[1.6] md:hyphens-manual lg:mt-4">
                {feature.text}
              </p>
            </li>
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  );
}
