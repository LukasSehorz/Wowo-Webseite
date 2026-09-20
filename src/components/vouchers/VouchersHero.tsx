import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { TiltCard } from "@/components/motion/TiltCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { TextLink } from "@/components/ui/TextLink";
import { vouchersHero } from "@/content/vouchers";
import { VoucherCard } from "./VoucherCard";

/** Two columns: eyebrow, display H1, lead and two calls to action left, the tilting voucher on the brand gradient right. */
export function VouchersHero() {
  return (
    <Section padded={false} className="pt-11 pb-section md:pt-16" labelledBy="vouchers-heading">
      <Container className="grid items-center gap-x-12 gap-y-10 lg:grid-cols-2 xl:gap-x-16">
        <div>
          <Eyebrow>{vouchersHero.eyebrow}</Eyebrow>
          <SplitHeading
            as="h1"
            id="vouchers-heading"
            lines={vouchersHero.headline}
            className="display display-hero display-umlaut mt-4 md:mt-5"
          />
          <Reveal delay={0.15}>
            <p className="lead mt-6 max-w-[600px] md:mt-8">{vouchersHero.text}</p>
          </Reveal>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 md:mt-9">
            <Button href={vouchersHero.button.href} icon="arrow-right">
              {vouchersHero.button.label}
            </Button>
            <TextLink href={vouchersHero.link.href} variant="cta" className="touch-target">
              {vouchersHero.link.label}
            </TextLink>
          </div>
        </div>

        <div
          className="flex aspect-4/3 items-center justify-center rounded-card px-7 md:px-14"
          style={{ background: "var(--brand-gradient)" }}
        >
          <TiltCard className="w-[min(88%,540px)]" surfaceClassName="rounded-card">
            <VoucherCard />
          </TiltCard>
        </div>
      </Container>
    </Section>
  );
}
