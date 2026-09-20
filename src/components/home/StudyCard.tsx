import { StudyChart } from "@/components/charts/StudyChart";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Icon } from "@/components/ui/Icon";
import { SourceLine } from "@/components/ui/SourceLine";
import { TextLink } from "@/components/ui/TextLink";
import { ui } from "@/content/global";
import { studiesIntro, type Study } from "@/content/studies";

/** Mist card: display figure, title, chart in a 168 px area, statement, limits, source with DOI. */
export function StudyCard({ study }: { study: Study }) {
  return (
    <article className="flex h-full flex-col rounded-stat bg-mist p-6 md:p-7">
      <p className="display-figure">{study.figure}</p>
      <h3 className="title-sm mt-2">{study.title}</h3>

      <div className="mt-5">
        <StudyChart chart={study.chart} />
      </div>

      <p className="mt-5 text-base leading-[1.6]">{study.statement}</p>

      <div className="mt-4">
        <Eyebrow tone="muted" className="text-[0.6875rem]">
          {studiesIntro.limitsLabel}
        </Eyebrow>
        <p className="caption mt-1.5">{study.limits}</p>
      </div>

      <SourceLine className="mt-auto pt-5">
        {study.source}
        <span className="mt-1 block">
          {studiesIntro.doiLabel}{" "}
          <TextLink href={study.doi} external className="touch-target text-ink">
            {study.doi.replace("https://doi.org/", "")}
            <Icon name="arrow-up-right" size={12} strokeWidth={1.6} className="ml-0.5 inline-block align-[-1px]" />
            <span className="sr-only"> ({ui.externalHint})</span>
          </TextLink>
        </span>
      </SourceLine>
    </article>
  );
}
