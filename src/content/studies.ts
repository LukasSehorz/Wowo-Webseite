// The five visualised studies (copy deck 1.8). Charts show the published numbers only.

import { typesetContent } from "@/lib/format";

export type BarDatum = { label: string; value: number; highlight?: boolean };

export type StudyChart =
  | { type: "bars"; caption: string; unit: string; decimals: number; max: number; data: BarDatum[] }
  | { type: "dots"; caption: string; total: number; groups: { label: string; count: number; highlight?: boolean }[] }
  | {
      type: "lines";
      caption: string;
      yMax: number;
      points: { label: string; month: number }[];
      /**
       * `labelAt` names one point that is labelled with series name and value; all end points show
       * their value. `dashed` gives a series a second channel besides colour.
       */
      series: {
        label: string;
        values: number[];
        highlight?: boolean;
        dashed?: boolean;
        labelAt?: { point: number; position: "above" | "below" };
      }[];
    }
  | {
      type: "ratio";
      caption: string;
      max: number;
      reference: { value: number; label: string };
      rows: { label: string; value: number; low: number; high: number; highlight?: boolean }[];
    };

export type Study = {
  id: string;
  figure: string;
  title: string;
  statement: string;
  limits: string;
  source: string;
  doi: string;
  chart: StudyChart;
};

export const studiesIntro = typesetContent({
  id: "forschung",
  eyebrow: "Forschung",
  heading: "Was Studien zeigen und was nicht",
  text: "Mehrere unabhängige Universitätsgruppen haben Formthotics untersucht. Gut belegt ist die Umverteilung des Drucks unter der Fußsohle. Die klinischen Effekte sind kleiner und hängen vom Beschwerdebild ab. Wir zeigen die Ergebnisse mit ihren Grenzen.",
  previous: "Vorherige Studie",
  next: "Nächste Studie",
  carouselLabel: "Studien",
  limitsLabel: "Grenzen",
  doiLabel: "DOI",
});

