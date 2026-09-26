// Order request: pricing and validation. Pure functions shared by the configurator (client)
// and the server action, so both always agree. All numbers come from config/vouchers.ts.

import { tierForQuantity, vouchers } from "@/config/vouchers";
import { formatNumber } from "@/lib/format";

export type Quote = {
  quantity: number;
  tierId: string;
  pricePerVoucher: number;
  total: number;
};

const roundCents = (value: number) => Math.round(value * 100) / 100;

export function clampQuantity(value: number): number {
  const { min, max } = vouchers.quantity;
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

/**
 * Price per voucher by volume tier and the total. These are final prices: the client is a small
 * business under § 19 UStG, so no VAT is shown and there is no net and gross split.
 */
export function quote(quantity: number): Quote {
  const count = clampQuantity(quantity);
  const tier = tierForQuantity(count);
  return {
    quantity: count,
    tierId: tier.id,
    pricePerVoucher: tier.pricePerVoucher,
    total: roundCents(count * tier.pricePerVoucher),
  };
}

export const formatEuro = (value: number) => `${formatNumber(value, 2)} €`;

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

export type OrderRequest = OrderValues & { quote: Quote };

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
