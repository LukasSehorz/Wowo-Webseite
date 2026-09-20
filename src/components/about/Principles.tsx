import { SplitHeading } from "@/components/motion/SplitHeading";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { principles } from "@/content/about";

/** Three mist cards with a display numeral in olive. */
export function Principles() {
  return (
    <Section labelledBy="principles-heading">
      <Container>
        <SplitHeading id="principles-heading" lines={[principles.heading]} className="h2-std" />
        <StaggerGroup as="ol" className="mt-8 grid gap-(--card-gap) md:grid-cols-3 lg:mt-9">
          {principles.items.map((item, index) => (
            <li key={item.title} className="rounded-stat bg-mist px-7 py-8 lg:px-8 lg:py-9">
              <span aria-hidden="true" className="display-figure block text-olive-600">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="title-sm mt-6">{item.title}</h3>
              <p className="mt-3 text-base leading-[1.6]">{item.text}</p>
            </li>
          ))}
        </StaggerGroup>
      </Container>
    </Section>
  );
}
