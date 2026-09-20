"use client";

import clsx from "clsx";
import { createPortal } from "react-dom";
import { RollingNumber } from "@/components/motion/RollingNumber";
import { Button } from "@/components/ui/Button";
import { vouchers } from "@/config/vouchers";
import { configurator } from "@/content/vouchers";
import { formatNumber } from "@/lib/format";
import { formatEuro, formatLabel, vatPercent, type FormatId, type Quote } from "@/lib/order";
import { useIsClient } from "@/lib/use-is-client";

type SummaryProps = {
  formId: string;
  price: Quote;
  format: FormatId;
  pending: boolean;
};

const { summary } = configurator;

/**
 * Sticky summary on mist: choice, price lines, gross total in the display voice with rolling
 * numbers, and the one olive button of the site. Below 1024 px the button moves into OrderBar.
 */
export function OrderSummary({ formId, price, format, pending }: SummaryProps) {
  const lines = [
    { label: summary.pricePerVoucher, value: price.pricePerVoucher },
    { label: summary.subtotal, value: price.subtotal },
    { label: `${summary.vat} ${vatPercent}`, value: price.vat },
  ];

  return (
    <aside aria-labelledby="summary-heading" className="rounded-card bg-mist p-6 lg:sticky lg:top-[105px] xl:p-8">
      <h3 id="summary-heading" className="title-sm">
        {summary.title}
      </h3>

      <dl className="mt-5 text-[0.9375rem] leading-snug">
        <div className="flex justify-between gap-6 border-t border-line py-3">
          <dt className="text-slate-500">{summary.quantity}</dt>
          <dd className="font-medium tabular-nums">
            <RollingNumber value={price.quantity} format={(value) => formatNumber(Math.round(value))} />
          </dd>
        </div>
        <div className="flex justify-between gap-6 border-t border-line py-3">
          <dt className="text-slate-500">{summary.format}</dt>
          <dd className="text-right font-medium">{formatLabel(format)}</dd>
        </div>
        {lines.map((line) => (
          <div key={line.label} className="flex justify-between gap-6 border-t border-line py-3">
            <dt className="text-slate-500">{line.label}</dt>
            <dd className="font-medium whitespace-nowrap tabular-nums">
              <RollingNumber value={line.value} format={formatEuro} />
            </dd>
          </div>
        ))}
        <div className="border-t border-ink/25 pt-5">
          <dt className="eyebrow text-slate-500">{summary.total}</dt>
          <dd className="display-figure mt-2 whitespace-nowrap" data-total="">
            <RollingNumber value={price.total} format={formatEuro} announce />
          </dd>
        </div>
      </dl>

      <p className="source-line mt-5">{summary.note}</p>
      {vouchers.pricesArePlaceholders ? <p className="source-line mt-1.5">{vouchers.placeholderNote}</p> : null}

      <Button
        type="submit"
        form={formId}
        variant="olive"
        fullWidth
        disabled={pending}
        // below lg the fixed bar carries the button, but only once JavaScript runs (html[data-js])
        className="mt-6 min-h-[60px] [html[data-js]_&]:max-lg:hidden"
      >
        {pending ? configurator.pending : configurator.submit}
      </Button>
    </aside>
  );
}

type BarProps = SummaryProps & { visible: boolean };

/**
 * Fixed action bar for small screens: total and submit button, shown while the configurator is
 * in view. It is rendered into <body>: inside the configurator's section, whose sheet creates a
 * stacking context, the following FAQ sheet would paint over the bar (R3-01).
 */
export function OrderBar({ formId, price, pending, visible }: BarProps) {
  const isClient = useIsClient();
  if (!isClient) return null;

  return createPortal(
    <div
      inert={!visible}
      className={clsx(
        "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/97 backdrop-blur-[6px] transition-transform duration-500 ease-ui lg:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="shell flex items-center justify-between gap-3 pt-3 pb-[calc(0.85rem+env(safe-area-inset-bottom))]">
        <p className="min-w-0">
          <span className="block text-[0.6875rem] leading-tight tracking-[0.04em] text-slate-500 uppercase">
            {summary.total}
          </span>
          <span className="numeral-spacing mt-0.5 block text-[1.25rem] leading-none font-extrabold whitespace-nowrap">
            <RollingNumber value={price.total} format={formatEuro} />
          </span>
        </p>
        <Button
          type="submit"
          form={formId}
          variant="olive"
          size="sm"
          disabled={pending}
          className="min-h-12 shrink-0 px-5"
        >
          {pending ? configurator.pending : configurator.submit}
        </Button>
      </div>
    </div>,
    document.body,
  );
}
