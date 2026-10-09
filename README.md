# Brandmaier & Rauscher GbR · Einlagen

Marketing-Website (Next.js 16, App Router, Tailwind CSS 4, GSAP, Motion). Drei Seiten (`/`, `/ueber-uns`, `/gutscheine`) plus die rechtlichen Platzhalterseiten `/impressum` und `/datenschutz`.

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build && npm run start
```

Alle Texte liegen in `src/content/`, alle Kundendaten und Preise in `src/config/`. Gestaltungs-Tokens (Farben, Radien, Schrift, Easing) stehen in `src/app/globals.css`.

## Hosting auf Netlify

Die Seite läuft nicht statisch. Die Bestellanfrage auf `/gutscheine` nutzt eine Server Action, deshalb braucht Netlify den Next.js-Adapter. Der wird beim Build automatisch installiert, es ist nichts zu ergänzen.

### Einmalig einrichten

1. Auf [app.netlify.com](https://app.netlify.com) auf **Add new project → Import an existing project** gehen und GitHub verbinden.
2. Das Repository `LukasSehorz/Wowo-Webseite` auswählen. Branch `main`.
3. Build-Befehl und Verzeichnis erkennt Netlify aus `netlify.toml` (`npm run build`, `.next`). Nichts ändern.
4. Unter **Site configuration → Environment variables** die Variablen aus der Tabelle unten eintragen.
5. **Deploy** starten. Jeder weitere Push auf `main` löst automatisch einen neuen Deploy aus.

### Umgebungsvariablen bei Netlify

| Variable | Wert |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Die endgültige Adresse der Seite, ohne Schrägstrich am Ende. Zuerst die Netlify-Adresse (z. B. `https://wowo-webseite.netlify.app`), nach dem Domainumzug die echte Domain |
| `RESEND_API_KEY` | Schlüssel von [resend.com](https://resend.com), damit Bestellanfragen per Mail ankommen |
| `ORDER_TO_EMAIL` | Postfach, das die Anfragen erhält |
| `ORDER_FROM_EMAIL` | Bei Resend verifizierte Absenderadresse |

Ohne die drei Resend-Variablen läuft das Formular im Demo-Modus: Der Absender sieht die Erfolgsmeldung, die Anfrage landet aber nur im Server-Log von Netlify und in keinem Postfach. Vor dem Livegang also unbedingt setzen und einmal testen.

`NEXT_PUBLIC_SITE_URL` wird beim Build eingebacken. Nach einer Änderung dieser Variable muss ein neuer Deploy laufen (**Deploys → Trigger deploy → Clear cache and deploy site**).

### Eigene Domain

Unter **Domain management → Add a domain** die Domain eintragen und die dort angezeigten DNS-Einträge beim Domain-Anbieter hinterlegen. Das HTTPS-Zertifikat stellt Netlify automatisch aus. Danach `NEXT_PUBLIC_SITE_URL` auf die neue Domain ändern und neu deployen.

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
