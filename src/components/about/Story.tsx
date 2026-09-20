import Image from "next/image";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { story } from "@/content/about";

/** Origin story: 4:5 photograph left, heading and two long-form paragraphs (17/27) right. */
export function Story() {
  return (
    <Section labelledBy="story-heading">
      <Container>
        <div className="mx-auto grid max-w-[1200px] items-center gap-x-16 gap-y-10 lg:grid-cols-2 xl:gap-x-20">
          <ImageReveal className="aspect-4/5 rounded-card">
            <Image
              src={story.image.src}
              alt={story.image.alt}
              fill
              sizes="(min-width: 1280px) 560px, (min-width: 1024px) 46vw, 100vw"
              className="object-cover"
              style={{ objectPosition: story.image.position }}
            />
          </ImageReveal>
          <div>
            <SplitHeading id="story-heading" lines={[story.heading]} className="h2-std" />
            <Reveal className="mt-4 space-y-5 lg:mt-8">
              {story.paragraphs.map((paragraph) => (
                <p key={paragraph} className="body-lg">
                  {paragraph}
                </p>
              ))}
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
