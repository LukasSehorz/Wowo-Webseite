// Frequently asked questions (copy deck 3.7).
// Answers with a TODO(client) comment contain a value the client still has to confirm.

import { site } from "@/config/site";
import { typesetContent } from "@/lib/format";

/** An answer may close with one link. `href` is skipped by `typesetContent`, the label is not. */
export type FaqItem = { question: string; answer: string; link?: { label: string; href: string } };

export const faqHeading = "Häufige Fragen";

export const faq: FaqItem[] = typesetContent([
  {
    question: "Was ist im Gutschein enthalten?",
    answer:
      "Die Untersuchung durch einen Physiotherapeuten, ein Paar Formthotics in dem Modell, das zum Befund passt, die thermische Anpassung im eigenen Schuh und das Nachjustieren bei Druckstellen.",
  },
  {
    question: "Wo findet die Anpassung statt?",
    // TODO(client): confirm location and on-site visits
    answer:
      "In unserer Praxis in Waldkraiburg. Für größere Teams kommen wir nach Absprache in Ihr Unternehmen. Ihre Mitarbeitenden können den Gutschein auch bei einer Formthotics-Partnerpraxis in ihrer Nähe einlösen. Deutschlandweit sind das über 300 Praxen.",
    link: { label: "Partnerpraxis suchen", href: site.partnerDirectoryUrl },
  },
  {
    question: "Wie lange dauert ein Termin?",
    // TODO(client): confirm the duration per person
    answer:
      "Der Heizzyklus dauert drei Minuten, das Anformen 30 Sekunden. Mit Untersuchung und Kontrolle planen wir pro Person etwa eine halbe Stunde ein.",
  },
  {
    question: "Welche Schuhe eignen sich?",
    answer:
      "Schuhe mit herausnehmbarer Innensohle und festem Halt. Bringen Sie die Schuhe mit, die Sie im Alltag oder bei der Arbeit am häufigsten tragen.",
  },
  {
    question: "Können die Einlagen in Sicherheitsschuhen getragen werden?",
    answer:
      "In zertifizierten Sicherheitsschuhen dürfen nur Einlagen verwendet werden, die zusammen mit dem Schuh baumustergeprüft wurden. Wir klären vor der Anpassung, welche Ihrer Schuhe infrage kommen. Für Alltags- und Sportschuhe gilt diese Einschränkung nicht.",
  },
  {
    question: "Gibt es eine Eingewöhnung?",
    answer:
      "Sie können die Einlagen direkt nach der Anpassung tragen. Je nach Fuß dauert es ein paar Tage, bis Sie sich an sie gewöhnt haben. Treten dabei Druckstellen auf, passen wir nach.",
  },
  {
    question: "Wie lange halten die Einlagen?",
    answer:
      "Der Hersteller nennt 12 bis 24 Monate, abhängig von Belastung und Körpergewicht. In einer Studie verringerten über ein Jahr getragene Einlagen den Fersendruck noch um 18 %, neue um 23 % (Cronkwright DG et al., Gait & Posture 2011. Untersucht wurden Formthotics).",
  },
  {
    question: "Wie lange sind die Gutscheine gültig?",
    // TODO(client): confirm the validity period
    answer: "Drei Jahre ab dem Ende des Jahres, in dem der Gutschein ausgestellt wurde.",
  },
  {
    question: "Wie werden die Gutscheine steuerlich behandelt?",
    answer: "Das hängt von Ihrer betrieblichen Situation ab. Bitte klären Sie die Einordnung mit Ihrer Steuerberatung.",
  },
]);
