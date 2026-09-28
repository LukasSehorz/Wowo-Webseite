// Copy deck section 1 (Start). Display headlines are stored in sentence case and
// set in capitals by CSS, so assistive technology reads them as normal words.

import { orderHref, site } from "@/config/site";
import { typesetContent } from "@/lib/format";

export const hero = typesetContent({
  headline: ["Einlagen, die am", "Fuß entstehen"],
  subline:
    "Zwei Physiotherapeuten passen funktionelle Einlagen direkt in Ihrem Schuh an. Unternehmen geben sie per Gutschein an ihre Teams weiter.",
  cta: { label: "Gutscheine für Ihr Team", href: orderHref },
  link: { label: "Was die Forschung zeigt", href: "#forschung" },
  video: {
    base: "/media/videos/hero-walk-crosswalk",
    // 4:5 cut of the same clip for phones (below 768 px)
    portraitBase: "/media/videos/hero-walk-crosswalk-portrait",
    position: "50% 62%",
    pauseLabel: "Video anhalten",
    playLabel: "Video abspielen",
  },
});

export const intro = typesetContent({
  image: {
    src: "/media/images/fitting-hands.jpg",
    alt: "Hände eines Therapeuten schieben eine hellblaue Einlage in einen grauen Sneaker",
  },
  caption: ["Thermische Anpassung", "direkt im eigenen Schuh"],
  headline: ["Vorgeformt.", "Dann angeformt."],
  product: {
    src: "/media/images/product-side.png",
    alt: "Seitenansicht einer hellblauen Formthotics Einlage",
    width: 1859,
    height: 784,
  },
  text: "Formthotics sind vorgeformte Einlagen aus einem thermoformbaren Schaum. Wir erwärmen sie im Schuh, danach formt Ihr Fuß sie unter dem eigenen Körpergewicht aus. Eine harte Kunststoffschale enthalten sie nicht.",
  link: { label: "So läuft die Anpassung ab", href: "#anpassung" },
});

export const factsLabel = "Zahlen";

export type Audience = {
  id: string;
  title: string;
  text: string;
  image: string;
  alt: string;
  position: string;
  /** darkens one photo that is brighter than the rest of the set (1 = unchanged) */
  brightness?: number;
};

export const audiences = typesetContent({
  heading: "Für lange Tage auf den Beinen",
  text: "Wer im Beruf viel steht und geht, belastet seine Füße über Stunden auf hartem Untergrund.",
  items: [
    {
      id: "handel",
      title: "Handel und Verkauf",
      text: "Ab vier Stunden Stehen pro Arbeitstag spricht die EU-Arbeitsschutzagentur von lang andauerndem Stehen. Im Verkauf ist das der Normalfall.",
      image: "/media/images/tile-handel.jpg",
      alt: "Mitarbeiter im Supermarkt mit dunkler Schürze räumt ein Brotregal ein",
      position: "50% 30%",
    },
    {
      id: "pflege",
      title: "Pflege und Medizin",
      text: "In einer australischen Befragung von 304 Pflegekräften berichteten 55 % über Fuß- oder Knöchelbeschwerden innerhalb eines Jahres.",
      image: "/media/images/tile-pflege.jpg",
      alt: "Pflegekraft in blauer Dienstkleidung schiebt einen Inkubator durch einen hellen Klinikflur",
      position: "60% 50%",
      brightness: 0.9,
    },
    {
      id: "logistik",
      title: "Logistik und Zustellung",
      text: "Zustellerinnen und Zusteller kamen in einer britischen Messung auf rund 16.000 Schritte pro Arbeitstag, Büroangestellte auf 6.700.",
      image: "/media/images/tile-logistik.jpg",
      alt: "Zusteller zieht einen Wagen mit Paketen über eine gepflasterte Straße",
      position: "50% 60%",
    },
    {
      id: "sport",
      title: "Sport und Freizeit",
      text: "Beim Laufen wirkt bei jedem Schritt das Zwei- bis Dreifache des Körpergewichts auf den Fuß.",
      image: "/media/images/tile-sport.jpg",
      alt: "Beine eines Läufers im Schritt auf Asphalt neben einer orangefarbenen Fahrbahnmarkierung",
      position: "50% 50%",
    },
  ] satisfies Audience[],
  source: "EU-OSHA 2021 · Reed LF et al., 2014 · Tigbe WW et al., 2011 · Nilsson J, Thorstensson A, 1989",
});

export type PressureReadout = {
  id: string;
  label: string;
  without: number;
  with: number;
  decimals: number;
  unit: string;
  change: string;
};

