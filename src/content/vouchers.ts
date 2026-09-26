// Copy deck section 3 (Gutscheine). Prices and tiers live in src/config/vouchers.ts.

import type { IconName } from "@/components/ui/Icon";
import { typesetContent } from "@/lib/format";

/** § 19 UStG: the client shows no VAT, so every price on the site is a final price. */
export const finalPriceNote = typesetContent(
  "Alle Preise sind Endpreise. Nach § 19 UStG wird keine Umsatzsteuer ausgewiesen.",
);

export const vouchersHero = typesetContent({
  eyebrow: "Für Unternehmen",
  headline: ["Gutscheine", "für Ihr Team"],
  text: "Ein Gutschein umfasst die Untersuchung, ein Paar funktionelle Einlagen und die thermische Anpassung im eigenen Schuh. Sie bestellen die gewünschte Anzahl, Ihre Mitarbeitenden vereinbaren ihren Termin selbst.",
  button: { label: "Anzahl wählen", href: "#anfrage" },
  link: { label: "So funktioniert es", href: "#ablauf" },
});

export const included = typesetContent({
  heading: "Das ist in jedem Gutschein enthalten",
  rows: [
    { id: "untersuchung", icon: "clipboard", label: "Untersuchung", value: "Fußform, Beweglichkeit, Gangbild, Schuhe" },
    { id: "einlagen", icon: "insole", label: "Einlagen", value: "Ein Paar Formthotics, Modell nach Befund" },
    { id: "anpassung", icon: "heat", label: "Anpassung", value: "Thermisch im eigenen Schuh" },
    { id: "feinjustierung", icon: "sliders", label: "Feinjustierung", value: "Keile und Pelotten nach Bedarf" },
    { id: "nachkontrolle", icon: "refresh", label: "Nachkontrolle", value: "Erneutes Anformen bei Druckstellen" },
  ] satisfies { id: string; icon: IconName; label: string; value: string }[],
  price: {
    prefix: "ab",
    unit: "je Gutschein",
    note: finalPriceNote,
  },
});

export const employers = typesetContent({
  heading: "Warum Unternehmen bei den Füßen ansetzen",
  image: {
    src: "/media/images/work-warehouse-walk.jpg",
    alt: "Beschäftigte in blauer Arbeitskleidung gehen durch den Gang eines Hochregallagers, in Bewegung unscharf",
    // the lower part of the frame: floor and walking figures instead of the racking (R3-07)
    position: "50% 100%",
  },
});

export const configurator = typesetContent({
  id: "anfrage",
  heading: "Anzahl wählen und anfragen",
  groups: {
    quantity: "Anzahl der Gutscheine",
    tiers: "Staffelpreise",
    details: "Ihre Angaben",
    message: "Nachricht",
  },
  quantity: {
    decrease: "Anzahl verringern",
    increase: "Anzahl erhöhen",
    quickPicksLabel: "Schnellauswahl",
    sliderLabel: "Anzahl der Gutscheine mit dem Regler wählen",
  },
  perVoucher: "je Gutschein",
  summary: {
    title: "Zusammenfassung",
    quantity: "Anzahl der Gutscheine",
    pricePerVoucher: "Preis je Gutschein",
    total: "Gesamt",
    vatNote: finalPriceNote,
    note: "Unverbindliche Anfrage. Sie erhalten ein schriftliches Angebot, bevor eine Bestellung zustande kommt.",
  },
  fields: {
    company: "Unternehmen",
    contact: "Ansprechperson",
    email: "E-Mail",
    phone: "Telefon (optional)",
    message: "Nachricht (optional)",
  },
  consent: {
    before: "Ich habe die ",
    link: "Datenschutzerklärung",
    after: " gelesen und bin damit einverstanden, dass meine Angaben zur Bearbeitung der Anfrage verarbeitet werden.",
  },
  submit: "Bestellanfrage senden",
  pending: "Wird gesendet",
  errors: {
    company: "Bitte geben Sie Ihr Unternehmen an.",
    contact: "Bitte nennen Sie eine Ansprechperson.",
    email: "Bitte geben Sie eine gültige E-Mail-Adresse an.",
    consent: "Bitte bestätigen Sie die Datenschutzerklärung.",
    send: "Die Anfrage konnte nicht gesendet werden. Bitte versuchen Sie es erneut oder schreiben Sie uns eine E-Mail.",
  },
  success: {
    heading: "Ihre Anfrage ist eingegangen",
    // `{responseTime}` comes from config/vouchers.ts, where the client confirms the period
    text: "Wir melden uns innerhalb von {responseTime} mit einem Angebot. Eine Kopie Ihrer Angaben sehen Sie unten.",
  },
  // honeypot: hidden from people, tempting for bots
  honeypotLabel: "Website",
});

export const contact = typesetContent({
  heading: "Lieber persönlich",
  text: "Sie erreichen uns telefonisch oder per E-Mail. Wir besprechen Anzahl, Ablauf und Termine mit Ihnen.",
  phoneLabel: "Telefon",
  emailLabel: "E-Mail",
});