export const studies: Study[] = typesetContent([
  {
    id: "chia-2009",
    figure: "−24 %",
    title: "Fersendruck im Stehen",
    statement:
      "Bei 30 Personen mit Fersenschmerz senkte die angeformte Einlage den Spitzendruck unter der Ferse im Stehen von 10,4 auf 7,9 N/cm². Ein weiches Fersenkissen veränderte ihn nicht.",
    limits:
      "Einmalige Druckmessung ohne Schmerzerhebung. Eine eigens gefertigte Orthese mit Fersenaussparung lag mit 7,3 N/cm² etwas darunter.",
    source: "Chia JKK et al., Ann Acad Med Singapore 2009; 38: 869–875. Untersucht wurden Formthotics.",
    doi: "https://doi.org/10.47102/annals-acadmedsg.v38n10p869",
    chart: {
      type: "bars",
      caption: "Spitzendruck unter der Ferse im Stehen in N/cm²",
      unit: "N/cm²",
      decimals: 1,
      max: 12,
      data: [
        { label: "Schuh allein", value: 10.4 },
        { label: "Fersenkissen", value: 10.5 },
        { label: "Flache Sohle", value: 9.7 },
        { label: "Formthotics", value: 7.9, highlight: true },
        { label: "Maßorthese", value: 7.3 },
      ],
    },
  },
  {
    id: "bonanno-2018",
    figure: "18 statt 26",
    title: "von 100 mit Überlastungsbeschwerden",
    statement:
      "In einer verblindeten Studie mit 306 Rekrutinnen und Rekruten der australischen Marine traten in elf Wochen Grundausbildung mit angeformten Formthotics bei 18 von 100 Personen typische Überlastungsbeschwerden auf, mit flachen Vergleichssohlen bei 26 von 100.",
    limits:
      "Der Unterschied ist statistisch nicht gesichert (p = 0,098). Leichte Beschwerden wie Blasen waren mit Formthotics anfangs häufiger (20 gegenüber 12 von 100).",
    source: "Bonanno DR et al., Br J Sports Med 2018; 52: 298–302. Untersucht wurden Formthotics.",
    doi: "https://doi.org/10.1136/bjsports-2017-098273",
    chart: {
      type: "dots",
      caption: "Personen mit Überlastungsbeschwerden je 100",
      total: 100,
      groups: [
        { label: "Flache Vergleichssohlen", count: 26 },
        { label: "Formthotics", count: 18, highlight: true },
      ],
    },
  },
  {
    id: "landorf-2006",
    figure: "3 Monate",
    title: "früher besser, nach einem Jahr gleich",
    statement:
      "135 Menschen mit Fersenschmerz erhielten eine Placebo-Sohle, Formthotics oder eine Maßorthese aus Hartkunststoff. Mit Formthotics besserten sich die Beschwerden in den ersten drei Monaten etwas schneller als mit Placebo und ebenso gut wie mit der teureren Maßorthese.",
    limits:
      "Nach zwölf Monaten ging es allen Gruppen ähnlich gut. Der Vorteil nach drei Monaten war klein (Funktion +8,4 Punkte, p = 0,03).",
    source: "Landorf KB et al., Arch Intern Med 2006; 166: 1305–1310. Untersucht wurden unter anderem Formthotics.",
    doi: "https://doi.org/10.1001/archinte.166.12.1305",
    chart: {
      type: "lines",
      caption: "Fußschmerz-Score 0 bis 100, höher bedeutet weniger Schmerz",
      yMax: 100,
      points: [
        { label: "zu Beginn", month: 0 },
        { label: "nach 3 Monaten", month: 3 },
        { label: "nach 12 Monaten", month: 12 },
      ],
      series: [
        { label: "Placebo-Sohle", values: [45, 63, 82], dashed: true, labelAt: { point: 1, position: "below" } },
        { label: "Formthotics", values: [42, 71, 84], highlight: true, labelAt: { point: 1, position: "above" } },
        { label: "Maßorthese aus Hartkunststoff", values: [48, 72, 83] },
      ],
    },
  },
  {
    id: "cronkwright-2011",
    figure: "−18 %",
    title: "nach über einem Jahr Tragezeit",
    statement:
      "Nach mindestens zwölf Monaten täglicher Nutzung verringerten die Einlagen den Spitzendruck unter der Ferse noch um 18 %. Bei einem neuen Paar waren es 23 %.",
    limits:
      "Gemessen bei 31 Personen über 65 Jahren. Bei starker beruflicher Belastung kann der Verschleiß höher sein. Der Hersteller nennt eine Lebensdauer von 12 bis 24 Monaten.",
    source: "Cronkwright DG et al., Gait & Posture 2011; 34: 553–557. Untersucht wurden Formthotics.",
    doi: "https://doi.org/10.1016/j.gaitpost.2011.07.016",
    chart: {
      type: "bars",
      caption: "Minderung des Spitzendrucks unter der Ferse gegenüber dem Schuh ohne Einlage",
      unit: "%",
      decimals: 0,
      max: 30,
      data: [
        { label: "Neues Paar", value: 23 },
        { label: "Über zwölf Monate getragen", value: 18, highlight: true },
      ],
    },
  },
  {
    id: "bonanno-2017",
    figure: "−28 %",
    title: "Verletzungen mit stützenden Einlagen",
    statement:
      "Eine Auswertung von 18 Studien, überwiegend mit Rekruten, fand mit stützenden, konturierten Einlagen 28 % weniger Verletzungen als ohne. Reine Dämpfungssohlen zeigten keinen gesicherten Effekt.",
    limits:
      "Die Auswertung betrifft Einlagen verschiedener Hersteller und nicht speziell Formthotics. Die Qualität der Einzelstudien war niedrig bis mittel.",
    source: "Bonanno DR et al., Br J Sports Med 2017; 51: 86–96.",
    doi: "https://doi.org/10.1136/bjsports-2016-096671",
    chart: {
      type: "ratio",
      caption: "Verletzungen im Vergleich zu „ohne Einlage“ (100 %), mit Konfidenzintervall",
      max: 120,
      reference: { value: 100, label: "ohne Einlage" },
      rows: [
        { label: "Stützende Einlagen", value: 72, low: 55, high: 94, highlight: true },
        { label: "Reine Dämpfungssohlen", value: 92, low: 73, high: 116 },
      ],
    },
  },
]);

export const notProven = typesetContent({
  heading: "Was nicht belegt ist",
  text: "Für chronische Rückenschmerzen fand die einzige randomisierte Studie mit Formthotics keinen Vorteil (Sadler S et al., Musculoskeletal Care 2023). Ob Einlagen Fehltage verringern, hat bisher keine Studie untersucht. Einlagen ersetzen keine ärztliche Diagnose oder Therapie.",
});
