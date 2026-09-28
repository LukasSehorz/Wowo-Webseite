// Research section (copy deck 1.8): five studies, each asked as a plain question. The visible layer
// uses everyday language; exact values, units and statistics live in `details`. Every number is the
// published one (CONTENT-BRIEF sections 3 and 5); bar lengths are drawn from zero.

import { typesetContent } from "@/lib/format";

/** Colour of a mark: olive belongs to Formthotics, ink and slate to comparisons. */
export type Tone = "accent" | "neutral" | "muted";

type Pair<T> = [T, T];

/** One side of the comparison, shown above the graphic: an optional large figure plus a short text. */
export type Readout = { figure?: string; text: string };

export type StudyVisual =
  | {
      /** one figure per person, the affected ones are coloured (filled column by column) */
      type: "people";
      total: number;
      counts: Pair<number>;
      tones: Pair<Tone>;
    }
  | {
      /** horizontal bars from zero; `reference` names the full track (= max) */
      type: "bars";
      max: number;
      reference?: string;
      rows: { label?: string; values: Pair<number>; tones: Pair<Tone>; showValue?: boolean }[];
    };

export type EvidenceLevel = 1 | 2 | 3;

export type Study = {
  id: string;
  question: string;
  answer: string;
  /** labels of the two states of the switch; the second one is shown first */
  states: Pair<string>;
  readouts: Pair<Readout>;
  visual: StudyVisual;
  /** who was measured and how to read the graphic */
  caption: string;
  /** accessible name of the graphic, names both states */
  figureLabel: string;
  caveat: string;
  source: string;
  evidence: EvidenceLevel;
  details: {
    facts: { label: string; value: string }[];
    resultsLabel: string;
    results: { label: string; value: string; highlight?: boolean }[];
    notes: string[];
    rating: string;
    citation: string;
  };
  doi: string;
};

export const studiesIntro = typesetContent({
  id: "forschung",
  eyebrow: "Forschung",
  heading: "Was Studien zeigen und was nicht",
  text: "Mehrere unabhängige Universitätsgruppen haben Formthotics untersucht. Gut belegt ist, dass die Einlagen den Druck gleichmäßiger verteilen. Bei Beschwerden sind die Effekte kleiner. Zu jeder Frage zeigen wir Ergebnis und Grenzen.",
  listLabel: "Fragen an die Forschung",
  switchLabel: "Vergleich wählen",
  evidenceLabel: "Wie sicher ist das?",
  evidenceLevels: {
    3: {
      label: "Gut belegt",
      meaning: "Deutliches, statistisch gesichertes Ergebnis, das weitere Studien stützen.",
    },
    2: {
      label: "Eingeschränkt belegt",
      meaning:
        "Messbares Ergebnis, aber klein, nur kurzfristig, nur in einer Gruppe untersucht oder aus Studien niedriger Qualität.",
    },
    1: {
      label: "Nur ein Hinweis",
      meaning: "Das Ergebnis weist in eine Richtung, ist aber statistisch nicht gesichert.",
    },
  },
  evidenceNote: "Die Einstufung ist unsere Einordnung der veröffentlichten Ergebnisse.",
  evidenceOf: "Stufe {level} von 3",
  detailsToggle: "Genauer ansehen",
  detailLabels: {
    results: "Ergebnisse",
    notes: "Statistik und Hinweise",
    rating: "Warum diese Einstufung",
    scale: "So stufen wir ein",
    source: "Quelle",
  },
  doiLabel: "DOI",
});

