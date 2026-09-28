# Build Brief · Brandlmaier & Rauscher GbR · Einlagen

Single source of truth for the builder. Read these companion files completely before writing code:

- `_work/reference/DESIGN-SPEC.md` – measured design language of the reference site move.one. **Binding** for layout, type scale, spacing, radii, image treatment, component anatomy and motion values. Section 13 (translation guide) is advisory; where it differs from this brief, this brief wins.
- `_work/reference/shots/` and `_work/reference/motion/` – reference screenshots. Look at them (Read tool), do not only read the spec. Start with `home-desktop-slice-01…09.png`, `home-mobile-slice-01…10.png`, `science-desktop-slice-01.png`, `science-desktop-slice-04.png`, `faq-desktop-slice-01.png`, `motion/hover/*-strip.png`, `motion/interact/mobilemenu-1-open.png`.
- `_work/COPY.md` – final German copy for every section. **Binding, use verbatim.**
- `_work/ASSETS.md` – every media file that exists, with suggested use, focal point and credits.
- `_work/research/CONTENT-BRIEF.md` – background on product and studies (only if you need context).

## 1. What we are building

A German marketing site with three pages plus two legal stubs.

| Route | Purpose |
| --- | --- |
| `/` | What the company sells, why it matters, how the fitting works, what research shows, vouchers teaser, founders teaser |
| `/ueber-uns` | The two founders, their qualifications, why they can be trusted |
| `/gutscheine` | How company vouchers work, configurator, order request form, FAQ |
| `/impressum`, `/datenschutz` | Legal stubs with clearly marked placeholders |

The client: two physiotherapists who distribute Formthotics insoles and heat-fit them individually. Companies buy vouchers and hand them to employees, who redeem them for an examination plus fitted insoles.

Audience in order of priority: HR and management of mid-sized and large companies, employees who redeem a voucher, private customers.

### The narrative thread (roter Faden)

The order of sections is an argument. Every section hands over to the next one.

1. We fit insoles that take shape on the foot (hero, intro)
2. Many people spend their working day on their feet, and the heel carries the load (facts, target groups)
3. A moulded insole measurably redistributes that load (interactive pressure map)
4. What the product is and how the fitting works (technology, process)
5. What research shows, including its limits (studies)
6. Companies can pass this on with vouchers (voucher teaser)
7. It is carried out by physiotherapists with proven expertise (founders teaser, trust strip)

## 2. Non-negotiables

- **Reference fidelity.** Layout rhythm, typography, image treatment, component anatomy and motion follow move.one closely. Colors come exclusively from our palette (section 3). When in doubt, open the reference screenshot and match it.
- **Next.js 16.** `AGENTS.md` applies: before using an API (fonts, images, metadata, server actions) read the matching guide in `node_modules/next/dist/docs/`. Known changes: `images.qualities` defaults to `[75]` (configure `[75, 90]` if you use 90), request APIs are async, `middleware` is now `proxy`, Turbopack is the default bundler.
- **Copy.** Use `_work/COPY.md` verbatim, including the source lines under statistics and studies. Do not invent marketing copy. If a text is missing, insert `TODO(copy)` and report it. `[TODO(client)]` values come from `src/config/` and render as neutral placeholders (see section 5).
- **Legal frame (Heilmittelwerbegesetz).** Never add health claims, testimonials, before/after imagery of body parts or promises. Charts show the published numbers only, axes start at zero.
- **No AI-slop look.** No gradient blobs, no glassmorphism as a default surface (glass only for chips and buttons on footage, as in the reference), no emoji, no icon-grid filler, no purple, no lorem ipsum, no sparkles, no drop shadows, no generic "icon in tinted circle" feature rows beyond what the reference itself does.
- **Imagery.** Only files listed in `_work/ASSETS.md`. Never hotlink. Founder portraits are placeholders by design (section 6.2), never generated faces.
- **Accessibility.** Semantic landmarks, one `h1` per page, visible focus states (2 px `steel-400` ring with offset), German alt texts, AA contrast, full keyboard operability of menu, carousel, accordion, slider, toggle and form. All motion respects `prefers-reduced-motion` (content fully visible without animation). Autoplaying video always has a pause control.
- **Performance.** Fonts via `next/font/google`. Images via `next/image` with correct `sizes`. Videos: `muted playsInline loop`, poster always set, sources webm then mp4, play only while in the viewport, only the hero may preload. No layout shift.
- **Responsive.** Designed at 1440, verified at 1280, 1024, 768 and 390. Mobile is a first-class design following section 12 of the design spec (scroll-snap card rows with a peek, bottom-sheet menu, 20 px gutters).
- **Code.** TypeScript strict, server components by default, `"use client"` only where needed, no `any`, no dead code, no commented-out blocks, comments only where the why is not obvious. Central config for everything the client will want to change.

