import clsx from "clsx";
import { Icon } from "@/components/ui/Icon";
import { TextLink } from "@/components/ui/TextLink";
import { ui } from "@/content/global";
import { studiesIntro, type Study } from "@/content/studies";

const levels = [3, 2, 1] as const;

/** The full record behind one study: design, participants, exact values with units, statistics, rating, citation and DOI. */
export function StudyDetails({ study }: { study: Study }) {
  const { details } = study;
  const labels = studiesIntro.detailLabels;

  return (
    <div className="grid gap-x-12 gap-y-8 text-[0.9375rem] leading-[1.55] md:grid-cols-2">
      <h3 data-study-q="" className="sr-only">
        {study.question}
      </h3>

      <dl className="flex flex-col gap-4">
        {details.facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-sm text-slate-500">{fact.label}</dt>
            <dd className="mt-0.5">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-6">
        <div>
          <h4 className="text-sm text-slate-500">
            {labels.results}, {details.resultsLabel}
          </h4>
          <ul className="mt-2 border-t border-line">
            {details.results.map((row) => (
              <li
                key={row.label}
                className={clsx(
                  "flex items-baseline justify-between gap-4 border-b border-line py-2",
                  row.highlight && "font-semibold",
                )}
              >
                <span>{row.label}</span>
                <span className="shrink-0 text-right tabular-nums">{row.value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm text-slate-500">{labels.notes}</h4>
          <ul className="mt-1.5 flex flex-col gap-1.5">
            {details.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="md:col-span-2 md:grid md:grid-cols-2 md:gap-x-12">
        <div>
          <h4 className="text-sm text-slate-500">{labels.rating}</h4>
          <p className="mt-1.5">
            <span className="font-semibold">{studiesIntro.evidenceLevels[study.evidence].label}.</span>{" "}
            {details.rating}
          </p>
        </div>
        <div className="mt-6 md:mt-0">
          <h4 className="text-sm text-slate-500">{labels.scale}</h4>
          <ul className="mt-1.5 flex flex-col gap-1 text-sm leading-snug">
            {levels.map((level) => (
              <li key={level}>
                <span className="font-medium">{studiesIntro.evidenceLevels[level].label}</span>{" "}
                <span className="text-slate-500">{studiesIntro.evidenceLevels[level].meaning}</span>
              </li>
            ))}
            <li className="text-slate-500">{studiesIntro.evidenceNote}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line pt-5 md:col-span-2">
        <h4 className="text-sm text-slate-500">{labels.source}</h4>
        <p className="source-line mt-1.5 text-[0.8125rem]">
          {details.citation}{" "}
          <span className="whitespace-nowrap">
            {studiesIntro.doiLabel}{" "}
            <TextLink href={study.doi} external className="touch-target text-ink">
              {study.doi.replace("https://doi.org/", "")}
              <Icon name="arrow-up-right" size={12} strokeWidth={1.6} className="ml-0.5 inline-block align-[-1px]" />
              <span className="sr-only"> ({ui.externalHint})</span>
            </TextLink>
          </span>
        </p>
      </div>
    </div>
  );
}
