"use client";

import { useState } from "react";
import { Field, FieldError } from "@/components/ui/Field";
import { TextLink } from "@/components/ui/TextLink";
import { ui } from "@/content/global";
import { configurator } from "@/content/vouchers";
import { LIMITS, type OrderField, type OrderState } from "@/lib/order";
import { ConfigGroup } from "./ConfigGroup";

type OrderFormProps = { state: OrderState };

/**
 * Groups 4 and 5 of the configurator: contact details, message, consent and the honeypot.
 * Errors come from the server action. A message disappears as soon as its field is edited,
 * and the values typed so far come back as default values after a rejected submit.
 */
export function OrderForm({ state }: OrderFormProps) {
  const [edited, setEdited] = useState<{ state: OrderState; fields: OrderField[] }>({ state, fields: [] });
  const editedNow = edited.state === state ? edited.fields : [];
  const values = state.status === "invalid" || state.status === "failed" ? state.values : null;
  const { fields, errors, consent } = configurator;

  const errorFor = (field: OrderField) =>
    state.status === "invalid" && state.errors[field] && !editedNow.includes(field) ? errors[field] : undefined;
  const markEdited = (field: OrderField) => () => setEdited({ state, fields: [...editedNow, field] });

  return (
    <>
      <ConfigGroup index={4} title={configurator.groups.details}>
        {/* two columns only from 1280 px: beside the summary the form column is too narrow for two inputs */}
        <div className="grid gap-6 xl:grid-cols-2">
          <Field
            name="company"
            label={fields.company}
            required
            autoComplete="organization"
            maxLength={LIMITS.text}
            defaultValue={values?.company}
            error={errorFor("company")}
            onEdit={markEdited("company")}
          />
          <Field
            name="contact"
            label={fields.contact}
            required
            autoComplete="name"
            maxLength={LIMITS.text}
            defaultValue={values?.contact}
            error={errorFor("contact")}
            onEdit={markEdited("contact")}
          />
          <Field
            name="email"
            type="email"
            label={fields.email}
            required
            autoComplete="email"
            maxLength={LIMITS.text}
            defaultValue={values?.email}
            error={errorFor("email")}
            onEdit={markEdited("email")}
          />
          <Field
            name="phone"
            type="tel"
            label={fields.phone}
            autoComplete="tel"
            maxLength={LIMITS.text}
            defaultValue={values?.phone}
          />
        </div>
      </ConfigGroup>

      <ConfigGroup index={5} title={configurator.groups.message}>
        <Field
          name="message"
          label={fields.message}
          multiline
          maxLength={LIMITS.message}
          defaultValue={values?.message}
        />

        <div className="mt-7">
          <label className="flex cursor-pointer items-start gap-3.5 text-sm leading-[1.55]">
            <input
              type="checkbox"
              name="consent"
              required
              defaultChecked={values?.consent}
              aria-invalid={errorFor("consent") ? true : undefined}
              aria-describedby={errorFor("consent") ? "field-consent-error" : undefined}
              onChange={markEdited("consent")}
              className="checkbox mt-px"
            />
            <span>
              {consent.before}
              <TextLink href="/datenschutz" external variant="cta">
                {consent.link}
                <span className="sr-only"> ({ui.externalHint})</span>
              </TextLink>
              {consent.after}
            </span>
          </label>
          {errorFor("consent") ? (
            <FieldError id="field-consent-error" className="ml-9">
              {errors.consent}
            </FieldError>
          ) : null}
        </div>

        {/* Honeypot: off screen, out of the tab order and hidden from assistive technology. */}
        <div aria-hidden="true" className="absolute -left-[9999px] size-px overflow-hidden">
          <label>
            {configurator.honeypotLabel}
            <input type="text" name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>

        {state.status === "failed" ? (
          <p
            role="alert"
            tabIndex={-1}
            data-form-error=""
            className="mt-7 rounded-input border border-error-700/40 bg-error-100 px-5 py-4 text-sm leading-normal text-error-700"
          >
            {errors.send}
          </p>
        ) : null}
      </ConfigGroup>
    </>
  );
}
