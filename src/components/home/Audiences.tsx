import { existsSync } from "node:fs";
import path from "node:path";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { SourceLine } from "@/components/ui/SourceLine";
import { ui } from "@/content/global";
import { audiences } from "@/content/home";
import { AudienceTile } from "./AudienceTile";

const fileExists = (publicPath: string) => existsSync(path.join(process.cwd(), "public", publicPath));

/** Four 4:5 cards in a row, a scroll-snap row with a peek below 1024 px (home #4 of the reference). */
export function Audiences() {
  return (
    <Section labelledBy="audiences-heading">
      <Container>
        <div className="flex flex-col gap-4 lg:gap-8">
          <SplitHeading id="audiences-heading" lines={[audiences.heading]} className="h2-std" />
          <Reveal>
            <p className="max-w-[896px] text-base leading-[1.6]">{audiences.text}</p>
          </Reveal>
        </div>

        <ul className="snap-row mt-8 lg:mx-0 lg:mt-9 lg:grid lg:grid-cols-4 lg:gap-(--card-gap) lg:overflow-visible lg:px-0">
          {audiences.items.map((item) => (
            <li key={item.id}>
              <AudienceTile
                item={item}
                hasImage={fileExists(item.image)}
                sizes="(min-width: 1024px) 25vw, (min-width: 480px) 340px, 74vw"
              />
            </li>
          ))}
        </ul>

        <SourceLine label={ui.sources} className="mt-5">
          {audiences.source}
        </SourceLine>
      </Container>
    </Section>
  );
}
