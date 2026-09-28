import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { notProven, studiesIntro } from "@/content/studies";
import { StudyExplorer } from "./StudyExplorer";

// Without JavaScript the tabs cannot switch: every study stands in full, one below the other.
const noScriptStyle = `[data-study-tabs],[data-study-switch],[data-study-details-toggle]{display:none!important}[data-study-stage]{grid-column:1/-1!important}[data-study-panel],[data-study-detail],[data-study-details]{visibility:visible!important;opacity:1!important;transform:none!important;grid-area:auto!important;height:auto!important;pointer-events:auto!important}[data-study-panel]+[data-study-panel],[data-study-detail]+[data-study-detail]{margin-top:40px;padding-top:40px;border-top:1px solid rgb(11 23 38/.1)}[data-study-q]{position:static!important;width:auto!important;height:auto!important;margin:0 0 12px!important;padding:0!important;overflow:visible!important;clip:auto!important;clip-path:none!important;white-space:normal!important;font-weight:600}`;

/**
 * Research: intro, the study explorer (one question at a time) and the box that states what is
 * not proven. On desktop this sheet slides over the pinned fitting stage.
 */
export function Studies() {
  return (
    <Section id={studiesIntro.id} rounded labelledBy="studies-heading" className="pin:-mt-[100vh]">
      <noscript>
        <style>{noScriptStyle}</style>
      </noscript>
      <Container>
        <Eyebrow>{studiesIntro.eyebrow}</Eyebrow>
        <div className="mt-4 flex flex-col gap-4 lg:mt-5 lg:gap-8">
          <SplitHeading id="studies-heading" lines={[studiesIntro.heading]} className="h2-std" />
          <Reveal>
            <p className="lead max-w-[860px]">{studiesIntro.text}</p>
          </Reveal>
        </div>

        <Reveal className="mt-10 lg:mt-14">
          <StudyExplorer />
        </Reveal>

        <Reveal className="mx-auto mt-12 max-w-[860px] rounded-panel border border-line p-6 md:mt-16 md:p-8">
          <h3 className="title-sm">{notProven.heading}</h3>
          <p className="mt-3 text-base leading-[1.6]">{notProven.text}</p>
        </Reveal>
      </Container>
    </Section>
  );
}