## 3. Design system

### 3.1 Palette (from the client's logo) – define as Tailwind v4 `@theme` tokens

| Token | Hex | Role (reference role in brackets) |
| --- | --- | --- |
| `paper` | `#FAFAF7` | Page canvas (white) |
| `white` | `#FFFFFF` | Inputs and cards that sit on `mist` |
| `mist` | `#EDF2F5` | Soft neutral for cards, panels, chips, placeholders (light grey tiles) |
| `mist-deep` | `#DCE6EC` | Hover and pressed state of `mist` surfaces |
| `ink` | `#0B1726` | Text, icon strokes, primary pills (near-black) |
| `navy-900` | `#0F2034` | Dark sections, copyright bar, dark banner cards |
| `navy-700` | `#1B334B` | Logo navy, secondary dark surface, gradient stop |
| `slate-500` | `#506275` | Muted text on light (captions, labels, sources) |
| `steel-400` | `#749FB5` | Data highlight, focus ring, small details on dark |
| `steel-200` | `#BBD3DF` | Muted text on dark |
| `olive-700` | `#4F5430` | Gradient end stop |
| `olive-600` | `#5E6038` | Accent on light: eyebrow labels, selected states, highlight |
| `olive-500` | `#6A7141` | Chart primary on light, solid order button |
| `olive-300` | `#B8C280` | Accent on dark, chart primary on dark |
| `line` | `rgb(11 23 38 / 0.10)` | Hairlines on light (`rgb(255 255 255 / 0.14)` on dark) |

Brand gradient (announcement bar and footer panel only): `linear-gradient(120deg, #0F2034 0%, #1B334B 45%, #4F5430 100%)`.

Color discipline as in the reference: about 80 % canvas, one ink, `mist` tiles, one dark band per page plus the gradient bookends. Olive is an accent with less than 2 % of the pixels. Olive text below 24 px only in `olive-600` on `paper` for eyebrows (check AA) and never for body text. Overlay behind the mobile menu is `navy-900` at 70 %.

### 3.2 Typography

One family: **Poppins** via `next/font/google`, weights 400, 500, 600, 800, 900, `display: "swap"`, exposed as `--font-sans`.

