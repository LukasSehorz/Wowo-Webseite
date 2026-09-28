import clsx from "clsx";
import { CompareBars } from "@/components/charts/CompareBars";
import { PeopleGrid } from "@/components/charts/PeopleGrid";
import { toneText } from "@/components/charts/tones";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { SourceLine } from "@/components/ui/SourceLine";
import { studiesIntro, type Study, type Tone } from "@/content/studies";

type StudyPanelProps = {
  study: Study;
  side: 0 | 1;
  onSide: (side: 0 | 1) => void;
};

/**
 * One study on the stage, four things visible: the answer across the full width, the two-state
 * graphic with its switch, the limit together with the evidence level, and the source line at
 * the foot. From 768 px graphic and limit sit side by side; below they stack in reading order.
 */
export function StudyPanel({ study, side, onSide }: StudyPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <h3 data-study-q="" className="sr-only">
        {study.question}
      </h3>
      <p className="title-answer max-w-[21em] hyphens-auto">{study.answer}</p>

      <div className="mt-6 grid gap-y-6 md:mt-8 md:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] md:gap-x-8 md:pb-8 xl:gap-x-12">
        <StudyGraphic study={study} side={side} onSide={onSide} />

        <div className="flex flex-col gap-5 md:border-l md:border-ink/10 md:pl-8 xl:pl-10">
          <p className="max-w-[560px] text-base leading-[1.55]">{study.caveat}</p>
          <EvidenceMeter level={study.evidence} />
        </div>
      </div>

      <SourceLine className="mt-6 border-t border-ink/10 pt-4 md:mt-auto md:pt-5">{study.source}</SourceLine>
    </div>
  );
}

function StudyGraphic({ study, side, onSide }: StudyPanelProps) {
  const { visual } = study;
  const readoutTone = (index: 0 | 1): Tone => {
    if (visual.type === "people") return visual.tones[index];
    return visual.rows.length === 1 ? visual.rows[0].tones[index] : "neutral";
  };

  return (
    <figure className="flex flex-col">
      <div data-study-switch="">
        <SegmentedControl
          name={`study-${study.id}`}
          legend={studiesIntro.switchLabel}
          options={study.states}
          value={side}
          onChange={onSide}
          className="w-full max-w-[420px]"
        />
      </div>

      <div role="img" aria-label={study.figureLabel} className="mt-5 flex flex-col gap-4 md:mt-6">
        <div className="grid">
          {study.readouts.map((readout, index) => (
            <p
              key={index}
              className={clsx(
                "col-start-1 row-start-1 flex min-h-12 flex-wrap content-end items-baseline gap-x-3 gap-y-1 transition-[opacity,translate] duration-500 ease-ui md:min-h-14",
                index === side ? "opacity-100" : "translate-y-1 opacity-0",
              )}
            >
              {readout.figure && (
                <span className={clsx("display-figure whitespace-nowrap", toneText[readoutTone(index as 0 | 1)])}>
                  {readout.figure}
                </span>
              )}
              <span className={clsx("leading-snug", readout.figure ? "text-[0.9375rem]" : "title-sm")}>
                {readout.text}
              </span>
            </p>
          ))}
        </div>

        {visual.type === "people" ? (
          <PeopleGrid total={visual.total} counts={visual.counts} tones={visual.tones} side={side} />
        ) : (
          <CompareBars max={visual.max} reference={visual.reference} rows={visual.rows} side={side} />
        )}
      </div>

      <figcaption className="caption mt-3">{study.caption}</figcaption>
    </figure>
  );
}

function EvidenceMeter({ level }: { level: Study["evidence"] }) {
  const { label } = studiesIntro.evidenceLevels[level];
  return (
    <div className="text-sm leading-tight">
      <p className="text-slate-500">{studiesIntro.evidenceLabel}</p>
      <p className="mt-2 flex items-center gap-3">
        <span aria-hidden="true" className="flex gap-1">
          {[1, 2, 3].map((step) => (
            <span key={step} className={clsx("h-1.5 w-6 rounded-full", step <= level ? "bg-ink" : "bg-ink/15")} />
          ))}
        </span>
        <span className="font-medium">
          {label}
          <span className="sr-only">, {studiesIntro.evidenceOf.replace("{level}", String(level))}</span>
        </span>
      </p>
    </div>
  );
}
