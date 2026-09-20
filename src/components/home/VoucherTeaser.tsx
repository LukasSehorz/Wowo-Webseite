import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { TiltCard } from "@/components/motion/TiltCard";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { Section } from "@/components/ui/Section";
import { VoucherCard } from "@/components/vouchers/VoucherCard";
import { voucherTeaser } from "@/content/home";

/** One large rounded mist panel, 50/50: text left, the tilting voucher on the brand gradient right. */
export function VoucherTeaser() {
  return (
    <Section labelledBy="voucher-heading">
      <Container>
        <div className="grid overflow-hidden rounded-card bg-mist lg:grid-cols-2">
          <div className="px-6 py-10 md:p-[60px]">
            <Eyebrow>{voucherTeaser.eyebrow}</Eyebrow>
            <SplitHeading id="voucher-heading" lines={[voucherTeaser.heading]} className="h2-std mt-4 lg:mt-5" />
            <Reveal>
              <p className="mt-4 max-w-[560px] text-base leading-[1.6] lg:mt-8">{voucherTeaser.text}</p>
              <p className="caption mt-4 max-w-[560px]">{voucherTeaser.addition}</p>
            </Reveal>

            <ol className="mt-9 grid max-w-[560px] grid-cols-3 gap-4 md:gap-6">
              {voucherTeaser.steps.map((step, index) => (
                <li key={step} className="border-t border-ink/20 pt-3 text-sm leading-snug font-medium">
                  <span aria-hidden="true" className="display-small mb-1.5 block text-[1.0625rem] text-olive-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {step}
                </li>
              ))}
            </ol>

            <Button href={voucherTeaser.button.href} icon="arrow-right" className="mt-9">
              {voucherTeaser.button.label}
            </Button>
          </div>

          <div
            className="flex min-h-[320px] items-center justify-center px-7 py-12 md:px-16 lg:py-16"
            style={{ background: "var(--brand-gradient)" }}
          >
            <TiltCard className="w-[min(88%,540px)]" surfaceClassName="rounded-card">
              <VoucherCard />
            </TiltCard>
          </div>
        </div>
      </Container>
    </Section>
  );
}
