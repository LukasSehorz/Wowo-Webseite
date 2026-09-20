"use client";

import clsx from "clsx";
import { useInView } from "motion/react";
import { useActionState, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { submitOrder } from "@/app/gutscheine/actions";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { vouchers } from "@/config/vouchers";
import { configurator } from "@/content/vouchers";
import { formatNumber } from "@/lib/format";
import { clampQuantity, quote, type FormatId, type OrderState } from "@/lib/order";
import { ConfigGroup } from "./ConfigGroup";
import { OrderForm } from "./OrderForm";
import { OrderSuccess } from "./OrderSuccess";
import { OrderBar, OrderSummary } from "./OrderSummary";

const IDLE: OrderState = { status: "idle", attempt: 0 };
const { min, max, quickPicks } = vouchers.quantity;
const labels = configurator.quantity;

/**
 * Configurator and order request. One quantity drives stepper, direct input, slider, quick
 * picks, the active price tier and the summary. The form posts to a server action that
 * validates again and recalculates the price; its answer selects errors or the success view.
 */
export function Configurator() {
  const formId = useId();
  const section = useRef<HTMLElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(submitOrder, IDLE);
  const [quantity, setQuantity] = useState<number>(vouchers.quantity.default);
  // text of the direct input while it is being edited; `null` shows the quantity
  const [draft, setDraft] = useState<string | null>(null);
  const [format, setFormat] = useState<FormatId>(vouchers.deliveryFormats[0].id);
  // the mobile action bar shows from the moment the configurator enters until it has left the
  // viewport, so the summary card never sits on screen without a submit button (R3-01)
  const inView = useInView(section, { margin: "-25% 0px 0px 0px" });

  const price = quote(quantity);
  const done = state.status === "success";
  // React resets a form after its action. Controlled radios then fall back to the `checked` they were
  // mounted with, so both radio groups are re-created per attempt and always mount with the current choice.
  const attempt = state.status === "success" ? 0 : state.attempt;

  // After a rejected submit the first problem receives focus (and scrolls into view).
  useEffect(() => {
    if (state.status === "invalid") form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
    if (state.status === "failed") form.current?.querySelector<HTMLElement>("[data-form-error]")?.focus();
  }, [state]);

  const change = (next: number) => {
    setDraft(null);
    setQuantity(clampQuantity(next));
  };

  const onDraft = (text: string) => {
    const digits = text.replace(/\D/g, "").slice(0, 3);
    setDraft(digits);
    if (digits) setQuantity(clampQuantity(Number(digits)));
  };

  const onInputKey = (event: KeyboardEvent<HTMLInputElement>) => {
    // Enter confirms the typed number. Without this it would submit the whole request.
    if (event.key === "Enter") {
      event.preventDefault();
      setDraft(null);
      return;
    }
    const step = { ArrowUp: 1, ArrowDown: -1 }[event.key];
    if (!step) return;
    event.preventDefault();
    change(quantity + step);
  };

  const selectTier = (tierMin: number, tierMax: number | null) => {
    if (quantity < tierMin || (tierMax !== null && quantity > tierMax)) change(tierMin);
  };

  return (
    <Section ref={section} id={configurator.id} labelledBy="configurator-heading">
      <Container>
        <SplitHeading id="configurator-heading" lines={[configurator.heading]} className="h2-std" />

        {done ? (
          <div className="mt-8 lg:mt-9">
            <OrderSuccess request={state.request} />
          </div>
        ) : (
          <div className="mt-8 grid items-start gap-x-8 gap-y-6 lg:mt-9 lg:grid-cols-[minmax(0,1fr)_340px] xl:grid-cols-[minmax(0,1fr)_440px] xl:gap-x-12">
            <form
              ref={form}
              id={formId}
              action={formAction}
              noValidate
              className="relative rounded-panel border border-line p-5 md:p-12"
            >
              <ConfigGroup index={1} title={configurator.groups.quantity}>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                  <div className="inline-flex h-[58px] items-center rounded-full border border-ink/30">
                    <button
                      type="button"
                      aria-label={labels.decrease}
                      disabled={quantity <= min}
                      onClick={() => change(quantity - 1)}
                      className="flex size-[56px] items-center justify-center rounded-full transition-colors duration-500 ease-ui hover:bg-mist disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <Icon name="minus" size={18} strokeWidth={1.6} />
                    </button>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      data-anchor-focus=""
                      aria-labelledby="config-group-1"
                      value={draft ?? String(quantity)}
                      onChange={(event) => onDraft(event.currentTarget.value)}
                      onBlur={() => setDraft(null)}
                      onKeyDown={onInputKey}
                      className="h-10 w-16 rounded-input bg-transparent text-center text-lg font-medium tabular-nums"
                    />
                    <button
                      type="button"
                      aria-label={labels.increase}
                      disabled={quantity >= max}
                      onClick={() => change(quantity + 1)}
                      className="flex size-[56px] items-center justify-center rounded-full transition-colors duration-500 ease-ui hover:bg-mist disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                      <Icon name="plus" size={18} strokeWidth={1.6} />
                    </button>
                  </div>

                  <div role="group" aria-label={labels.quickPicksLabel} className="flex flex-wrap gap-2">
                    {quickPicks.map((pick) => (
                      <button
                        key={pick}
                        type="button"
                        aria-pressed={quantity === pick}
                        onClick={() => change(pick)}
                        className={clsx(
                          "h-11 min-w-14 rounded-full border px-4 text-sm font-medium tabular-nums transition-colors duration-500 ease-ui",
                          quantity === pick
                            ? "border-ink bg-ink text-white"
                            : "border-ink/30 hover:border-ink hover:bg-mist",
                        )}
                      >
                        {pick}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  {/* the slider carries the quantity of the request, so it is submitted even without JavaScript */}
                  <input
                    type="range"
                    name="quantity"
                    min={min}
                    max={max}
                    step={1}
                    value={quantity}
                    aria-label={labels.sliderLabel}
                    onChange={(event) => change(Number(event.currentTarget.value))}
                    className="range range-light w-full"
                    style={{ "--range-fill": `${((quantity - min) / (max - min)) * 100}%` } as CSSProperties}
                  />
                  <div aria-hidden="true" className="source-line flex justify-between tabular-nums">
                    <span>{min}</span>
                    <span>{max}</span>
                  </div>
                </div>
              </ConfigGroup>

              <ConfigGroup
                index={2}
                title={configurator.groups.tiers}
                role="radiogroup"
                note={vouchers.pricesArePlaceholders ? vouchers.placeholderNote : undefined}
              >
                <div key={attempt} className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                  {vouchers.tiers.map((tier) => (
                    <label key={tier.id} className="option flex-col px-4 py-4 md:px-5">
                      <input
                        type="radio"
                        name="tier"
                        value={tier.id}
                        checked={price.tierId === tier.id}
                        onChange={() => selectTier(tier.min, tier.max)}
                        className="sr-only"
                      />
                      <span className="text-sm leading-tight text-slate-500">{tier.label}</span>
                      <span className="mt-2 text-[1.375rem] leading-none font-semibold tracking-[-0.025em] whitespace-nowrap tabular-nums">
                        {formatNumber(tier.pricePerVoucher)}&nbsp;€
                      </span>
                      <span className="source-line mt-1.5">{configurator.perVoucher}</span>
                    </label>
                  ))}
                </div>
              </ConfigGroup>

              <ConfigGroup index={3} title={configurator.groups.format} role="radiogroup">
                {/* one column again while the form column is narrow beside the summary (1024 to 1279 px) */}
                <div key={attempt} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                  {vouchers.deliveryFormats.map((item) => (
                    <label key={item.id} className="option items-center gap-3.5 px-5 py-[18px]">
                      <input
                        type="radio"
                        name="format"
                        value={item.id}
                        checked={format === item.id}
                        onChange={() => setFormat(item.id)}
                        className="peer sr-only"
                      />
                      <span
                        aria-hidden="true"
                        className="flex size-[18px] shrink-0 items-center justify-center rounded-full border border-ink/40 transition-colors duration-150 peer-checked:border-olive-600 peer-checked:[&>span]:scale-100"
                      >
                        <span className="size-2.5 scale-0 rounded-full bg-olive-600 transition-transform duration-150" />
                      </span>
                      <span className="text-base leading-tight font-medium">{item.label}</span>
                    </label>
                  ))}
                </div>
              </ConfigGroup>

              <OrderForm state={state} />
            </form>

            <OrderSummary formId={formId} price={price} format={format} pending={pending} />
          </div>
        )}
      </Container>

      {done ? null : <OrderBar formId={formId} price={price} format={format} pending={pending} visible={inView} />}
    </Section>
  );
}
