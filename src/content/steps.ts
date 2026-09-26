// Step sequences (copy deck 1.7 and 3.3).

import { typesetContent } from "@/lib/format";

export type FittingStep = {
  id: string;
  title: string;
  text: string;
  image: { src: string; alt: string; position: string };
};

export const fitting = typesetContent({
  id: "anpassung",
  eyebrow: "Die Anpassung",
  heading: "Ein Termin. Vier Schritte.",
  stepLabel: "Schritt",
  steps: [
    {
      id: "untersuchen",
      title: "Untersuchen",
      text: "Wir prüfen Fußform, Beweglichkeit, Beinachse und Gangbild und sehen uns Ihre Schuhe an. Danach wählen wir Modell und Härtegrad.",
      image: {
        src: "/media/images/step-1-untersuchen.jpg",
        alt: "Ein Therapeut kniet am Boden und tastet die Ferse einer stehenden Person ab",
        position: "62% 50%",
      },
    },
    {
      id: "erwaermen",
      title: "Erwärmen",
      text: "Die Einlagen liegen im Schuh, ein Warmluftgerät erwärmt beides zusammen. Der Heizzyklus dauert drei Minuten.",
      image: {
        src: "/media/images/step-2-erwaermen.jpg",
        alt: "Zwei Sportschuhe mit hellblauen Einlagen stecken kopfüber auf einem Warmluftgerät, ein Finger drückt den Startknopf",
        position: "64% 50%",
      },
    },
    {
      id: "anformen",
      title: "Anformen",
      text: "Sie ziehen die warmen Schuhe an und stehen 30 Sekunden mit leicht gebeugten Knien. Beim Abkühlen übernimmt der Schaum die Form von Fuß und Schuh.",
      image: {
        src: "/media/images/step-3-anformen.jpg",
        alt: "Eine Person steht mit leicht gebeugten Knien in Sneakern, der Therapeut führt das Knie",
        position: "60% 50%",
      },
    },
    {
      id: "kontrollieren",
      title: "Kontrollieren",
      text: "Ein kurzer Gang zeigt, ob alles sitzt. Danach können Sie die Einlagen direkt tragen. Drückt etwas, passen wir nach.",
      image: {
        src: "/media/images/step-4-kontrollieren.jpg",
        alt: "Eine Person geht in Sneakern den Praxisflur entlang, der Therapeut beobachtet den Gang",
        position: "50% 50%",
      },
    },
  ] satisfies FittingStep[],
});

export type VoucherStep = { title: string; text: string };

export const voucherSteps = typesetContent({
  heading: "In vier Schritten zum Gutschein",
  steps: [
    {
      title: "Anzahl festlegen",
      text: "Sie wählen die Zahl der Gutscheine und senden uns Ihre Bestellanfrage.",
    },
    {
      title: "Angebot und Rechnung",
      text: "Wir bestätigen Menge und Preis schriftlich. Die Gutscheine erhalten Sie nach der Rechnungsstellung.",
    },
    {
      title: "Gutscheine verteilen",
      text: "Jeder Gutschein trägt einen eigenen Code. Sie erhalten die Gutscheine digital als PDF und geben sie an Ihre Mitarbeitenden weiter.",
    },
    {
      title: "Termin und Anpassung",
      text: "Ihre Mitarbeitenden vereinbaren einen Termin. Untersuchung und Anpassung finden am selben Tag statt.",
    },
  ] satisfies VoucherStep[],
});
