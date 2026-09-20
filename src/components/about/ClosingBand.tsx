import { SplitHeading } from "@/components/motion/SplitHeading";
import { VideoLoop } from "@/components/motion/VideoLoop";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { closing } from "@/content/about";

/**
 * The one dark band of the page (home #6 of the reference): full-bleed footage with rounded
 * top corners, display line, text and glass pill bottom left. The footage runs on underneath
 * the following sheet by the sheet radius.
 */
export function ClosingBand() {
  return (
    <section aria-labelledby="closing-heading" className="relative isolate h-[488px] text-white md:h-[638px]">
      <Container className="relative z-10 flex h-full flex-col items-start justify-end pb-[clamp(40px,3.37vw,64px)]">
        <SplitHeading
          id="closing-heading"
          lines={closing.headline}
          onMedia
          className="display display-h2 display-umlaut max-w-[760px]"
        />
        <p className="mt-5 max-w-[520px] text-base leading-[1.6] md:mt-6">{closing.text}</p>
        <Button href={closing.button.href} variant="glass" icon="arrow-right" className="mt-7 md:mt-8">
          {closing.button.label}
        </Button>
      </Container>

      {/* After the copy in the DOM, so the pause chip follows the call to action in the tab order. */}
      <VideoLoop
        base={closing.video.base}
        posterSizes="(max-width: 767px) 230vw, 100vw"
        objectPosition={closing.video.position}
        labels={{ pause: closing.video.pauseLabel, play: closing.video.playLabel }}
        className="absolute inset-x-0 top-0 h-[calc(100%+var(--radius-sheet))] rounded-t-sheet"
        chipClassName="right-5 bottom-[calc(var(--radius-sheet)+20px)]"
        overlay={
          <>
            {/* the same grade as the fitting stage: multiply, then two light gradients for the copy */}
            <div className="absolute inset-0 bg-[#8FA5B7] mix-blend-multiply" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgb(15_32_52/0.62)_0%,rgb(15_32_52/0.3)_34%,rgb(15_32_52/0)_60%)]" />
            <div className="absolute inset-x-0 bottom-0 h-[45%] bg-[linear-gradient(0deg,rgb(15_32_52/0.45),rgb(15_32_52/0))]" />
          </>
        }
      />
    </section>
  );
}
