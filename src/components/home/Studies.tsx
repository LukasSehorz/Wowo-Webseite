import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Carousel } from "@/components/ui/Carousel";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { notProven, studies, studiesIntro } from "@/content/studies";
import { StudyCard } from "./StudyCard";

/**
 * Research: intro, five study cards and the box that states what is not proven. From 768 px the
 * cards form a draggable scroll-snap carousel (two full cards and a peek at 1440 px), on phones a
 * vertical stack. On desktop this sheet slides over the pinned fitting stage.
 */
export function Studies() {
  return (
    <Section id={studiesIntro.id} rounded labelledBy="studies-heading" className="pin:-mt-[100vh]">
      <Container>
        <Eyebrow>{studiesIntro.eyebrow}</Eyebrow>
        <div className="mt-4 flex flex-col gap-4 lg:mt-5 lg:gap-8">
          <SplitHeading id="studies-heading" lines={[studiesIntro.heading]} className="h2-std" />
          <Reveal>
            <p className="lead max-w-[860px]">{studiesIntro.text}</p>
          </Reveal>
        </div>

        <Carousel
          label={studiesIntro.carouselLabel}
          previousLabel={studiesIntro.previous}
          nextLabel={studiesIntro.next}
          slideClassName="md:w-[420px] lg:w-[480px] xl:w-[560px]"
          className="mt-10 lg:mt-14"
        >
          {studies.map((study) => (
            <StudyCard key={study.id} study={study} />
          ))}
        </Carousel>

        <Reveal className="mx-auto mt-12 max-w-[860px] rounded-panel border border-line p-6 md:mt-16 md:p-8">
          <h3 className="title-sm">{notProven.heading}</h3>
          <p className="mt-3 text-base leading-[1.6]">{notProven.text}</p>
        </Reveal>
      </Container>
    </Section>
  );
}
