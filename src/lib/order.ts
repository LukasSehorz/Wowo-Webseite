// Order request: pricing and validation. Pure functions shared by the configurator (client)
// and the server action, so both always agree. All numbers come from config/vouchers.ts.

import { tierForQuantity, vouchers, type DeliveryFormat } from "@/config/vouchers";
import { formatNumber } from "@/lib/format";

export type FormatId = DeliveryFormat["id"];

export type Quote = {
  quantity: number;
  tierId: string;
  pricePerVoucher: number;
  subtotal: number;
  vat: number;
  total: number;
};

const roundCents = (value: number) => Math.round(value * 100) / 100;

export function clampQuantity(value: number): number {
  const { min, max } = vouchers.quantity;
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

/** Net price per voucher by volume tier, net subtotal, VAT and gross total. */
export function quote(quantity: number): Quote {
  const count = clampQuantity(quantity);
  const tier = tierForQuantity(count);
  const subtotal = roundCents(count * tier.pricePerVoucher);
  const vat = roundCents(subtotal * vouchers.vatRate);
  return {
    quantity: count,
    tierId: tier.id,
    pricePerVoucher: tier.pricePerVoucher,
    subtotal,
    vat,
    total: roundCents(subtotal + vat),
  };
}

export const formatEuro = (value: number) => `${formatNumber(value, 2)} €`;
export const vatPercent = `${formatNumber(vouchers.vatRate * 100)} %`;

export const isFormatId = (value: unknown): value is FormatId =>
  vouchers.deliveryFormats.some((format) => format.id === value);

export const formatLabel = (id: FormatId) => vouchers.deliveryFormats.find((format) => format.id === id)?.label ?? id;

// ---------------------------------------------------------------------------------------------

export type OrderField = "company" | "contact" | "email" | "consent";

export type OrderValues = {
  company: string;
  contact: string;
  email: string;
  phone: string;
  message: string;
  consent: boolean;
};

export type OrderRequest = OrderValues & { format: FormatId; quote: Quote };

/** `attempt` counts rejected submits. The form uses it to re-create controls that React resets after an action. */
export type OrderState =
  | { status: "idle"; attempt: 0 }
  | { status: "invalid"; attempt: number; errors: Partial<Record<OrderField, true>>; values: OrderValues }
  | { status: "failed"; attempt: number; values: OrderValues }
  | { status: "success"; request: OrderRequest };

export const LIMITS = { text: 160, message: 2000 } as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateOrder(values: OrderValues): Partial<Record<OrderField, true>> {
  const errors: Partial<Record<OrderField, true>> = {};
  if (!values.company) errors.company = true;
  if (!values.contact) errors.contact = true;
  if (!EMAIL.test(values.email)) errors.email = true;
  if (!values.consent) errors.consent = true;
  return errors;
}
