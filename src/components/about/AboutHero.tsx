import Image from "next/image";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { aboutHero } from "@/content/about";

/** Typographic hero of the reference's science page: centred display H1, lead, then one wide rounded image. */
export function AboutHero() {
  return (
    <Section padded={false} className="pt-11 pb-section md:pt-16" labelledBy="about-heading">
      <Container className="flex flex-col items-center text-center">
        <Eyebrow>{aboutHero.eyebrow}</Eyebrow>
        <SplitHeading
          as="h1"
          id="about-heading"
          lines={aboutHero.headline}
          className="display display-hero mt-4 max-w-[1100px] md:mt-5"
        />
        <Reveal delay={0.15}>
          <p className="lead mt-6 max-w-[760px] md:mt-8">{aboutHero.text}</p>
        </Reveal>
      </Container>

      <Container className="mt-10 md:mt-14">
        <ImageReveal className="aspect-4/3 rounded-card md:aspect-[21/9]">
          <Image
            src={aboutHero.image.src}
            alt={aboutHero.image.alt}
            fill
            preload
            sizes="(min-width: 1920px) 1820px, 100vw"
            className="object-cover"
            style={{ objectPosition: aboutHero.image.position }}
          />
        </ImageReveal>
      </Container>
    </Section>
  );
}
