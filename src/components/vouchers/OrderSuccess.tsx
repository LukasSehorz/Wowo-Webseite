"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { vouchers } from "@/config/vouchers";
import { configurator } from "@/content/vouchers";
import { formatNumber } from "@/lib/format";
import { formatEuro, formatLabel, vatPercent, type OrderRequest } from "@/lib/order";

type OrderSuccessProps = { request: OrderRequest };

const { success, summary, fields } = configurator;

/** Replaces the form after a successful request: confirmation plus a copy of everything that was sent. */
export function OrderSuccess({ request }: OrderSuccessProps) {
  const heading = useRef<HTMLHeadingElement>(null);
  const { quote: price } = request;

  // The form is gone: move focus to the confirmation so keyboard and screen-reader users land on it.
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: "center", behavior: "auto" });
  }, []);

  const rows = [
    { label: fields.company, value: request.company },
    { label: fields.contact, value: request.contact },
    { label: fields.email, value: request.email },
    { label: fields.phone, value: request.phone },
    { label: summary.quantity, value: formatNumber(price.quantity) },
    { label: summary.format, value: formatLabel(request.format) },
    { label: summary.pricePerVoucher, value: formatEuro(price.pricePerVoucher) },
    { label: summary.subtotal, value: formatEuro(price.subtotal) },
    { label: `${summary.vat} ${vatPercent}`, value: formatEuro(price.vat) },
    { label: summary.total, value: formatEuro(price.total) },
    { label: fields.message, value: request.message },
  ].filter((row) => row.value);

  return (
    <div className="rounded-panel border border-line p-5 md:p-12">
      <span className="flex size-16 items-center justify-center rounded-full bg-mist text-olive-600">
        <Icon name="check" size={28} strokeWidth={1.6} />
      </span>
      <h3 ref={heading} tabIndex={-1} className="h3-std mt-6 outline-none">
        {success.heading}
      </h3>
      <p className="mt-4 max-w-[640px] text-base leading-[1.6]">
        {success.text.replace("{responseTime}", vouchers.responseTime)}
      </p>

      <dl className="mt-9 grid gap-x-12 border-t border-line md:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between gap-6 border-b border-line py-3.5 text-[0.9375rem]">
            <dt className="shrink-0 text-slate-500">{row.label.replace(" (optional)", "")}</dt>
            <dd className="text-right font-medium break-words whitespace-pre-line tabular-nums">{row.value}</dd>
          </div>
        ))}
      </dl>
      {vouchers.pricesArePlaceholders ? <p className="source-line mt-4">{vouchers.placeholderNote}</p> : null}
    </div>
  );
}
