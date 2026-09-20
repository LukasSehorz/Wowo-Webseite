"use server";

import { site } from "@/config/site";
import {
  LIMITS,
  formatEuro,
  formatLabel,
  isFormatId,
  quote,
  validateOrder,
  vatPercent,
  type OrderRequest,
  type OrderState,
  type OrderValues,
} from "@/lib/order";

const multiline = (data: FormData, name: string, limit: number) =>
  String(data.get(name) ?? "")
    .trim()
    .slice(0, limit);

// single-line fields never contain line breaks or tabs, whatever a crafted request sends
const text = (data: FormData, name: string, limit: number) => multiline(data, name, limit).replace(/\s+/g, " ");

/**
 * Order request of the voucher configurator. Every value is re-validated here and the price is
 * recalculated from the configuration, nothing the browser calculated is trusted.
 */
export async function submitOrder(previous: OrderState, data: FormData): Promise<OrderState> {
  const attempt = previous.status === "success" ? 1 : previous.attempt + 1;
  const values: OrderValues = {
    company: text(data, "company", LIMITS.text),
    contact: text(data, "contact", LIMITS.text),
    email: text(data, "email", LIMITS.text),
    phone: text(data, "phone", LIMITS.text),
    message: multiline(data, "message", LIMITS.message),
    consent: data.get("consent") === "on",
  };

  const errors = validateOrder(values);
  if (Object.keys(errors).length > 0) return { status: "invalid", attempt, errors, values };

  const quantity = Number(data.get("quantity"));
  const format = data.get("format");
  if (!Number.isInteger(quantity) || quote(quantity).quantity !== quantity || !isFormatId(format)) {
    return { status: "failed", attempt, values };
  }

  const request: OrderRequest = { ...values, format, quote: quote(quantity) };

  // Honeypot: people never see this field. Bots get the success view, nothing is delivered.
  if (text(data, "website", LIMITS.text)) return { status: "success", request };

  try {
    await deliver(request);
  } catch (error) {
    console.error("[Bestellanfrage] Versand fehlgeschlagen", error);
    return { status: "failed", attempt, values };
  }
  return { status: "success", request };
}

function compose(request: OrderRequest): string {
  const { quote: price } = request;
  return [
    `Unternehmen: ${request.company}`,
    `Ansprechperson: ${request.contact}`,
    `E-Mail: ${request.email}`,
    `Telefon: ${request.phone || "–"}`,
    "",
    `Anzahl der Gutscheine: ${price.quantity}`,
    `Format der Gutscheine: ${formatLabel(request.format)}`,
    `Preis je Gutschein: ${formatEuro(price.pricePerVoucher)}`,
    `Zwischensumme netto: ${formatEuro(price.subtotal)}`,
    `Umsatzsteuer ${vatPercent}: ${formatEuro(price.vat)}`,
    `Gesamt brutto: ${formatEuro(price.total)}`,
    "",
    `Nachricht: ${request.message || "–"}`,
  ].join("\n");
}

/**
 * Pluggable delivery. With RESEND_API_KEY and ORDER_TO_EMAIL the request goes out through
 * Resend's REST API (ORDER_FROM_EMAIL must be a sender verified there). Without them the
 * request is logged on the server, so the flow can be demonstrated end to end.
 */
async function deliver(request: OrderRequest): Promise<void> {
  const { RESEND_API_KEY: apiKey, ORDER_TO_EMAIL: to, ORDER_FROM_EMAIL: from } = process.env;

  if (!apiKey || !to) {
    console.info(`[Bestellanfrage] Demo-Modus, kein Versand konfiguriert\n${compose(request)}`);
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: from ?? `${site.shortName} <onboarding@resend.dev>`,
      to: [to],
      reply_to: request.email,
      subject: `Bestellanfrage: ${request.quote.quantity} Gutscheine, ${request.company}`,
      text: compose(request),
    }),
  });

  if (!response.ok) throw new Error(`Resend antwortet mit ${response.status}`);
}
