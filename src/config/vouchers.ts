// Voucher pricing. All amounts are final prices in euro per voucher. The client is a small
// business under § 19 UStG and shows no VAT, so there is no VAT rate and no net/gross split.
// TODO(client): confirm prices and tiers. While `pricesArePlaceholders` is true
// the site shows the note „Preise in Abstimmung“ next to every price.

export type VolumeTier = {
  id: string;
  label: string;
  min: number;
  max: number | null;
  pricePerVoucher: number;
};

export const vouchers = {
  pricesArePlaceholders: true,
  placeholderNote: "Preise in Abstimmung",
  quantity: { min: 1, max: 500, default: 25, quickPicks: [10, 25, 50, 100] },
  tiers: [
    { id: "t1", label: "1 bis 9", min: 1, max: 9, pricePerVoucher: 149 },
    { id: "t2", label: "10 bis 24", min: 10, max: 24, pricePerVoucher: 139 },
    { id: "t3", label: "25 bis 49", min: 25, max: 49, pricePerVoucher: 129 },
    { id: "t4", label: "ab 50", min: 50, max: null, pricePerVoucher: 119 },
  ] satisfies VolumeTier[],
  // TODO(client): confirm the response time promised after an order request (copy deck 3.6)
  responseTime: "zwei Werktagen",
  // Face of the voucher card (copy deck 1.9)
  card: {
    title: "Gutschein",
    scope: "Untersuchung, Einlagen, Anpassung",
    codeLabel: "Code",
    code: "BR-2026-0001",
    issuer: "Brandlmaier & Rauscher Einlagen",
  },
} as const;

export function tierForQuantity(quantity: number): VolumeTier {
  const match = vouchers.tiers.find((tier) => quantity >= tier.min && (tier.max === null || quantity <= tier.max));
  return match ?? vouchers.tiers[0];
}
