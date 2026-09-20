import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { founders } from "@/content/founders";
import { FounderProfile } from "./FounderProfile";

/** The two founder profiles as alternating rows. */
export function Profiles() {
  return (
    <Section>
      <Container className="space-y-20 lg:space-y-32">
        {founders.map((founder, index) => (
          <FounderProfile key={founder.id} founder={founder} reversed={index % 2 === 1} />
        ))}
      </Container>
    </Section>
  );
}
