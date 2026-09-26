// Central company data. Everything the client will want to change lives here.
// Values marked TODO(client) are `null` until confirmed and render as „Angabe folgt“.

export type Pending = string | null;

export const PENDING_LABEL = "Angabe folgt";

export const site = {
  name: "Brandmaier & Rauscher GbR",
  shortName: "Brandmaier & Rauscher",
  product: "Einlagen",
  // TODO(client): final domain. Used for canonical URLs, sitemap and Open Graph.
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "de_DE",
  lockup: {
    line1: "Brandmaier & Rauscher",
    line2: "Einlagen",
  },
  founders: ["Sebastian Rauscher", "Wolfgang Brandmaier"],
  contact: {
    // TODO(client): street, postcode and city of the practice
    address: null as Pending,
    // TODO(client): phone number in international format, e.g. "+49 8638 123456"
    phone: null as Pending,
    // TODO(client): contact e-mail address
    email: null as Pending,
  },
  legal: {
    // TODO(client): VAT identification number, if there is one. Under § 19 UStG there is
    // usually none, then this line stays empty and only `smallBusinessNote` is filled in.
    vatId: null as Pending,
    // TODO(client): confirm the wording of the small business rule for the imprint, e.g.
    // „Kleinunternehmer nach § 19 UStG, es wird keine Umsatzsteuer ausgewiesen.“
    smallBusinessNote: null as Pending,
    // TODO(client): supervisory authority for the professional title
    supervisoryAuthority: null as Pending,
  },
  manufacturerUrl: "https://www.formthotics.com/de_de",
  // Therapist and retailer directory of the German distributor (ME & Friends AG). Only this
  // path works: /therapeutenverzeichnis/ answers with a 301 to the start page. The
  // manufacturer himself (formthotics.com) has no partner search for end customers.
  partnerDirectoryUrl: "https://www.funktionelle-einlagen.de/haendlerverzeichnis/",
} as const;

export type NavItem = { label: string; href: string };

export const mainNav: NavItem[] = [
  { label: "Start", href: "/" },
  { label: "Über uns", href: "/ueber-uns" },
  { label: "Gutscheine", href: "/gutscheine" },
];

export const legalNav: NavItem[] = [
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
];

export const orderHref = "/gutscheine#anfrage";

export const headerCta = { label: "Gutscheine anfragen", href: orderHref };
