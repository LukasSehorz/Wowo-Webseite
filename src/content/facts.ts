// Statistics with their sources (copy deck 1.3, 2.3 and 3.5). Sources are stored without the
// word „Quelle“: SourceLine adds it as a visually hidden prefix.

import { typesetContent } from "@/lib/format";

export type FactIcon = "standing" | "calendar" | "bone" | "experience" | "start" | "teaching" | "pitch";

export type Fact = {
  id: string;
  value: number;
  /** digits after the decimal comma */
  decimals?: number;
  /** text set directly after the number, e.g. " %" or " Mio." */
  suffix?: string;
  /** years are shown without thousands separator */
  isYear?: boolean;
  label: string;
  source?: string;
  icon: FactIcon;
};

export const homeFacts: Fact[] = typesetContent([
  {
    id: "stehen",
    value: 46,
    suffix: " %",
    label: "der Beschäftigten in Deutschland arbeiten häufig im Stehen",
    source: "BIBB/BAuA-Erwerbstätigenbefragung 2024",
    icon: "standing",
  },
  {
    id: "fehltage",
    value: 171,
    suffix: " Mio.",
    label: "Fehltage entfielen 2024 auf Muskel-Skelett-Erkrankungen, mehr als auf jede andere Diagnosegruppe",
    source: "BAuA, Volkswirtschaftliche Kosten durch Arbeitsunfähigkeit 2024",
    icon: "calendar",
  },
  {
    id: "knochen",
    value: 26,
    label:
      "Knochen und 33 Gelenke bilden einen Fuß. Beide Füße zusammen enthalten rund ein Viertel aller Knochen des Körpers",
    source: "StatPearls, NCBI Bookshelf",
    icon: "bone",
  },
]);

export const homeFactsBridge = typesetContent(
  "Der Fuß ist die einzige Stelle, an der der Körper den Boden berührt. Auf harten Böden und in festen Schuhen nimmt vor allem die Ferse die Last auf. Dort setzt eine angeformte Einlage an.",
);

export const aboutFacts: Fact[] = typesetContent([
  {
    id: "erfahrung",
    value: 20,
    label: "Jahre Berufserfahrung in der Physiotherapie, zusammengerechnet",
    icon: "experience",
  },
  {
    id: "beginn",
    value: 2018,
    isYear: true,
    label: "Beginn unserer Versorgung mit funktionellen Einlagen",
    icon: "start",
  },
  {
    id: "lehre",
    value: 6,
    label: "Jahre Lehrtätigkeit für Therapeutinnen und Therapeuten",
    icon: "teaching",
  },
  {
    id: "regionalliga",
    value: 2021,
    isYear: true,
    label: "Beginn der Betreuung im Regionalliga-Fußball",
    icon: "pitch",
  },
]);

export type EmployerFact =
  | { kind: "number"; value: number; decimals?: number; suffix: string; label: string; source: string }
  | { kind: "badge"; badge: string; label: string; source: string };

export const employerFacts: EmployerFact[] = typesetContent([
  {
    kind: "number",
    value: 46,
    suffix: " %",
    label: "der Beschäftigten arbeiten häufig im Stehen, im Handwerk sind es 74 %",
    source: "BIBB/BAuA-Erwerbstätigenbefragung 2024",
  },
  {
    kind: "number",
    value: 19.4,
    decimals: 1,
    suffix: " %",
    label: "aller Fehltage entfielen 2024 auf Muskel-Skelett-Erkrankungen, die größte Diagnosegruppe",
    source: "BAuA 2024",
  },
  {
    kind: "badge",
    badge: "EU-OSHA",
    label:
      "Die EU-Arbeitsschutzagentur nennt individuell angepasste Einlagen als Maßnahme bei Steharbeit, an deren Kosten sich Arbeitgeber beteiligen können, wenn sie ärztlich oder physiotherapeutisch empfohlen sind",
    source: "EU-OSHA 2021",
  },
]);

export const employerClassification = typesetContent(
  "Ob Einlagen Fehltage verringern, hat bisher keine Studie untersucht. Belegt ist die Druckentlastung unter der Ferse. Gutscheine sind deshalb ein Baustein der betrieblichen Gesundheitsförderung für Mitarbeitende, die viel stehen und gehen.",
);
