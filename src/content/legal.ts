// Copy deck section 4: placeholder structure of the legal pages. No legal text is invented here;
// every value the client still has to deliver is `null` and renders as „Angabe folgt“.

import { site, type Pending } from "@/config/site";

export type LegalItem = { label: string; value: Pending };
export type LegalSection = { heading: string; items?: LegalItem[]; text?: Pending };

export const placeholderNotice = {
  label: "Platzhalter",
  text: "Diese Seite ist ein Platzhalter. Die mit „Angabe folgt“ markierten Stellen werden vor der Veröffentlichung ergänzt.",
};

export const imprint = {
  heading: "Impressum",
  basis: "Angaben nach § 5 DDG",
  items: [
    { label: "Name der Gesellschaft", value: site.name },
    { label: "Vertretungsberechtigte Gesellschafter", value: site.founders.join(" und ") },
    { label: "Anschrift", value: site.contact.address },
    { label: "Telefon", value: site.contact.phone },
    { label: "E-Mail", value: site.contact.email },
    // TODO(client): the client works under § 19 UStG and shows no VAT. Either leave the VAT ID
    // empty and note the small business rule here, or fill in the ID if there is one.
    { label: "Umsatzsteuer-ID", value: site.legal.vatId },
    { label: "Umsatzsteuer", value: site.legal.smallBusinessNote },
    { label: "Berufsbezeichnung", value: "Physiotherapeut, verliehen in Deutschland" },
    { label: "Zuständige Aufsichtsbehörde", value: site.legal.supervisoryAuthority },
  ] satisfies LegalItem[],
};

// Muss vor dem Livegang juristisch geprüft werden.
export const privacy = {
  // soft hyphen: the word may break on narrow screens
  heading: "Datenschutz\u00ADerklärung",
  intro: "Die Seite setzt keine Cookies und lädt keine Inhalte von Drittanbietern.",
  sections: [
    { heading: "Verantwortliche Stelle", text: null },
    { heading: "Hosting", text: null },
    { heading: "Server-Logfiles", text: null },
    {
      heading: "Bestellanfrage-Formular",
      items: [
        { label: "Zweck", value: null },
        { label: "Rechtsgrundlage", value: "Art. 6 Abs. 1 lit. b DSGVO" },
        { label: "Speicherdauer", value: null },
      ],
    },
    { heading: "Rechte der Betroffenen", text: null },
  ] satisfies LegalSection[],
};
