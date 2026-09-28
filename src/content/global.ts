// Copy deck section 0: texts shared by every page.

import { typesetContent } from "@/lib/format";

export const announcements = [
  "Individuell angepasst von Physiotherapeuten",
  "Untersuchung und Anpassung in einem Termin",
  "Gutscheine für Unternehmen",
];

export const footer = typesetContent({
  cta: {
    heading: "Gutscheine für Ihr Unternehmen anfragen",
    text: "Sie nennen uns die Anzahl, wir senden Ihnen ein Angebot.",
    button: "Zur Bestellanfrage",
  },
  columns: {
    pages: "Seiten",
    legal: "Rechtliches",
    contact: "Kontakt",
  },
  contactLabels: {
    address: "Adresse",
    phone: "Telefon",
    email: "E-Mail",
  },
  notes: [
    "Formthotics ist eine Marke der Foot Science International Ltd, Neuseeland. Die Brandlmaier & Rauscher GbR ist ein unabhängiger Anbieter.",
    "Einlagen ersetzen keine ärztliche Diagnose oder Therapie. Bei anhaltenden Beschwerden wenden Sie sich bitte an Ihre Ärztin oder Ihren Arzt.",
  ],
  copyright: "© 2026 Brandlmaier & Rauscher GbR",
});

export const seo = {
  home: {
    title: "Funktionelle Einlagen, thermisch angepasst | Brandlmaier & Rauscher",
    description:
      "Zwei Physiotherapeuten passen funktionelle Einlagen direkt im eigenen Schuh an. Unternehmen geben die Versorgung per Gutschein an ihre Mitarbeitenden weiter.",
  },
  about: {
    title: "Über uns | Brandlmaier & Rauscher Einlagen",
    description:
      "Sebastian Rauscher und Wolfgang Brandlmaier sind Physiotherapeuten mit zusammen 20 Jahren Berufserfahrung. Seit 2018 passen wir funktionelle Einlagen an.",
  },
  vouchers: {
    title: "Einlagen-Gutscheine für Unternehmen | Brandlmaier & Rauscher",
    description:
      "Gutscheine für Untersuchung, funktionelle Einlagen und thermische Anpassung. Anzahl wählen, Bestellanfrage senden, an Mitarbeitende weitergeben.",
  },
  imprint: { title: "Impressum | Brandlmaier & Rauscher Einlagen" },
  privacy: { title: "Datenschutzerklärung | Brandlmaier & Rauscher Einlagen" },
};

// Interface labels that are not part of the marketing copy (navigation and controls).
export const ui = {
  skipLink: "Zum Inhalt springen",
  mainNavLabel: "Hauptnavigation",
  footerNavLabel: "Fußnavigation",
  homeLinkLabel: "Brandlmaier & Rauscher Einlagen, zur Startseite",
  menu: { open: "Menü öffnen", close: "Menü schließen", title: "Menü" },
  claimsLabel: "Auf einen Blick",
  externalHint: "öffnet in neuem Tab",
  // visually hidden prefixes of source lines
  source: "Quelle",
  sources: "Quellen",
  noteAndSource: "Hinweis und Quelle",
};

// Copy deck 1.11: the reassurance row that closes every page.
export type TrustIcon = "clipboard" | "flask" | "refresh";

export const trust: { icon: TrustIcon; title: string; text: string }[] = typesetContent([
  {
    icon: "clipboard",
    title: "Befund vor Produkt",
    text: "Jede Versorgung beginnt mit einer Untersuchung durch einen Physiotherapeuten.",
  },
  {
    icon: "flask",
    title: "Unabhängig untersucht",
    text: "Formthotics wurden in mehreren randomisierten Studien an Universitäten geprüft.",
  },
  {
    icon: "refresh",
    title: "Nachjustierbar",
    text: "Der Schaum lässt sich erneut erwärmen und an neue Schuhe anpassen.",
  },
]);
