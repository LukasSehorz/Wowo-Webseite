// Copy deck section 2 (Über uns). Display headlines are stored in sentence case and set in capitals by CSS.

import { orderHref } from "@/config/site";
import { typesetContent } from "@/lib/format";

export const aboutHero = typesetContent({
  eyebrow: "Über uns",
  headline: ["Erst der Befund,", "dann die Einlage"],
  text: "Hinter Brandmaier & Rauscher stehen zwei Physiotherapeuten mit zusammen 20 Jahren Berufserfahrung. Wir passen Einlagen so an, wie wir behandeln. Am Anfang steht die Untersuchung.",
  image: {
    src: "/media/images/about-hero.jpg",
    alt: "Praxisraum mit hellblauen Einlagen, Sneakern und Warmluftgerät auf einer Holzbank, im Hintergrund arbeitet ein Therapeut an der Behandlungsliege",
    // keeps the bench with insoles and the therapist in the 4:3 crop on small screens
    position: "62% 50%",
  },
});

export const aboutStatsLabel = "Zahlen";

export const story = typesetContent({
  heading: "Aus der Praxis entstanden",
  paragraphs: [
    "2018 gründete Sebastian Rauscher die erste GbR für funktionelle Schuheinlagen. Im selben Jahr kam er in das Lehrteam der Fortbildungsakademie Markus Pschick (FAMP). Dort unterrichtete er bis 2024 Manuelle Therapie und die Versorgung mit funktionellen Einlagen.",
    "2026 stieg Wolfgang Brandmaier ein. Er arbeitet seit 2021 mit den Spielern des Regionalligisten TSV Buchbach und kennt aus dem betrieblichen Gesundheitsmanagement die Belastungen am Arbeitsplatz. Seitdem führen beide das Unternehmen gemeinsam.",
  ],
  image: {
    src: "/media/images/about-detail.jpg",
    alt: "Hände eines Therapeuten untersuchen die Fußsohle einer Person auf der Behandlungsliege",
    position: "50% 55%",
  },
});

export const profiles = {
  qualificationsLabel: "Qualifikationen",
  timelineLabel: "Werdegang",
};

export const principles = typesetContent({
  heading: "Wie wir arbeiten",
  items: [
    {
      title: "Untersuchung zuerst",
      text: "Wir prüfen Fußform, Beweglichkeit und Gangbild, bevor wir ein Modell auswählen. Nicht jeder Fuß braucht eine Einlage, und nicht jeder Schuh eignet sich dafür.",
    },
    {
      title: "Einlage und Übung",
      text: "Eine Einlage ersetzt kein Training. Wo es sinnvoll ist, kombinieren wir sie mit aktiven Übungen für Fuß und Wade.",
    },
    {
      title: "Nachkontrolle",
      text: "Drückt die Einlage oder wechseln Sie den Schuh, formen wir sie erneut an. Nach sechs bis zwölf Monaten empfehlen wir eine Kontrolle.",
    },
  ],
});

export const closing = typesetContent({
  headline: ["Gutscheine", "für Ihr Team"],
  text: "Sie möchten Ihren Mitarbeitenden eine Untersuchung und angepasste Einlagen ermöglichen. Wir senden Ihnen ein Angebot.",
  button: { label: "Zu den Gutscheinen", href: orderHref },
  video: {
    base: "/media/videos/walk-bridge-teal",
    position: "50% 40%",
    pauseLabel: "Video anhalten",
    playLabel: "Video abspielen",
  },
});
