import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { StatNumber } from "@/components/ui/StatNumber";
import { StatRow } from "@/components/ui/StatRow";
import { homeFacts, homeFactsBridge } from "@/content/facts";
import { factsLabel } from "@/content/home";

/** Three statistics with their sources, then the bridging paragraph that hands over to the pressure map. */
export function Facts() {
  return (
    <Section label={factsLabel}>
      <Container>
        <StatRow
          items={homeFacts.map((fact) => ({
            id: fact.id,
            icon: fact.icon,
            figure: <StatNumber value={fact.value} decimals={fact.decimals} suffix={fact.suffix} />,
            label: fact.label,
            source: fact.source,
          }))}
        />
        <Reveal>
          <p className="lead-center mx-auto mt-12 max-w-[760px] text-center md:mt-16">{homeFactsBridge}</p>
        </Reveal>
      </Container>
    </Section>
  );
}
