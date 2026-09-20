# Brandmaier & Rauscher GbR · Einlagen

Marketing-Website (Next.js 16, App Router, Tailwind CSS 4, GSAP, Motion). Drei Seiten (`/`, `/ueber-uns`, `/gutscheine`) plus die rechtlichen Platzhalterseiten `/impressum` und `/datenschutz`.

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build && npm run start
```

Alle Texte liegen in `src/content/`, alle Kundendaten und Preise in `src/config/`. Gestaltungs-Tokens (Farben, Radien, Schrift, Easing) stehen in `src/app/globals.css`.

## Launch-Checkliste

Vor dem Livegang sind diese Punkte offen. Alles, was mit `TODO(client)` markiert ist, rendert bis dahin sichtbar als „Angabe folgt“ oder „Preise in Abstimmung“, damit nichts Erfundenes online geht.

### 1. Umgebungsvariablen

| Variable | Pflicht | Wirkung |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | ja | Canonical-URLs, Sitemap, Open Graph. Ohne sie zeigen alle absoluten URLs auf `http://localhost:3000`; `next build` gibt dann eine Warnung aus. Beispiel: `https://www.beispiel.de` |
| `RESEND_API_KEY` | für den Versand | API-Schlüssel von Resend. Fehlt er, läuft die Bestellanfrage im Demo-Modus: die Anfrage wird nur im Server-Log ausgegeben und der Absender sieht trotzdem die Erfolgsmeldung |
| `ORDER_TO_EMAIL` | für den Versand | Postfach, das die Bestellanfragen erhält |
| `ORDER_FROM_EMAIL` | empfohlen | Absenderadresse, die bei Resend verifiziert ist (sonst `onboarding@resend.dev`) |

Der Demo-Modus schreibt personenbezogene Daten ins Server-Log. Für den Betrieb müssen die drei Versand-Variablen gesetzt sein.

### 2. Angaben des Kunden (`TODO(client)`)

- `src/config/site.ts`: Anschrift, Telefon, E-Mail, Umsatzsteuer-ID, zuständige Aufsichtsbehörde, endgültige Domain.
- `src/config/vouchers.ts`: Preise je Staffel, Staffelgrenzen, Antwortfrist nach einer Anfrage („zwei Werktagen“). `pricesArePlaceholders` auf `false` setzen, sobald die Preise bestätigt sind.
- `src/content/faq.ts`: drei Antworten mit `TODO(client)`-Kommentar (Ort der Anpassung, Dauer eines Termins, Gültigkeit der Gutscheine).

### 3. Rechtliche Prüfung

- `src/content/legal.ts`: Impressum (§ 5 DDG) und Datenschutzerklärung sind Platzhalter. Beide Seiten müssen vor dem Livegang juristisch geprüft und ausgefüllt werden; beide stehen auf `noindex`, bis sie fertig sind.
- Formulierungen zu Studien und Wirkung wurden nach dem Heilmittelwerbegesetz gehalten (`_work/COPY.md`). Änderungen an diesen Texten bitte wieder prüfen lassen.

### 4. Echte Fotos

- Porträts der Gründer: `image` in `src/content/founders.ts` auf den Pfad eines 4:5-Fotos (mindestens 1200 × 1500 px) setzen. Die Platzhalterkarten werden dann automatisch ersetzt.
- Die Stockfotos der Zielgruppenkacheln und des Arbeitgeber-Bildes sind lizenziert (`_work/media/CREDITS.md`), können aber durch eigene Aufnahmen ersetzt werden.

### 5. Letzte Kontrolle

- `npm run lint` und `npm run build` ohne Warnungen.
- Bestellanfrage einmal mit echten Versand-Variablen testen (Eingang im Postfach prüfen).
- `/sitemap.xml` und `/robots.txt` mit der echten Domain aufrufen.