export const pressure = typesetContent({
  id: "druckverteilung",
  eyebrow: "Messbar",
  heading: "Wo der Druck entsteht und wohin er sich verteilt",
  text: "Forschende der La Trobe University in Melbourne haben den Druck unter der Fußsohle beim Gehen in Arbeitsstiefeln gemessen. Mit der angeformten Einlage lag der Spitzendruck unter der Ferse 19 % niedriger als im Stiefel allein. Eine flache Sohle aus demselben Material veränderte ihn nicht.",
  states: { without: "Stiefel allein", with: "Mit angeformter Einlage" },
  toggleLabel: "Messung wählen",
  sliderLabel: "Übergang zwischen beiden Messungen",
  readouts: [
    {
      id: "heel",
      label: "Spitzendruck unter der Ferse",
      without: 214,
      with: 173,
      decimals: 0,
      unit: "kPa",
      change: "−19 %",
    },
    {
      id: "arch",
      label: "Kontaktfläche am inneren Fußgewölbe",
      without: 4.0,
      with: 14.7,
      decimals: 1,
      unit: "cm²",
      change: "+368 %",
    },
    {
      id: "tibia",
      label: "Stoßbelastung am Schienbein",
      without: 2.22,
      with: 2.07,
      decimals: 2,
      unit: "g",
      change: "−6,8 %",
    },
  ] satisfies PressureReadout[],
  explanation:
    "Der Effekt entsteht durch Verteilung. Das Fußgewölbe liegt auf und trägt einen Teil der Last, die sonst die Ferse aufnimmt.",
  legend: { low: "niedriger Druck", high: "hoher Druck" },
  note: "Schematische Darstellung auf Basis der Messwerte. Gemessen wurde Druck, nicht Schmerz. 28 gesunde Erwachsene, eine Messung. Unter der Großzehe stieg der Druck leicht an (+9 %). Bonanno DR et al., Scientific Reports 2019; 9: 1688. Untersucht wurde die konturierte Einlage von Foot Science International (Formthotics).",
  figureLabel: "Schematische Druckverteilung unter beiden Fußsohlen",
});

export const technology = typesetContent({
  heading: "Was eine funktionelle Einlage ausmacht",
  text: "Formthotics werden seit 1981 in Christchurch, Neuseeland, entwickelt und gefertigt. Vier Eigenschaften unterscheiden sie von einer einfachen Polstersohle.",
  button: { label: "Zum Hersteller", href: site.manufacturerUrl },
  features: [
    {
      title: "Thermoformbar",
      text: "Der Formax-Schaum wird bei niedriger Temperatur formbar und behält nach dem Abkühlen die Form Ihres Fußes.",
      image: "/media/images/feature-thermoformbar.jpg",
      alt: "Zwei Hände biegen eine erwärmte hellblaue Einlage",
    },
    {
      title: "Aus dem Block gefräst",
      text: "Jede Einlage wird dreidimensional aus einem Schaumblock gefräst. Das ergibt eine gleichmäßige Dichte, ganz ohne harte Schale.",
      image: "/media/images/feature-gefraest.jpg",
      alt: "Nahaufnahme der gefrästen Kontur neben einem rohen Schaumblock",
    },
    {
      title: "Tiefe Fersenschale",
      text: "Sie umschließt die Ferse und verteilt den Druck vom Fersenbein auf eine größere Fläche.",
      image: "/media/images/feature-fersenschale.jpg",
      alt: "Blick von hinten in die tiefe Fersenschale einer hellblauen Einlage",
    },
    {
      title: "Fein justierbar",
      text: "Keile, Pelotten und Fersenerhöhungen ergänzen die Einlage, wenn der Befund es erfordert. Der Schaum lässt sich später erneut anformen.",
      image: "/media/images/feature-justierbar.jpg",
      alt: "Unterseite einer Einlage mit Keilen, Pelotte und Fersenerhöhung",
    },
  ],
});

export const voucherTeaser = typesetContent({
  eyebrow: "Für Unternehmen",
  heading: "Gutscheine für Ihr Team",
  text: "Sie bestellen Gutscheine in der gewünschten Anzahl und geben sie an Ihre Mitarbeitenden weiter. Jeder Gutschein umfasst die Untersuchung, ein Paar Einlagen und die thermische Anpassung.",
  addition:
    "Die EU-Arbeitsschutzagentur nennt individuell angepasste Einlagen als eine Maßnahme bei Steharbeit, an deren Kosten sich Arbeitgeber beteiligen können, wenn sie ärztlich oder physiotherapeutisch empfohlen sind (EU-OSHA 2021).",
  steps: ["Anzahl wählen", "Gutscheine verteilen", "Termin und Anpassung"],
  button: { label: "Gutscheine anfragen", href: orderHref },
});

export const foundersTeaser = typesetContent({
  eyebrow: "Über uns",
  heading: "Angepasst von Physiotherapeuten",
  text: "Sebastian Rauscher passt seit 2018 funktionelle Einlagen an und hat sechs Jahre lang Therapeutinnen und Therapeuten darin ausgebildet. Wolfgang Brandlmaier betreut seit 2021 den Regionalligisten TSV Buchbach und bringt Erfahrung aus dem betrieblichen Gesundheitsmanagement mit.",
  link: { label: "Mehr über uns", href: "/ueber-uns" },
});
