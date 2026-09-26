import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SpecList } from "@/components/ui/SpecList";
import { vouchers } from "@/config/vouchers";
import { included } from "@/content/vouchers";
import { formatNumber } from "@/lib/format";

/** What a voucher includes: spec list with line icons left, the navy price card right. */
export function Included() {
  const lowest = Math.min(...vouchers.tiers.map((tier) => tier.pricePerVoucher));

  return (
    <Section labelledBy="included-heading">
      <Container className="grid items-start gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] xl:gap-x-24">
        <div>
          <SplitHeading id="included-heading" lines={[included.heading]} className="h2-std max-w-[720px]" />
          <Reveal className="mt-8 lg:mt-10">
            <SpecList
              stack
              rows={included.rows.map((row) => ({
                id: row.id,
                label: (
                  <span className="flex items-center gap-3.5 font-medium whitespace-nowrap">
                    <Icon name={row.icon} size={20} strokeWidth={1.4} className="shrink-0" />
                    {row.label}
                  </span>
                ),
                value: <span className="text-[0.9375rem] leading-snug text-slate-500">{row.value}</span>,
              }))}
            />
          </Reveal>
        </div>

        <Reveal delay={0.1} className="lg:sticky lg:top-[105px]">
          <div className="rounded-stat bg-navy-900 p-8 text-white md:p-10">
            <p className="flex items-baseline gap-3">
              <span className="text-lg leading-none text-steel-200">{included.price.prefix}</span>
              <span className="display-stat">{formatNumber(lowest)}&nbsp;€</span>
            </p>
            <p className="mt-4 text-[1.0625rem] leading-normal text-white/85">{included.price.unit}</p>
            <p className="mt-8 border-t border-line-dark pt-5 text-xs leading-normal text-steel-200">
              {included.price.note}
              {vouchers.pricesArePlaceholders ? <span className="mt-1.5 block">{vouchers.placeholderNote}</span> : null}
            </p>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
