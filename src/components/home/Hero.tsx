import { SplitHeading } from "@/components/motion/SplitHeading";
import { VideoLoop } from "@/components/motion/VideoLoop";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { hero } from "@/content/home";

/**
 * Full-bleed footage over the whole first screen: nothing of the next section shows above
 * the fold, on phones and tablets included. `100svh` uses the small viewport height, so the
 * hero does not jump when a mobile browser bar collapses; `100dvh` in the @supports block
 * lets it follow the bar on browsers that handle that well. The media runs on underneath the
 * rounded first sheet by the sheet radius (spec 8.11).
 */
export function Hero() {
  return (
    <section className="hero-screen relative isolate text-white">
      <div className="shell pointer-events-none relative z-10 flex h-full flex-col items-center justify-center pt-header pb-[calc(var(--radius-sheet)+24px)] text-center *:pointer-events-auto">
        <SplitHeading as="h1" lines={hero.headline} onMedia className="display display-hero max-w-[900px]" />
        <p className="hero-sub mt-5 max-w-[640px] md:mt-6">{hero.subline}</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-4 md:mt-8">
          <Button href={hero.cta.href} variant="glass" className="min-w-[192px]">
            {hero.cta.label}
          </Button>
          <TextLink href={hero.link.href} variant="cta" className="hero-sub touch-target leading-tight md:text-base">
            {hero.link.label}
          </TextLink>
        </div>
      </div>

      {/* After the copy in the DOM, so the pause chip follows the calls to action in the tab order. */}
      <VideoLoop
        base={hero.video.base}
        portraitBase={hero.video.portraitBase}
        eager
        objectPosition={hero.video.position}
        labels={{ pause: hero.video.pauseLabel, play: hero.video.playLabel }}
        className="absolute inset-x-0 top-0 h-[calc(100%+var(--radius-sheet))]"
        chipClassName="right-5 bottom-[calc(var(--radius-sheet)+20px)]"
        overlay={
          <>
            <div className="absolute inset-0 bg-navy-900/15" />
            <div className="absolute inset-x-0 top-0 h-40 bg-linear-to-b from-navy-900/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-[62%] bg-linear-to-t from-navy-900/58 via-navy-900/22 to-transparent" />
          </>
        }
      />
    </section>
  );
}