export const studies: Study[] = typesetContent([
  {
    id: "chia-2009",
    question: "Entlastet die Einlage die Ferse im Stehen?",
    answer: "Rund ein Viertel weniger Druck unter der Ferse.",
    states: ["Ohne Einlage", "Mit Formthotics"],
    readouts: [{ text: "Druck im Schuh ohne Einlage" }, { figure: "−24 %", text: "Druck unter der Ferse" }],
    visual: {
      type: "bars",
      max: 10.4,
      reference: "Schuh ohne Einlage",
      rows: [{ values: [10.4, 7.9], tones: ["neutral", "accent"] }],
    },
    caption: "Gemessen im Stehen bei 30 Menschen mit Fersenschmerz.",
    figureLabel:
      "Druck unter der Ferse im Stehen. Ohne Einlage 10,4, mit Formthotics 7,9 Newton pro Quadratzentimeter, also 24 % weniger.",
    caveat: "Aber gemessen wurde nur einmal der Druck, nicht ob die Schmerzen nachließen.",
    source: "Chia JKK et al., Ann Acad Med Singapore 2009; 38: 869–875. Untersucht wurden Formthotics.",
    evidence: 3,
    details: {
      facts: [
        {
          label: "Art der Studie",
          value:
            "Kontrollierter Vergleich in einer sportmedizinischen Klinik in Singapur, nicht verblindet. Eine Messung im ruhigen Stehen, in Schuhen, auf einer Druckmessplatte.",
        },
        {
          label: "Teilnehmende",
          value: "30 Erwachsene zwischen 20 und 65 Jahren mit einseitigem, chronischem Fersenschmerz (Plantarfasziitis).",
        },
        { label: "Gemessen", value: "Spitzendruck unter der Ferse des schmerzenden Fußes in N/cm²." },
      ],
      resultsLabel: "Spitzendruck unter der Ferse",
      results: [
        { label: "Schuh allein", value: "10,4 N/cm²" },
        { label: "Weiches Fersenkissen", value: "10,5 N/cm² (+1 %)" },
        { label: "Flache Sohle", value: "9,7 N/cm² (−6 %)" },
        { label: "Formthotics", value: "7,9 N/cm² (−24 %)", highlight: true },
        { label: "Maßorthese mit Fersenaussparung", value: "7,3 N/cm² (−30 %)" },
      ],
      notes: [
        "Unterschiede zwischen den fünf Varianten statistisch gesichert (p = 0,0008).",
        "Am gesunden Fuß zeigte sich ein ähnliches Muster (11,4 auf 8,2 N/cm² mit Formthotics).",
        "Die eigens gefertigte Maßorthese senkte den Druck etwas stärker.",
      ],
      rating:
        "Deutlicher, statistisch gesicherter Messwert. Zwei weitere Studien mit Formthotics maßen ähnliche Werte, beim Gehen in Arbeitsstiefeln 19 % weniger (Bonanno DR et al., Sci Rep 2019) und mit einem neuen Paar 23 % weniger (Cronkwright DG et al., Gait & Posture 2011).",
      citation:
        "Chia JKK, Suresh S, Kuah A, Ong JLJ, Phua JMT, Seah AL. Comparative trial of the foot pressure patterns between corrective orthotics, formthotics, bone spur pads and flat insoles in patients with chronic plantar fasciitis. Ann Acad Med Singapore 2009; 38: 869–875.",
    },
    doi: "https://doi.org/10.47102/annals-acadmedsg.v38n10p869",
  },
  {
    id: "bonanno-2018",
    // soft hyphen: phones break the long word at its seam, not at „be-“
    question: "Gibt es weniger Überlastungs\u00ADbeschwerden?",
    answer: "Etwas weniger, 18 statt 26 von 100 Personen.",
    states: ["Mit flacher Sohle", "Mit Formthotics"],
    readouts: [
      { figure: "26 von 100", text: "hatten Beschwerden" },
      { figure: "18 von 100", text: "hatten Beschwerden" },
    ],
    visual: { type: "people", total: 100, counts: [26, 18], tones: ["neutral", "accent"] },
    caption:
      "Jede Figur steht für eine von 100 Personen. Rekrutinnen und Rekruten der Marine, elf Wochen Grundausbildung.",
    figureLabel:
      "Personen mit Überlastungsbeschwerden je 100. Mit flacher Vergleichssohle 26 von 100, mit Formthotics 18 von 100.",
    caveat:
      "Aber die Studie war zu klein, um den Unterschied statistisch abzusichern. Leichte Beschwerden wie Blasen waren mit Formthotics anfangs häufiger.",
    source: "Bonanno DR et al., Br J Sports Med 2018; 52: 298–302. Untersucht wurden Formthotics.",
    evidence: 1,
    details: {
      facts: [
        {
          label: "Art der Studie",
          value:
            "Randomisierte Studie. Weder die Teilnehmenden noch die Untersuchenden wussten, wer welche Sohle trug.",
        },
        {
          label: "Teilnehmende",
          value:
            "306 Rekrutinnen und Rekruten der australischen Marine (241 Männer, 65 Frauen, 17 bis 50 Jahre), elf Wochen Grundausbildung, Einlagen rund zehn Stunden am Tag getragen.",
        },
        {
          label: "Vergleich",
          value: "Flache, 3 mm dünne Sohle aus demselben Schaumstoff, gleich in Farbe und Aufdruck.",
        },
        {
          label: "Gemessen",
          value:
            "Neu aufgetretene typische Überlastungsbeschwerden, zusammengefasst aus Schienbeinkantensyndrom sowie Schmerzen an Kniescheibe, Achillessehne und Ferse.",
        },
      ],
      resultsLabel: "Personen mit Überlastungsbeschwerden",
      results: [
        { label: "Formthotics", value: "27 von 153 (17,6 %)", highlight: true },
        { label: "Flache Vergleichssohle", value: "40 von 153 (26,1 %)" },
        { label: "Leichte Nebenwirkungen mit Formthotics", value: "20,3 %" },
        { label: "Leichte Nebenwirkungen mit flacher Sohle", value: "12,4 %" },
      ],
      notes: [
        "Verhältnis der Raten 0,66 (95-%-Konfidenzintervall 0,39 bis 1,11), p = 0,098. Der Unterschied ist damit statistisch nicht gesichert.",
        "Nebenwirkungen waren vor allem Schmerzen am Fußgewölbe oder Schienbein und Blasen, meist leicht bis mäßig und zu 77 % in den ersten zwei Wochen.",
      ],
      rating:
        "Sorgfältig angelegte Studie mit einer gleich aussehenden Vergleichssohle. Das Ergebnis weist in eine Richtung, ist aber statistisch nicht gesichert.",
      citation:
        "Bonanno DR, Murley GS, Munteanu SE, Landorf KB, Menz HB. Effectiveness of foot orthoses for the prevention of lower limb overuse injuries in naval recruits: a randomised controlled trial. Br J Sports Med 2018; 52: 298–302.",
    },
    doi: "https://doi.org/10.1136/bjsports-2017-098273",
  },
  {
    id: "landorf-2006",
    question: "Hilft sie bei Fersenschmerz?",
    answer: "Etwas, in den ersten drei Monaten.",
    states: ["Nach 3 Monaten", "Nach 12 Monaten"],
    readouts: [
      { figure: "3 Monate", text: "Mit Formthotics etwas weniger Schmerz" },
      { figure: "12 Monate", text: "Kaum noch ein Unterschied" },
    ],
    visual: {
      type: "bars",
      max: 100,
      rows: [
        { label: "Dünne Vergleichssohle", values: [63, 82], tones: ["neutral", "neutral"], showValue: true },
        { label: "Formthotics", values: [71, 84], tones: ["accent", "accent"], showValue: true },
      ],
    },
    caption: "135 Menschen mit Fersenschmerz, Fragebogen von 0 bis 100 Punkten. Mehr Punkte bedeuten weniger Schmerz.",
    figureLabel:
      "Fragebogen zu Fußschmerz, 0 bis 100 Punkte, mehr Punkte bedeuten weniger Schmerz. Nach 3 Monaten Vergleichssohle 63, Formthotics 71. Nach 12 Monaten Vergleichssohle 82, Formthotics 84.",
    caveat: "Aber der Vorsprung war klein, und nach einem Jahr ging es allen Gruppen ähnlich gut.",
    source: "Landorf KB et al., Arch Intern Med 2006; 166: 1305–1310. Untersucht wurden unter anderem Formthotics.",
    evidence: 2,
    details: {
      facts: [
        {
          label: "Art der Studie",
          value:
            "Randomisierte Studie mit drei Gruppen über zwölf Monate. Die Teilnehmenden wussten nicht, welche Einlage sie trugen.",
        },
        {
          label: "Teilnehmende",
          value: "135 Erwachsene mit Fersenschmerz (Plantarfasziitis) seit mindestens vier Wochen, im Mittel etwa 48 Jahre alt.",
        },
        {
          label: "Vergleich",
          value: "Dünne, weiche Schaumstoffsohle als Scheinbehandlung und eine Maßorthese aus Hartkunststoff nach Gipsabdruck.",
        },
        {
          label: "Gemessen",
          value:
            "Fragebogen zur Fußgesundheit (Foot Health Status Questionnaire), 0 bis 100 Punkte, mehr Punkte bedeuten weniger Beschwerden.",
        },
      ],
      resultsLabel: "Schmerzwert zu Beginn, nach 3 und nach 12 Monaten",
      results: [
        { label: "Dünne Vergleichssohle", value: "45 · 63 · 82" },
        { label: "Formthotics", value: "42 · 71 · 84", highlight: true },
        { label: "Maßorthese aus Hartkunststoff", value: "48 · 72 · 83" },
      ],
      notes: [
        "Nach drei Monaten gegenüber der Vergleichssohle Funktion +8,4 Punkte (p = 0,03), Schmerz +8,7 Punkte (p = 0,05).",
        "Nach zwölf Monaten kein gesicherter Unterschied zwischen den Gruppen.",
        "Formthotics und die Maßorthese schnitten ähnlich ab (Unterschied 1,3 Punkte, nicht gesichert).",
      ],
      rating:
        "Randomisierte Studie mit einem gesicherten, aber kleinen Vorteil bei der Funktion nach drei Monaten. Beim Schmerz war er knapp nicht gesichert, nach zwölf Monaten gab es keinen Unterschied mehr.",
      citation:
        "Landorf KB, Keenan AM, Herbert RD. Effectiveness of foot orthoses to treat plantar fasciitis: a randomized trial. Arch Intern Med 2006; 166: 1305–1310.",
    },
    doi: "https://doi.org/10.1001/archinte.166.12.1305",
  },
  {
    id: "cronkwright-2011",
    question: "Wirkt sie auch nach einem Jahr noch?",
    answer: "Auch nach einem Jahr Tragezeit noch 18 % weniger Druck unter der Ferse.",
    states: ["Neues Paar", "Ein Jahr getragen"],
    readouts: [
      { figure: "−23 %", text: "Druck unter der Ferse" },
      { figure: "−18 %", text: "Druck unter der Ferse" },
    ],
    visual: {
      type: "bars",
      max: 100,
      reference: "Schuh ohne Einlage",
      rows: [{ values: [77, 82], tones: ["accent", "accent"] }],
    },
    caption: "Gemessen beim Gehen bei 31 Menschen über 65 Jahren.",
    figureLabel:
      "Druck unter der Ferse im Vergleich zum Schuh ohne Einlage. Neues Paar 23 % weniger, nach mindestens einem Jahr Tragezeit 18 % weniger.",
    caveat:
      "Aber gemessen wurde bei älteren Menschen. Wer im Beruf viel steht und geht, nutzt die Einlagen womöglich schneller ab.",
    source: "Cronkwright DG et al., Gait & Posture 2011; 34: 553–557. Untersucht wurden Formthotics.",
    evidence: 2,
    details: {
      facts: [
        {
          label: "Art der Studie",
          value:
            "Messung im Labor beim Gehen, mit Druckmesssohlen im Schuh. Verglichen wurden der Schuh ohne Einlage, ein neues Paar und das eigene, mindestens zwölf Monate getragene Paar.",
        },
        {
          label: "Teilnehmende",
          value: "31 Erwachsene über 65 Jahre (im Mittel 75,4 Jahre, 21 Frauen) aus einer Studie zur Sturzvorbeugung.",
        },
        { label: "Gemessen", value: "Spitzendruck und Kraft unter der Ferse und dem Mittelfuß, im Vergleich zum Schuh ohne Einlage." },
      ],
      resultsLabel: "Im Vergleich zum Schuh ohne Einlage",
      results: [
        { label: "Fersendruck, neues Paar", value: "−23 %" },
        { label: "Fersendruck, mindestens zwölf Monate getragen", value: "−18 %", highlight: true },
        { label: "Kraft unter dem Mittelfuß, neues Paar", value: "+42 %" },
        { label: "Kraft unter dem Mittelfuß, getragen", value: "+44 %" },
      ],
      notes: [
        "Getragen lag der Fersendruck 6 % höher als mit einem neuen Paar (p = 0,001). In beiden Fällen trug das Fußgewölbe mehr Last.",
        "Untersucht wurden Formthotics Dual Density in voller Länge. Der Hersteller nennt eine Lebensdauer von 12 bis 24 Monaten.",
      ],
      rating:
        "Klares Messergebnis, aber nur eine Studie mit 31 älteren Menschen. Für Menschen mit starker Belastung im Beruf fehlen Messungen.",
      citation:
        "Cronkwright DG, Spink MJ, Landorf KB, Menz HB. Evaluation of the pressure-redistributing properties of prefabricated foot orthoses in older people after at least 12 months of wear. Gait & Posture 2011; 34: 553–557. Prozentwerte aus J Foot Ankle Res 2011; 4 (Suppl 1): O13.",
    },
    doi: "https://doi.org/10.1016/j.gaitpost.2011.07.016",
  },
  {
    id: "bonanno-2017",
    question: "Stützen oder nur polstern, was bringt mehr?",
    answer: "Stützende Einlagen, mit 28 % weniger Verletzungen.",
    states: ["Nur polsternd", "Stützend"],
    readouts: [{ text: "Kein gesicherter Effekt" }, { figure: "−28 %", text: "Verletzungen" }],
    visual: {
      type: "bars",
      max: 100,
      reference: "Ohne Einlage",
      rows: [{ values: [92, 72], tones: ["muted", "neutral"] }],
    },
    caption: "Auswertung von 18 Studien, meist mit Rekruten. Einlagen verschiedener Hersteller.",
    figureLabel:
      "Verletzungen im Vergleich zu keiner Einlage. Nur polsternde Sohlen 92 %, kein gesicherter Effekt. Stützende Einlagen 72 %, also 28 % weniger.",
    caveat:
      "Aber die Auswertung betrifft Einlagen verschiedener Hersteller und nicht speziell Formthotics. Die Qualität der einzelnen Studien war niedrig bis mittel.",
    source: "Bonanno DR et al., Br J Sports Med 2017; 51: 86–96. Einlagen verschiedener Hersteller, nicht speziell Formthotics.",
    evidence: 2,
    details: {
      facts: [
        {
          label: "Art der Studie",
          value:
            "Systematische Übersicht mit Meta-Analyse, also eine gemeinsame Auswertung von 18 Studien, 11 zu stützenden Einlagen und 7 zu reinen Dämpfungssohlen.",
        },
        { label: "Teilnehmende", value: "Überwiegend Rekrutinnen und Rekruten in der militärischen Grundausbildung." },
        { label: "Gemessen", value: "Verletzungen im Vergleich zu keiner Einlage (relatives Risiko, ohne Einlage = 100 %)." },
      ],
      resultsLabel: "Verletzungen, ohne Einlage = 100 %",
      results: [
        { label: "Stützende Einlagen, alle Verletzungen", value: "72 % (55 bis 94)", highlight: true },
        { label: "Stützende Einlagen, Ermüdungsbrüche", value: "59 % (45 bis 76)" },
        { label: "Reine Dämpfungssohlen, alle Verletzungen", value: "92 % (73 bis 116)" },
      ],
      notes: [
        "In Klammern der 95-%-Konfidenzintervall. Bei stützenden Einlagen liegt er ganz unter 100 %, das Ergebnis ist statistisch gesichert. Bei Dämpfungssohlen reicht er über 100 %, ein Effekt ist nicht gesichert.",
      ],
      rating:
        "Viele Studien und ein statistisch gesichertes Ergebnis. Die einzelnen Studien waren aber von niedriger bis mittlerer Qualität, und die Auswertung betrifft nicht speziell Formthotics.",
      citation:
        "Bonanno DR, Landorf KB, Munteanu SE, Murley GS, Menz HB. Effectiveness of foot orthoses and shock-absorbing insoles for the prevention of injury: a systematic review and meta-analysis. Br J Sports Med 2017; 51: 86–96.",
    },
    doi: "https://doi.org/10.1136/bjsports-2016-096671",
  },
]);

export const notProven = typesetContent({
  heading: "Was nicht belegt ist",
  text: "Für chronische Rückenschmerzen fand die einzige randomisierte Studie mit Formthotics keinen Vorteil (Sadler S et al., Musculoskeletal Care 2023). Ob Einlagen Fehltage verringern, hat bisher keine Studie untersucht. Einlagen ersetzen keine ärztliche Diagnose oder Therapie.",
});
