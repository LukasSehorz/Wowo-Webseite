import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { StatNumber } from "@/components/ui/StatNumber";
import { StatRow } from "@/components/ui/StatRow";
import { aboutStatsLabel } from "@/content/about";
import { aboutFacts } from "@/content/facts";

/** Four figures about the two founders, 2 × 2 on small screens. */
export function AboutStats() {
  return (
    <Section label={aboutStatsLabel} padded={false} className="pb-section">
      <Container>
        <StatRow
          columns={4}
          items={aboutFacts.map((fact) => ({
            id: fact.id,
            icon: fact.icon,
            figure: <StatNumber value={fact.value} isYear={fact.isYear} />,
            label: fact.label,
          }))}
        />
      </Container>
    </Section>
  );
}