- **Display voice** (the reference's Parafina Black M): Poppins 900, uppercase, `letter-spacing: -0.055em`, `word-spacing: 0.12em`, `line-height: 0.95`, `text-wrap: balance`, `hyphens: manual`. Use weight 800 below 40 px. Sizes: page and video hero `clamp(2.5rem, 6.2vw, 5.5rem)`, section display H2 `clamp(2.125rem, 5.2vw, 4.5rem)`, stat numeral `clamp(2.5rem, 5.5vw, 4.5rem)` (not uppercased), hero numeral `clamp(3.5rem, 11vw, 7.5rem)`. Line breaks marked with `|` in the copy deck are real `<br>` on desktop and free-flowing on mobile.
- **Poppins voice**: exactly the scale in design spec 2.4. H2 standard `clamp(2rem, 3.368vw, 4rem)` / 1.0 / 600 / −0.03em. Titles on image cards 600 / −0.05em. Lead 20/32. Body 16/25.6. Caption 14/19.6 in `slate-500`. Eyebrow 13 px uppercase, `letter-spacing: .04em`. Nav 16.5 px / 500. Buttons 15.3 px / 500. No uppercase anywhere except display voice and eyebrows.

### 3.3 Shape, spacing, surfaces (design spec section 3)

- Container: full width with gutters 20 px, 36 px from 1024, 48 px from 1280, max content 1820 px.
- Section padding 72 px (54 px below 768). Card grid gap 18 px. H2 to description 32 px (16 px mobile).
- Radii: sections ("sheets") `clamp(1rem, 1.578vw, 1.875rem)` ≈ 22.7 px, cards and media `clamp(.625rem, 1.053vw, 1.25rem)` ≈ 15 px, buttons pill, inputs 6 px, stat cards 18 px.
- No shadows. Hairlines 1 px `line`.
- **Sheets.** Sections stack like sheets of paper: a section that follows full-bleed media or a differently colored section has rounded top corners, and the previous background continues underneath by the radius (spec 8.11). The last sheet before the footer has rounded bottom corners, and the footer is revealed from beneath (spec 8.12, desktop only).

### 3.4 Logo assets (ready in `public/brand/`)

`logo-full.png` (color, for light surfaces), `logo-full-white.png`, `logo-full-duo.png` (pale steel plus light olive, for dark surfaces), and the runner alone as `mark.png`, `mark-white.png`, `mark-duo.png`. App icons exist in `src/app/`.

Header lockup: runner mark 40 px high plus live text in two lines. Line 1 `BRANDLMAIER & RAUSCHER` (600, uppercase, `letter-spacing: .06em`, 13 px), line 2 `Einlagen` (400, `letter-spacing: .18em`, 11 px, sentence case). Over the hero `mark-white.png` with white text, on the solid header `mark.png` with `ink` text. Cross-fade both versions by opacity as the reference does. The footer shows `logo-full-duo.png`.

## 4. Motion system

Libraries: **GSAP 3.15** with ScrollTrigger and SplitText through `@gsap/react`'s `useGSAP` for everything scroll-related and for reveals, **Motion** (`motion/react`) for UI state (menu, accordion, toggle, configurator numbers, tilt). Register GSAP plugins once in a client module. **Native scrolling, no smooth-scroll library** (the reference has none, and that is part of its feel). Remove the unused `lenis` dependency.

Reproduce the reference's motion dialect with its measured values (spec section 8). Easing tokens as CSS variables and GSAP `CustomEase` or equivalent cubic-beziers: reveal `cubic-bezier(.16,1,.3,1)`, ui `cubic-bezier(.3,1,.3,1)`, nav `cubic-bezier(.6,0,.4,1)`, smooth `cubic-bezier(.7,0,.3,1)`, drawer `cubic-bezier(.7,0,.2,1)`.

Primitives in `src/components/motion/`:

| Primitive | Behaviour |
| --- | --- |
| `SplitHeading` | Words rise `translateY(90%) → 0` with fade, 1000 ms, reveal easing, 30 ms per word, once, on first intersection. Headings on full-bleed media start after 250 ms. Re-split on resize, revert on unmount, `aria-label` with the full text |
| `Reveal` | Block rise `32 px → 0` with fade, 1200 ms, reveal easing, once |
| `StaggerGroup` | Children rise 50 px (30 px mobile) with fade, 500 ms, 100 ms apart (50 ms mobile) |
| `ImageReveal` | Media `scale(1.3) → 1` inside its clipped rounded wrapper, 1300 ms, reveal easing |
| `CountUp` | Counts to the target once when visible, at most 1.2 s, ease-out, tabular numbers, German number format. Final value is in the DOM from the start for SEO and reduced motion |
| `Marquee` | CSS keyframes, duplicated track, 46 s linear infinite, pauses for reduced motion |
| `Magnetic` | Pointer-fine only: element follows the pointer by at most ±5 px, springs back (nav items, icon buttons) |
| `VideoLoop` | Poster first, sources injected when near the viewport, plays only in view, cross-fades in over 200 ms, optional 48 px glass pause chip bottom right (40 px mobile) |
| `TiltCard` | Pointer-driven 3D tilt (max 10°) with a moving light sheen, springs back. Touch devices: slow idle float of ±2° |

Component motion (all pointer-fine only, 500 to 600 ms):

- **Pill buttons**: liquid fill. A hidden ellipse (150 % × 200 %, fully round) rises from `translateY(76%)` to `0` on enter and continues to `−76%` on leave, 600 ms. Label color changes over 500 ms with 100 ms delay. Glass pill fills solid white with ink label, outline pill fills solid ink with white label, solid ink pill fills `navy-700`.
- **Text links**: 1 px underline drawn as background gradient. CTA links have the underline and retract it to the right on hover, quiet links draw it in from the left. 500 ms ui easing.
- **Image cards**: media scales to 1.05, arrow rotates 90°, title underline draws in. 500 ms ui easing.
- **Header**: 92 → 81 px, backdrop fades in after `scrollY > headerHeight + 10` with ±10 px hysteresis, 500 ms nav easing, logos cross-fade, 1 px hairline.
- **Footer reveal**: scrubbed `translateY(-50%) → 0` while entering plus a dark overlay that fades out, desktop only.

Signature pieces that go beyond the reference (the client asked for interactivity), all calm and purposeful:

1. **Pressure map** (6.1.5): canvas sensor grid that morphs between two measured states.
2. **Fitting process** (6.1.7): pinned full-bleed media whose four steps advance with scroll. The reference's product page has a comparable sticky scroll stage, so this stays within its language. Total scroll distance 300vh at most. Mobile and reduced motion: no pinning, swipeable step cards.
3. **Study charts** (6.1.8): each chart draws once when its card becomes visible (bars grow from zero in 900 ms, dots fill in sequence, lines draw).
4. **Voucher card** (6.1.9, 6.3.2): `TiltCard`.
5. **Configurator** (6.3.6): numbers roll to their new value (Motion), slider thumb and stepper stay in sync, summary bar on mobile.

Never: smooth-scroll hijacking, bounce easings, looping attention seekers, parallax on text, cursor followers, page transition overlays.

## 5. Architecture

```
src/
  app/
    layout.tsx            fonts, metadata base, <Header/>, <Footer/>
    page.tsx              Home
    ueber-uns/page.tsx
    gutscheine/page.tsx
    gutscheine/actions.ts server action for the order request
    impressum/page.tsx, datenschutz/page.tsx
    sitemap.ts, robots.ts, opengraph-image.jpg (static, provided in public or app)
  components/
    layout/   Header, MobileMenu (bottom sheet), Footer, AnnouncementBar
    motion/   primitives from section 4
    ui/       Button, TextLink, ArrowLink, Eyebrow, Container, Section (sheet logic), Accordion, Carousel, StatNumber, SpecList, SourceLine, Chip
    home/     one component per home section
    about/    one component per about section
    vouchers/ VoucherCard, Configurator, OrderForm, Steps, Faq
    charts/   BarChart, DotArray, LineChart, RatioBars (plain SVG, no chart library)
  config/
    site.ts       company data, nav, contact. Values marked TODO(client) are typed as `string | null`; `null` renders the neutral text „Angabe folgt“ in `slate-500`
    vouchers.ts   placeholder prices and volume tiers, VAT rate, `pricesArePlaceholders: true` (renders the note „Preise in Abstimmung“), delivery formats
  content/
    studies.ts    the five visualised studies (numbers, texts, citation, DOI) and the limits box
    founders.ts   CV data for both founders
    faq.ts, facts.ts, steps.ts
  lib/
    pressure-model.ts   already written: canvas renderer for the pressure map (do not change the numbers)
```

All numbers, prices, contact data and study figures live in `config/` or `content/`, never inline in components.

Order form: a server action validates the fields (company, contact person, email, phone optional, quantity, delivery format, message optional, privacy consent, honeypot) and returns typed field errors for `useActionState`. Delivery is pluggable: if `RESEND_API_KEY` and `ORDER_TO_EMAIL` are set, send the request through Resend's REST API with `fetch`; otherwise log the payload on the server and still return success so the flow can be demonstrated. Success state shows a summary of the request. No third-party scripts, no cookies, no tracking, no external requests at runtime (fonts are self-hosted by `next/font`).

SEO: German metadata per page from the copy deck, `lang="de"`, Open Graph image, JSON-LD `Organization`, sitemap and robots.

## 6. Page specifications

Copy for every block: `_work/COPY.md`, same numbering (1.1 = Home hero, and so on). Media for every block: `_work/ASSETS.md`.

### 6.1 Home

1. **Hero.** Full-bleed video, 722 px tall on desktop (850 px from 1536, 600 px on mobile), overlay `navy-900` at 15 % plus a soft bottom gradient only as far as legibility needs it. Transparent header with the white lockup. Bottom-centered stack: display H1 (two lines, max 900 px), 16 px sub line (max 640 px), glass pill plus underlined text link, pause chip bottom right. No text choreography on load beyond the word reveal of the H1. Matches `home-desktop-slice-01.png`.
2. **Intro split (first sheet).** Rounded top corners over the hero. 50/50, gap 20 px. Left: 4:3 photo (radius 20 px) with a two-line caption overlaid bottom left (Poppins 600, white, like the athlete caption in the reference). Right, centered stack: display H2, product side view cut-out (links to the process section), 20 px lead (max 520 px), arrow link. Matches the "INSOLES PROS ACTUALLY USE" block.
3. **Facts.** Stat trio as in `science-desktop-slice-04.png`: three columns, each a 64 px round `mist` chip with a thin line icon, a display numeral, a 14 px `slate-500` label and a source line in 12 px. Below, the bridging paragraph centered in 22 px (max 760 px).
4. **Who it is for.** Poppins H2 plus one line of text, then four 4:5 image cards (title bottom left, arrow bottom right) in a 4-column grid. On hover or tap a `navy-900` panel at 88 % slides up from the bottom of the card with the fact text (14 px, white), the image zooms to 1.05. The cards are buttons, not links (there is no target page); arrow rotates 90° while the panel is open. Mobile: scroll-snap row with peek. A 12 px source line below the row.
5. **Pressure map (dark band).** `navy-900` sheet with rounded top corners. Two columns from 1024 px. Left: eyebrow in `olive-300`, Poppins H2 white, text in `steel-200`, then the three readouts as a spec list (label left, value right, hairlines): the values animate between the two states in sync with the map. Below them the one-sentence explanation and the small source note. Right: the canvas (use `renderPressureMap` from `src/lib/pressure-model.ts`; about 560 × 640 CSS px on desktop, DPR-aware, re-render on resize; behind it the same canvas blurred 18 px at 45 % opacity for a soft glow), under it a two-state segmented control plus a continuous range slider that drives `t` from 0 to 1, and a small color-scale legend. When the section first becomes visible, `t` animates 0 → 1 over 2.2 s (smooth easing) once, afterwards the user controls it. Keyboard: arrow keys move the slider, the segmented control is a radio group. Reduced motion: start at `t = 1`, no auto animation. Label the figure for screen readers with the three measured values.
6. **Technology.** Header row with Poppins H2 plus text left and an outline pill right (external link, `rel="noopener"`), then four columns: 1:1 media with 15 px radius, 18.5 px/600 title, 16 px text. Matches `home-desktop-slice-04.png`. Mobile 2×2.
7. **Fitting process.** Full-bleed dark media band with rounded top corners, pinned for 300vh on desktop. The background cross-fades between the four step images (each with a slow 1.0 → 1.06 scale while active). Bottom left: eyebrow, H2 white, then the active step (display numeral `01` to `04`, title, text, max 520 px). Right edge: a vertical progress rail with four ticks. The following white sheet slides over it. Mobile and reduced motion: no pin; H2, then a scroll-snap row of four cards (image on top, numeral, title, text).
8. **Studies.** Eyebrow, Poppins H2, 20 px lead. Then a horizontally draggable carousel of five study cards with two 40 px round arrow buttons centered below (the pattern of the reference's review carousel), keyboard operable, scroll-snap based. Card: `mist` background, 18 px radius, about 420 px wide on desktop and 86vw on mobile, padding 28 px: display numeral, 18.5 px/600 title, the chart (fixed 200 px tall area), the statement in 16 px, the limits in 14 px `slate-500` introduced by a small `Grenzen` eyebrow, the source line in 12 px with the DOI as an external quiet link. Charts are plain SVG in `ink`, `slate-500` and one `olive-500` highlight, value labels on the bars, no grid chrome, axes from zero. Under the carousel: the box „Was nicht belegt ist“ as a bordered card (1 px `line`, 22 px radius, padding 32 px, max 860 px, centered).
9. **Voucher teaser.** One large rounded `mist` panel, 50/50. Left, padding 60 px: eyebrow, Poppins H2, text, the EU-OSHA sentence in 14 px `slate-500`, three mini steps as an inline numbered row, primary ink pill. Right: brand-gradient area with the tilting voucher card centered. The voucher card is built in HTML and CSS (aspect 1.586:1, 15 px radius, `navy-900` face with `mark-duo.png`, fine olive hairline frame, the texts from the copy deck, a subtle embossed runner watermark), never an image.
10. **Founders teaser.** Left: eyebrow, H2, text, arrow link. Right: two 4:5 portrait placeholder cards (6.2.5) side by side.
11. **Trust strip.** Three columns with 24 px thin line icons, 18 px/500 title, 13 px text, 1 px vertical dividers. It is the end of the white sheet: rounded bottom corners.
12. **Footer.** Brand gradient panel with rounded corners, revealed from beneath: left `logo-full-duo.png` (max 260 px wide) and the two small legal notes, center two link columns, right the call to action (heading 21 px/600, one line of text, white pill). Below it the `navy-900` copyright bar with the legal links in 11 px.

### 6.2 Über uns

1. Announcement marquee (48 px, brand gradient, 13 px/500 white, items from the copy deck separated by a dot) plus solid header.
2. Typographic hero as in `science-desktop-slice-01.png`: eyebrow, centered display H1 (max 1100 px), 20 px lead (max 760 px), below a wide rounded image (21:9 on desktop, 4:3 on mobile) with `ImageReveal`.
3. Stat trio pattern with four columns (2×2 on mobile). The year values are shown without thousands separator and do not count up from zero (count from the value minus 12).
4. Story: two columns, 4:5 image left (15 px radius), right Poppins H2 and the two paragraphs in 17/27.
5. Founder profiles: two alternating rows. **Portrait placeholder**: 4:5 card, `navy-700` for one founder and `olive-600` for the other, large initials in the display voice (white at 92 %), `mark-white.png` as a watermark at 8 % opacity bottom right, name and role overlaid bottom left like the athlete caption. Add a code comment where the real photo goes and build the component so that passing an `image` prop replaces the placeholder. Next to it: eyebrow (role), H3 30 px/600 name, bio 16 px, chips (`mist`, 14 px, pill), then the timeline: vertical 1 px `line`, 10 px `olive-500` dots, each entry a year label in the display voice at 22 px plus a 16 px text. A `steel-400` progress line fills with scroll (scrubbed), entries stagger in.
6. Principles: three `mist` cards with 18 px radius, display numeral `01` to `03` in `olive-600`, title, text.
7. Closing band: full-bleed dark video with rounded top corners, display H2 white bottom left, text, glass pill. Then trust strip and footer as on Home.

### 6.3 Gutscheine

1. Announcement marquee plus solid header.
2. Hero: two columns. Left eyebrow, display H1, 20 px lead, ink pill (scrolls to the configurator) plus text link (scrolls to the steps). Right: brand-gradient rounded panel (15 px radius, 4:3) with the tilting voucher card.
3. Four steps: a row of four columns, each a 64 px `mist` chip with the step number in the display voice, title, text; a 1 px connector line between the chips draws itself from left to right when visible. Mobile: vertical list with the line on the left.
4. What a voucher includes: two columns. Left H2 and the spec list (20 px thin line icon, label 500, value right-aligned in `slate-500`, hairlines, rows 56 px). Right a `navy-900` banner card (18 px radius, padding 40 px) with the price in the display voice, the unit line and the placeholder note.
5. For employers: stat trio pattern with the three items (the third uses a small text badge `EU-OSHA` in the display voice instead of a number), then the classification paragraph in 17/27 (max 760 px).
6. Configurator and order request (`id="anfrage"`): left a bordered card (1 px `line`, 22 px radius, padding 48 px, 20 px mobile) with numbered groups separated by hairlines: ① quantity (pill stepper 58 px with minus and plus and direct input, range slider 1 to 500, quick picks 10, 25, 50, 100), ② volume tiers as four option chips that show the price per voucher and highlight the active tier (selected state: `olive-600` border, olive tint at 6 %), ③ delivery format as two option cards, ④ company data (inputs 62 px, 6 px radius, `mist` fill, floating labels, two columns from 768 px), ⑤ message, consent checkbox. Right a sticky summary card on `mist` (15 px radius, `top: 105px`): chosen quantity and format, price per voucher, net subtotal, VAT, gross total in the display voice with rolling numbers, the small non-binding note, the solid `olive-500` submit pill (full width, 60 px; this is the one place where olive may be a button) with `ink`-dark hover fill. Mobile: the summary collapses into a fixed bottom bar (white at 97 % with blur, hairline, safe-area padding) with total and button. Inline validation messages from the copy deck, success state replaces the form inside the card.
7. FAQ: dark `navy-900` sheet with rounded top corners (the reference's dark FAQ section on the product page): left a bordered card (white at 14 % border) with the accordion (one open at a time, 300 ms height, plus icon rotating 45°, question 20 px/500), right the contact block from 3.8 with phone and email as large quiet links.
8. Trust strip and footer as on Home.

### 6.4 Legal stubs

Simple typographic pages (max 760 px) with the placeholder structure from the copy deck section 4. Placeholders are rendered visibly as „Angabe folgt“ so nothing fake goes live.

## 7. Definition of done

- `npm run build` and `npm run lint` pass without errors or warnings.
- Every page captured with `_work/tools/shoot.mjs` at desktop and mobile (`--slices --fullpage`, output to `_work/review/self/`). Look at your own screenshots with the Read tool and fix what is off before reporting. Reveal animations make full-page captures unreliable, judge by the slices.
- No console errors, no hydration warnings, no broken images, no horizontal overflow at 390 px, no text clipped by the tight display line-height (check umlauts).
- Report: what was built, deviations from this brief with reasons, open `TODO(copy)` and `TODO(client)` items.
