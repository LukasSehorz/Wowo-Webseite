# DESIGN-SPEC — reference analysis of move.one

Builder-ready specification of the design language of https://move.one/ (Shopify store, performance insoles),
measured on 2026-09-17 with headless Chromium (Playwright) at **desktop 1440×900** and **mobile 390×844 (DPR 2)**.

All numbers below come from `getComputedStyle` / `getBoundingClientRect` / `document.getAnimations()` via
`page.evaluate`, or from the site's own CSS/JS source — not from eyeballing screenshots. Where a value is a fluid
`clamp()`, the source formula **and** the resolved px value at 1440 / 390 are given.

Pages analysed

| Key | URL | Why |
|---|---|---|
| `home` | `/` | main reference |
| `science` | `/pages/the-science-2026` | technology / studies / stat blocks / accordion |
| `story` | `/pages/plantar-fasciitis` | closest thing to an "our story" page (origin-story block, founder portrait, benefits, FAQ). **move.one has no about page** (`/pages/about`, `/about-us`, `/our-story` → 404) |
| `product` | `/products/game-day-pro-performance-insoles` | buy box, scroll-scrubbed explainer, dark FAQ + form, reviews |
| `faq` | `/pages/move-faqs` | accordion card + sticky contact form (model for our FAQ and order form) |
| `landing` | `/pages/move-athletes` | sport landing page: alternating rows, mosaic gallery, FAQ, banner |
| `teamsales`, `painrelief`, `finder` | B2B contact form, health page, 2-step wizard | secondary evidence |

Evidence folders (all under `_work/reference/`): `shots/` (viewport slices + full pages), `motion/` (scroll videos,
contact sheets, header/footer/reveal frames), `motion/hover/` (before/mid/after), `motion/interact/` (dropdown,
mobile menu, accordion, carousel, scroll-scrub, wizard), `fonts/` (font comparison), `data/` (raw JSON measurements,
downloaded theme CSS/JS).

---

## 0. TL;DR for the builder

1. **White canvas, near-black ink, one loud accent.** 90 % of the page is `#fff` + `rgb(31,29,30)`. Colour comes from
   photography/video and from a single accent that is used only for tiny things (squiggle underline, gradient word,
   progress bar, overlay tint).
2. **Two type voices.** A heavy, tight, ALL-CAPS geometric display face (Parafina Black M — commercial) for the
   "shouting" lines, and Poppins 400/500/600 for everything else. Headings are Poppins 600 with −0.03 em tracking and
   line-height 1.0.
3. **Everything is rounded, consistently.** Cards/images 15 px (10 px mobile), sections 22.7 px top corners (16 px
   mobile), buttons full pills (60 px), inputs 6 px.
4. **Sections overlap like sheets of paper.** Each new section has rounded top corners and the previous section's
   background/video continues *underneath* those corners. The footer is revealed from beneath the last sheet.
5. **Motion is calm and expensive-feeling:** word-by-word heading rise (1000 ms, `cubic-bezier(.16,1,.3,1)`, 30 ms
   stagger), card stagger (500 ms, 100 ms apart), liquid-fill pill buttons (600 ms), image zoom 1.05 (500 ms).
   No smooth-scroll hijacking, no parallax on content.
6. **Video everywhere it matters:** full-bleed hero loop (separate 16:9 and 4:5 files), tiny 1:1 looping 3-D icon
   videos instead of static icons, contained 16:9 story video, 9:16 UGC carousel.

---

## 1. Technology detected

| Thing | Finding |
|---|---|
| Platform / theme | Shopify, theme **"Concept" v5.3.1** (RoarTheme), heavily customised (`msci-*`, `if-*`, `science-scroll` custom sections) |
| Architecture | ~110 native **Web Components** (`animate-element`, `split-words`, `motion-list`, `hover-button`, `magnet-link`, `sticky-header`, `footer-parallax`, `video-media`, `accordion-details`, `highlighted-text`, `marquee-element`, `slider-element` …) |
| Animation library | **Motion One** (global `Motion`: `animate`, `inView`, `scroll`, `stagger`, `spring`, `timeline`) → runs on the Web Animations API. **No GSAP, no ScrollTrigger, no Lenis/Locomotive, no AOS, no Swiper.** Scrolling is 100 % native. |
| Text splitting | **Splitting.js** (`Splitting({by:'words'})`, classes `words splitting`, `--word-index`) |
| Sliders | **Flickity** (announcement fade-slider, desktop carousels); mobile product/collection rows are **pure CSS scroll-snap**; UGC video carousel is the "Moast" app using **Embla Carousel** (shadow DOM) |
| Other | Alpine.js 3 (jsDelivr) for custom wizards, instant.page (prefetch on hover), PhotoSwipe (gallery lightbox), Klaviyo reviews, canvas image-sequence scrubber (`science-scroll.js`, own code, 3.4 kB) |
| Popups (blocked in all captures) | Alia popup app: `[id^="alia-root"]`, close = `[aria-label="Close popup"]`, appears ≈3–4 s after load. Theme cookie banner: `cookie-banner#CookieBanner`, accept = `button[name="accept"]`, appears after 5 s (`data-delay="5"`). Usable with `shoot.mjs --dismiss`. Headless Chromium is **not** blocked (HTTP 200) when a realistic UA is sent. |

Own scripts (all in `_work/tools/`, prefix `ref-`; `shoot.mjs` untouched): `ref-lib.mjs` (session, popup/tracker
blocking), `ref-capture.mjs` (slices + full page), `ref-measure.mjs` (computed styles → JSON), `ref-mechanics.mjs`
(header/reveal/parallax probes), `ref-video.mjs` + `ref-frames.sh` (scroll video → contact sheets), `ref-hover.mjs`,
`ref-interact.mjs`, `ref-fontcompare*.mjs`, `ref-cssq.mjs` (media-query-aware CSS grep), `ref-recon.mjs`, `ref-popups.mjs`.

---

## 2. Fonts

### 2.1 What the site uses

| Role | Family | Source | Weights actually loaded |
|---|---|---|---|
| Body, UI, nav, buttons, most headings | **Poppins** (Google/Indian Type Foundry, OFL — free) | Shopify font CDN, `font-display: swap` | 400, 500, 600, 700 (+ 400i/700i declared, never loaded) |
| Display / "shout" lines, big numerals | **Parafina Black M** (Dharma Type — **commercial**) | self-hosted `sci-parafina2.woff2`, declared `font-weight: normal` | one style (Black, width "M") |

Important implementation detail: on the **homepage the Parafina headlines are raster images**, not text
(hero: `upgrade_your_sneakers_instantly….png`, 2216×385 source, shown at max 800 px desktop / 350 px mobile;
section 2: `Frame_13.jpg`, 1532×400 source, shown at 530×138). Only the newer custom pages (`science`, `story`)
load Parafina as a real web font. → **Do not copy this; use live text** (SEO, a11y, German line breaks).

`GTStandard-M` also shows up in `document.fonts`, but it belongs to Shopify's login web component, not to the design.

Theme font tokens (from the inline `:root`):
`--font-heading-family: Poppins; --font-heading-weight: 600; --font-heading-line-height: 1; --font-heading-letter-spacing: -0.03em;`
`--font-body-weight: 400; --font-body-line-height: 1.2` (paragraphs use the `leading-normal` utility = **1.6**);
`--font-navigation-weight: 500; --font-button-weight: 500`.

### 2.2 Free replacement for Parafina Black M — measured

Method: same string "THE MOVE PLATFORM", 80 px, uppercase, tracking 0; text width measured with a DOM Range on the live
site (Parafina = **709 px**) and for 28 Google Fonts candidates (`fonts/font-compare.png`, `fonts/font-compare.json`);
second pass with tracking compensation (`fonts/font-compare-tracked.png`).

| Candidate | Width @80 px | Ratio to Parafina | Verdict |
|---|---|---|---|
| **Poppins 900** | 868 | 1.22 → **1.11 with −0.06 em** | **Closest in character**: same round O/C/D, vertical-sided M, straight-leg R, same stroke colour. Needs tight tracking. |
| Poppins 800 | 858 | 1.21 → 1.10 with −0.055 em | same, slightly lighter — better below 40 px |
| Outfit 900 | 876 | 1.24 → 1.12 with −0.06 em | very close, a touch lighter and softer |
| Figtree 900 | 859 | 1.21 → 1.11 with −0.055 em | close, more humanist |
| League Spartan 900 | 813 | 1.15 → 1.09 with −0.03 em | narrower (good for long German words) but splayed M, small caps-height (needs +8 % size), reads lighter |
| Barlow 900 | 767 | 1.08 | closest width, but DIN-like/squarish — loses the geometric roundness |
| Anton 400 | 619 | 0.87 | too condensed, different genre |

**Recommendation**

```css
/* display voice — replaces Parafina Black M */
font-family: "Poppins", system-ui, sans-serif;
font-weight: 900;               /* 800 for sizes < 40px */
text-transform: uppercase;
letter-spacing: -0.055em;       /* −0.05 … −0.06em */
word-spacing: 0.12em;           /* tight tracking collapses word gaps – open them again */
line-height: 0.95;              /* reference uses 0.82–0.9; German Ä/Ö/Ü collide below ~0.92 */
```

Why Poppins and not a "new" face: (a) it is optically the nearest match, (b) Parafina and Poppins are both
geometric — the reference pairs them precisely because they harmonise, (c) one family = one font request chain,
(d) full German coverage (ÄÖÜ ß „ “ – €). Load **400, 500, 600, 800, 900** only. If headlines get too wide with long
German compounds, fall back to **League Spartan 800/900** (`letter-spacing:-0.035em`, `font-size × 1.08`) for the
display voice only. Use `hyphens: manual` + `&shy;` in display lines (never auto-hyphenate a 90 px headline).

### 2.3 Type scale — display voice (Parafina → Poppins 900 uppercase)

| Role | Source formula | Desktop 1440 | Mobile 390 | Notes |
|---|---|---|---|---|
| Page hero H1 (science) | `clamp(2.5rem, 6.5vw, 5.5rem)` / lh .82 | **88 px / 72.2 px** | **40 / 32.8** | centered, container 1100 px, ls 0, mb 8 px |
| Video hero H1 (story) | theme `title-xl`: `clamp(5rem, 6.737vw, 8rem)` ≥1024; `clamp(3rem, 7.813vw, 5rem)` below / lh .9 | **97 / 87.3** | **48 / 43.2** | white on video, centered |
| Homepage hero (image!) | PNG 800×139 (2 lines) | cap height ≈ 62 px ≙ ~84 px font | 350×61 | bottom-centered in hero |
| Section H2 display | `clamp(2.25rem, 6vw, 5rem)` / lh .82 | **80 / 65.6** | **36 / 29.5** | centered, mb 16–40 px |
| Dark banner H2 | `clamp(1.75rem, 4vw, 3.25rem)` / lh 1 | **52 / 52** | **28 / 28** | white on near-black card |
| Stat numeral | `clamp(2.5rem, 5.5vw, 4.5rem)` / lh 1 | **72 / 72** | **40 / 40** | not uppercased ("85%", "180LB") |
| Hero stat numeral | `clamp(3.5rem, 11vw, 7.5rem)` / lh .9 | **120 / 108** | **56 / 50.4** | "14 tons" |
| Closing shout line | `clamp(1.25rem, 2.6vw, 2rem)` / lh 1 | **32 / 32** | **20 / 20** | uppercase, centered |

All display text: weight 400 in the font file (it *is* the Black cut), `letter-spacing: 0`, colour `rgb(31,29,30)` or `#fff`.

### 2.4 Type scale — Poppins voice

| Role | Source | Desktop 1440 | Mobile 390 | Weight / tracking / transform |
|---|---|---|---|---|
| H1/H2 large (`title-lg`: product sections, FAQ page title) | `clamp(3rem, 4.73vw, 5.625rem)` ≥1024; `clamp(2.5rem, 3.368vw, 4rem)` below | **68.1 px**, lh 1.25 (inline) or 1.0 | **40 px**, lh 1.25 / 1.0 | 600, **−0.04 em**, none |
| H2 standard (`title-md`: all home section titles) | `clamp(2rem, 3.368vw, 4rem)` | **48.5 / 48.5** (lh 1) | **32 / 32** | 600, **−0.03 em** |
| Product title (PDP) | — | 40 / 40 | 36 / 45 | 600, −0.03 em |
| H3 (drawer titles, "Didn't find your answer?") | `text-3xl`/`text-2xl` | 30 / 30 | 24 / 24 | 600, −0.025 em |
| Title on image cards | `clamp(1.25rem, .4966rem + 1.1818vw, 1.875rem)` | **24.96 / 31.2** | **20 / 25** | 600, **−0.05 em** |
| Small heading (feature/column title) | `clamp(1rem, .873rem + .3175vw, 1.25rem)` | **18.54 / 23.18** | **16 / 20** | 600, −0.025 em |
| Product card title / price | same fluid size | 18.54 / 23.18 | 16 / 20 | title 700, price 400 |
| FAQ question | `text-base lg:text-lg xl:text-xl` | **20 / 25** | **16 / 20** | **500**, 0 |
| Icon-row title (trust strip) | — | 18 / 22.5 | 18 / 22.5 | 500 |
| Footer newsletter heading | — | 21.08 / 21.08 | 20 / 20 | 600 (500 mobile) |
| Lead paragraph | — | **20 / 32** (1.6); centered leads **22 / 33** (1.5) and 20 / 31 (1.55) | 16–17 / 25.5–26.4 | 400 |
| Body | — | **16 / 25.6** (1.6); long-form 17 / 27.2 | 16 / 25.6 | 400, colour `rgb(31,29,30)` |
| Hero subline | `clamp(.875rem, .8115rem + .1587vw, 1rem)` | 15.27 / 24.43 | 14 / 22.4 | 400, white |
| Sub-heading under H2 | — | 21.08 / 26.35 | 16 / 20 | 400 |
| Caption / stat label | — | 14 / 19.6 (1.4), 15 / 20.25 | same | 400, **`#6b6b6b`** |
| Tiny (spec rows) | — | 12 / 12 | 12–14 | label 500, value 400 |
| Rating pill | — | 11 / 11 | 11 | 400 |
| **Eyebrow / label** | — | **13 px, uppercase, ls .04 em, `#6b6b6b`**; variant 15 px ls .02 em; wizard 13 px ls .08 em `rgba(0,0,0,.55)` | same | 400 |
| **Nav link** | `clamp(.875rem, .748rem + .3174vw, 1.125rem)` | **16.54 px**, row height 48 px | — (drawer: 24 / 24, 600, −0.025 em) | **500**, 0, no transform |
| **Button** | `clamp(.875rem, .8115rem + .1587vw, 1rem)` | **15.27 px**, lh 1 | **14 px** (small: 12 px) | **500**, 0, no transform |
| Announcement bar | — | 13 / 16.25 | 13 / 16.25 | 500, white |
| Footer links | `clamp(.875rem, .748rem + .3174vw, 1.125rem)` | 16.54 / 20.67 | 14–16 | 400, white |
| Legal links / copyright | — | 11.2 px / 14 px | 11.2 / 13 | 400 |

Observations: no uppercase anywhere in the Poppins voice except eyebrows; no letter-spacing on body/nav/buttons;
headings always negative tracking that *increases* with size (−0.025 → −0.03 → −0.04 → −0.05 em on image cards).
Heading margin is handled by flex `gap` (16 px mobile / 32 px desktop between H2 and description), not by margins.

---

## 3. Layout system

### 3.1 Container, gutters, spacing (theme tokens)

| Token | Formula | 1440 | 390 |
|---|---|---|---|
| `--page-width` (max content) | `1820px` | content = **1344 px** | 350 px |
| `--page-padding` (side gutter) | 20 px (< 1024) → 36 px (≥ 1024) → **48 px** (≥ 1280) → `max(48px, 50vw − 910px)` (≥ 1536, i.e. the column stops growing at 1820 px) | **48 px** | **20 px** |
| Section vertical padding | per section `--section-padding-top/bottom`, ×0.75 below 768 px | **72 / 72 px** (standard) | **54 / 54 px** |
| Section padding variants | trust strip 20/40, review title 32/0, PDP 40/72 and 48/72, dark FAQ 40/40, full-bleed media 0/0 | | ×0.75 |
| Card grid gap | `clamp(…)` | **18.19 px** (4-up and 3-up grids) | **32 px** (slider gap) |
| Feature-column gap | — | **50.4 px** | 16 px col / 40 px row (2×2) |
| Promo 2-up gap | `gap-4 md:gap-6` | 24 px | 16 px (stacked) |
| H2 → description gap | `gap-4 lg:gap-8` | 32 px | 16 px |
| Title block → grid | margin-bottom | 36.4 px | 32 px |
| Section corner radius `--border-radius` | `clamp(1rem, 1.578vw, 1.875rem)` | **22.72 px** | **16 px** |
| Card / block radius `--rounded-card` | `clamp(.625rem, 1.053vw, 1.25rem)` | **15.16 px** | **10 px** |
| Button radius | `3.75rem` | 60 px (= pill) | 60 px |
| Input radius | `.375rem` | 6 px | 6 px |
| Custom pages (science/story) | own containers: **1100** (hero), **1200** (text+image, physics, foam), **1280** (stat banner, line-up), **820** (impact text), **760** (centered lead), accordion **1000**; side padding 20 px (16 px ≤640); section padding 48–64 px top/bottom (40–44 px mobile); card radius **18 px**, photo radius **12 px** | | |

Spacing scale is a 4 px system (`--sp-1` = 4 px … `--sp-12` = 48 px, `--sp-16` = 64, `--sp-18` = 72, `--sp-24` = 96).
Breakpoints used by the theme: **768, 1024, 1280, 1536**.

### 3.2 Grid patterns (homepage, measured)

| Section | Desktop | Mobile |
|---|---|---|
| Hero | full-bleed, **722.5 px** tall (`552.5` <768, `722.5` ≥768, `850` ≥1536); content bottom-centered, box max-width 64 rem | 600 px tall, portrait video, content bottom-centered |
| Split feature (sec. 2) | 2 cols 50/50, gap 20 px: left image 662×496 (4:3, r 20 px), right centered stack (headline image 530 px, product cut-out 662 px, 20 px lead, arrow link) | stacked: image (r 10 px) → headline → product → lead → link |
| Product line-up | **4 cols × 322 px**, gap 18 px; card = 1:1 image + title/price row + 4 spec rows (12 px, hairline dividers) → 558 px tall | **horizontal snap slider**, card 289 px (74 % of viewport), gap 32 px, next card peeks 69 px |
| Sport cards | 4 cols × 322 px, **4:5** images (322×403), title overlaid bottom-left, arrow bottom-right | same slider, 289×361 |
| Feature columns | header row (H2 + text left, outline button right), then **4 cols × 298 px**, gap 50 px, 1:1 media (298 px) + title + text | **2×2**, 167 px cols, gap 16/40 |
| Video banner | full-bleed 1440×638, rounded top 22.7 px, text bottom-left (H2 640 px wide, 2 lines) + button | 390×488, 3-line H2 |
| Category cards | **3 cols × 436 px**, 4:5 (436×545), title+subline overlaid | slider 289×361 |
| Promo 2-up | **2 cols × 660 px**, 16:9 (660×371), gap 24 | stacked 350×197, gap 16 |
| Image-with-text card | one rounded card (r 15 px, bg `#f2f1f1`-like light grey) 1344×425: 50 % text (padding 60 px) / 50 % image | stacked inside the card |
| Review strip | left-aligned H2 + subline, then 9:16 video cards 300×533, gap 24, r 20 px, arrows centered below | same, swipe |
| Trust strip | 3 cols × 448 px, icon 24 px + title + 13 px text, 1 px vertical dividers | stacked, centered |
| Footer | 2 × 672 px: left = logo + socials + 2 link columns; right = newsletter (input 430×62) — separated by a 1 px vertical rule | stacked, 745 px tall |

---

## 4. Header & announcement bar

| Property | Desktop | Mobile |
|---|---|---|
| Structure | CSS grid `314.7px 634.6px 314.7px` → logo left, nav centered, icons right (`header--left-center`), full-width container, side padding 48 px | logo left, icons right: search, cart, hamburger (each 44×44 hit area, 20 px icons, hamburger 24 px); padding 16.5 px 20 px |
| Height | **92 px** at top (padding 22 px) → **81 px** once scrolled (padding 16.5 px) | **77 px**, constant |
| Logo | SVG word-mark 115×24 px; two stacked `<img>` (white + black) cross-faded by opacity | 90×19 px |
| Position | `position: sticky; top: 0; z-index: 20`, `data-sticky-type="always"` → **always visible**, never hides on scroll-down (the theme's hide-on-scroll mode is off) | same |
| Over hero | **transparent**: header is `position:absolute` over the first section when that section has `allow-transparent-header`; text/icons/logo white; no background | same |
| Scrolled state | trigger: `scrollY > headerHeight + 10 px` (≈102 px), hysteresis ±10 px → class `header-scrolled`: header becomes `position:fixed`, a white `::before` layer fades in (`opacity 0→1`), colour switches white → `rgb(31,29,30)`, logos cross-fade, padding shrinks 22 → 16.5 px | same switch, no shrink |
| Transition | `opacity/transform/padding .5s cubic-bezier(.6,0,.4,1)`, backdrop has an extra **.1 s delay**. Measured: at 160 ms opacity .58, fully white at ≈320–400 ms | same |
| Hairline | 1 px `#e6e5e5` (= ink at 10 %) directly below the 81 px bar | same |
| Inner pages | header is solid white from the start and sits **below** the announcement bar; total 48 + 92 = 140 px | 48 + 77 = 125 px |
| Announcement bar | **not shown on the homepage**, shown on all inner pages: 48 px tall, background `linear-gradient(70deg, deep navy, burgundy 52 %, dark rust)` (same gradient family as the footer), white 13 px/500 text with 16 px line icons, items separated by a "•"; **marquee**: CSS keyframes `scrolling-left` (`translate3d(-100%) → (-200%)`), **46 s linear infinite** | same |
| Desktop nav items | 16.54 px / 500; gaps ≈ 40 px; **magnet effect**: the label follows the cursor by max ±5 px (`Motion.spring`, 1.5 s); active/open item gets a **6 px dot** 8 px below the label (`scale 0→1`, .3 s `cubic-bezier(.7,0,.3,1)`) | — |
| Dropdown | opens on hover: header turns white (even over the hero), a white panel (250 px wide, padding 24/0/40, bottom radius 16 px, concave SVG corners joining it to the header) slides down `translateY(-105%) → 0` in **600 ms `cubic-bezier(.7,0,.2,1)`**, fades in with 200 ms delay; links 15.27 px/400 with draw-in underline; the page gets a **brand-tinted overlay** `linear-gradient(to top, accent 10 % → accent 50 %)`, 800 ms, delay 100 ms | — |
| Mobile menu | — | **bottom sheet**, see §11 |

Evidence: `motion/home-desktop-header-1-scroll60.png`, `…-header-2-transition-1.png` (mid fade), `…-header-3-scrolled.png`,
`motion/interact/dropdown-1-open.png`, `motion/interact/dropdown-open-sheet.png`, `motion/home-desktop-mechanics.json`.

---

## 5. Image treatment

| Aspect | Finding |
|---|---|
| Aspect ratios | product shots **1:1**; people/sport/category cards **4:5 portrait** (0.8); promo teasers and story video **16:9**; split-feature photo **4:3**; science photos ≈ 1.09:1 and 0.82:1 side by side (deliberately unequal heights, stretched to the same row height); UGC **9:16**; hero 16:9 source cropped to ≈ 2:1 (desktop) and 4:5 source cropped to ≈ 0.65:1 (mobile) |
| Radii | cards/images **15.16 px** desktop, **10 px** mobile (`--rounded-card`); split-feature photo 20 px; custom pages 18 px (cards) / 12 px (photos); UGC cards 20 px; full-bleed banners get only the **section radius 22.7 px on their top corners** |
| Full-bleed vs contained | full-bleed: hero video, mid-page story banner (edge to edge, rounded top corners). Everything else is contained in the 1344 px column. There is no "half-bleed" — it is either 100 vw or the grid. |
| `object-fit` | always `cover`; cut-out product renders use `contain` inside stat cards (image absolutely positioned right, 56 % wide, overflowing the card by ±12 % vertically, `object-position:center right`) |
| Overlays | hero: flat **black at 10 %** (`rgba(0,0,0,.1)`) — almost nothing; the footage itself is graded dark/contrasty. Story banner: **no overlay** (image is naturally dark on the text side). Image cards: optional flat overlay via `--overlay-opacity` (`.media:after`), no gradients. → Legibility is solved by **choosing/cropping imagery with a calm dark zone where the text sits**, not by heavy gradients. |
| Text on images | hero: bottom-centered stack (headline → 15 px subline → glass pill + text link), box padding-block `clamp(40px, 3.37vw, 64px)`; banner: bottom-left, H2 max 640 px; cards: title bottom-left + 20 px arrow icon bottom-right, padding `0 24px 20px` (≥1536: `0 40px 28px`), optional 14 px subline under the title |
| Product photography | renders on a **neutral light-grey studio gradient** (#e9e9e9-ish) so that 1:1 tiles read as soft grey cards on the white page; one accent-coloured backdrop tile (coral) inside the PDP gallery for rhythm |
| 3-D illustrations | glossy 3-D renders (foot, foam layers, shoe, heel wedge) in the brand gradient act as "icons" for technology claims — shown as 1:1 looping videos on home and as PNG cut-outs in stat cards |
| Placeholder / loading | every media box has background `rgb(247,245,245)` and a `preloading` keyframe (a 1.2 s scaleX shimmer bar) until the `<img is="lazy-image">` has loaded, then the image fades in (`opacity .5s`) — visible as the grey skeleton at ~0.4 s in `motion/home-desktop-load-sheet-fine.png` |
| Hover | image `scale(1) → scale(1.05)`, 500 ms `cubic-bezier(.3,1,.3,1)`, clipped by the rounded wrapper |
| Mosaic gallery (landing page) | 3-column collage with a large center image and two stacked small images per side, all r 15 px, columns vertically offset; on the PDP the side columns are `parallax-element`s (`translateY −15 % → 15 %` and `−6 % → 6 %` over the viewport pass) |

## 6. Video usage

| Where | Spec |
|---|---|
| **Hero (home)** | `<video playsinline muted autoplay loop preload="metadata" poster=…>`; **two separate files**: desktop 1920×1080 16:9 (13.4 s loop, 7.2 Mbps MP4), mobile 864×1080 **4:5**; the unused one is `display:none`. Fast-cut montage (≈ 1 cut/s). Poster JPG shows first (LCP, `fetchpriority=high`), video element is injected from a `<template>` and cross-fades in (`opacity .2s`) once playing (~0.5–0.7 s after navigation). **No native controls**; a 48 px round **pause/play toggle** sits bottom-right (20 px inset): `background: rgba(255,255,255,.75)` + `backdrop-filter: blur(12px)`, icon swaps play/pause, transitions .2 s. |
| Hero (story page) | same component under a solid header; dark footage, centered display headline + subline + underlined text link |
| **Icon videos** (feature columns) | 4 × 1:1 MP4 (1080², 4–5 s), `autoplay loop muted playsinline`, no controls, r 15 px, white backgrounds that melt into the page; they start only when scrolled into view (poster `<img>` fades out, video fades in, 200 ms) and pause when off-screen |
| Story banner (home) | full-bleed poster image with a **play button** (48 px white circle, bottom-right) → click-to-play (deferred media), not autoplay |
| Contained story video (PDP) | 1344 px wide 16:9 block, r 15 px, autoplay muted loop with the same pause toggle |
| UGC reviews | 9:16 cards 300×533, r 20 px, centered 40 px play badge, opens a player lightbox; carousel arrows 40 px dark circles |
| Product explainer | **not a video**: 151 WebP frames drawn to a `<canvas>` by scroll position (§8.7) |

Rules of thumb visible in the reference: video never has visible chrome, is always muted + looping, always has a poster, always gets the same radius as images, and always offers a pause control when it autoplays (a11y).

---

## 7. Components

### 7.1 Buttons

| Variant | Spec |
|---|---|
| Base `.button` | `display:inline-flex`, `overflow:hidden`, `position:relative`, Poppins 500, 15.27 px (14 px mobile), `line-height:1`, padding `clamp(18px,1.2vw,22px) clamp(26px,1.473vw,30px)` → **18 px 26 px**, radius **60 px** (pill), `max-height:60px` → **56 px tall** desktop / 50 px mobile; `--button-fixed` min-width 192 px; border drawn by `::after` = **1 px at 30 % opacity** of the button colour |
| Primary (dark) | bg `rgb(31,29,30)`, text white. Inverted on dark sections: bg white, text ink |
| Secondary / "glass" | `background:none; backdrop-filter: blur(12px)`, 1 px border 30 %, text = current section colour (white on video, ink on white). This is the **default CTA on imagery** |
| Icon button | 48×48 circle (quick view, play/pause), 40×40 (newsletter submit: white circle + arrow; carousel arrows: dark circle) |
| With arrow | `gap: 12px`, 20 px arrow-right icon (stroke 1.6 px) after the label |
| Small | 12–14 px, padding ≈ 14 px 16 px (44 px tall on mobile) |
| Custom-page buttons | simpler: `padding:14px 34px; border-radius:999px; font-weight:600; font-size:16px` (dark) and full-width 47 px "Shop" pills in cards |
| **Hover (signature)** | a hidden `span.btn-fill` — an ellipse `width:150%; height:200%; border-radius:50%; top:-50%; left:-25%` — rises from below: `translateY(76%) → 0` on enter, continues upward `→ −76%` on leave, **600 ms**, Motion One default ease. Fill colour = the inverse (glass → solid white + ink text; outline → solid ink + white text). Label colour transitions `.5s cubic-bezier(.3,1,.3,1)` with **.1 s delay**. Disabled on touch devices. |
| Magnet | nav items, header icons, icon buttons: element follows the pointer by `(pointer − center) × 10 px` (max ±5 px), spring easing, 1.5 s settle |
| Loading state | label fades out (.15 s), three dots pulse `scale 1.6 ↔ .6`, 350 ms, staggered |

Evidence: `motion/hover/home-01-hero-button-glass-strip.png`, `motion/hover/home-08-button-outline-learn-more-strip.png`.

### 7.2 Text links

Underline is a 1 px `linear-gradient` background, not `text-decoration`.
`.link` (CTA links like "Insole Finder", "Explore Game Day Pro →"): underline **present**, on hover it retracts to the
right (`background-size 100% → 0`), 500 ms `cubic-bezier(.3,1,.3,1)`.
`.reversed-link` (card titles, footer, dropdown): **no** underline, on hover it draws in from the left (`0 → 100%`).
Arrow links: 16 px text + 20 px arrow, gap 6 px.

### 7.3 Badges / pills / tags

| Item | Spec |
|---|---|
| Rating pill on product image | top-right, 68×34, padding 10 px 16 px, full radius, `rgba(255,255,255,.75)` + `blur(12px)`, 12 px amber star + 11 px text |
| Tag chip (science accordion) | `background:#f0f0f0; border-radius:999px; padding:6px 16px; font-size:14px`, 33 px tall, margin `0 8px 8px 0` |
| Eyebrow pill (wizard) | dark pill, white 13 px / 600, padding 6.4 px 16 px |
| Option card (wizard) | white, `2px solid rgba(0,0,0,.1)`, r 14 px, padding 18 px 20 px, hover border 30 %; **selected** = accent border + `inset 0 0 0 1px accent` + accent 4 % tint; transition `.15s ease` |
| Progress bar (wizard) | 4 px track `rgba(0,0,0,.08)`, accent fill, `width .35s ease` |

### 7.4 Cards

| Card | Anatomy |
|---|---|
| Product card | 1:1 image (r 15) with rating pill → row: title (18.5 px/700) left, price (18.5 px/400) right → `mt 36px` → 4 spec rows, each 37 px tall: 20 px line icon + 12 px/500 label left, 12 px/400 value right, 1 px dividers at 10 % ink. No card background, no shadow. Hover: title underline draws in, 48 px quick-view circle fades in top-right (`opacity .3s`), second image cross-fades (`opacity/transform .5s`). |
| Image card (sport / category / promo) | rounded image with overlaid title (+ optional 14 px subline) bottom-left and arrow bottom-right; whole card is one link. Hover: image 1.05, underline draws (1.35 px), **arrow rotates 90°** (→ becomes ↓), all 500 ms `cubic-bezier(.3,1,.3,1)`. Text colour per card (white on dark photos, ink on light ones). |
| Feature column | 1:1 media, 24 px gap, title 18.5 px/600, 16 px body; no box |
| Stat card (science) | `background:#f3f1f1; border-radius:18px; min-height:230px; padding:28px 32px`; text block max 50 % left (numeral 72 px display + 15 px label), 3-D render bleeding out of the right half; grid 2 × 630 px, gap 20 px; above them a **full-width near-black banner card** (r 18, padding 36 px 40 px) with a 52 px display line + 17.6 px subline at 85 % white |
| Stat trio (science) | 3 cols × 384 px, gap 24; each: 64 px round light-grey icon chip → 72 px display numeral → 14 px grey label, centered; followed by a centered 22 px conclusion paragraph (max 760 px) |
| Line-up card (science) | `#f3f1f1` card r 18: 1:1 image flush on top (own r 18), body padding ≈ 22 px: name 18/700, tagline 15 px grey, price, full-width dark pill "Shop" 47 px; grid 4 × 305 px, gap 20 |
| Benefit strip (story) | one light-grey rounded panel (max ≈ 1068 px) split into 4 columns by 1 px vertical rules; each: 32 px line icon, 17 px/600 title, 14 px grey text, centered |
| Image-with-text card | single rounded light-grey card, 50/50, text side padding 60 px: logo/heading → 16 px body → arrow link |
| Bordered content card (FAQ) | `border:1px solid` ink 10 %, r ≈ 22 px, padding 48 px, transparent bg — works identically on white and on the near-black section |

### 7.5 Accordion (FAQ)

| Property | Value |
|---|---|
| Markup | native `<details>` + `<summary>`, grouped so that opening one closes the others, then smooth-scrolls the opened item below the sticky header (250 ms later) |
| Row | summary padding **32 px 0** (28 px mobile) → row height 89 px (96 px mobile, 2 lines); question 20 px / 500 (16 px mobile); 1 px dividers at 10 % ink; no background |
| Icon | 20 px "plus" (17 px mobile), rotates 45° to an × — `transform .5s cubic-bezier(.3,1,.3,1)` |
| Open animation (measured via WAAPI) | `details` height `closed → open` in **300 ms linear**; content `opacity 0→1` and `translateY(10px→0)` during the second half of those 300 ms |
| Answer | 16 px / 25.6, max-width ≈ 660 px (does not run under the icon), padding-bottom 32 px |
| Layout on FAQ page / PDP | 2 columns: **left** bordered card (826 px) with group title (with accent squiggle underline) + 14 px grey intro + rows; **right** 360 px contact form column ("Didn't find your answer?" 30 px/600 + grey text + form). On the PDP the whole block sits on the near-black section with inverted colours. |
| Science variant | chevron instead of plus (`rotate(180deg)`, .2 s ease), 20 px/600 titles, body + "USED IN:" eyebrow + tag chips, list max 1000 px |

Evidence: `motion/interact/accordion-desktop-1-open.png`, `…-accordion-desktop-open-sheet.png`, `shots/faq-desktop-slice-01.png`, `shots/product-desktop-slice-12.png`.

### 7.6 Forms

Inputs: height **62 px**, r 6 px, padding `16px 26px 0`, **filled** with ink at ≈ 4 % (white at 4.3 % on dark),
1 px border at 10 %, **floating label** (16 px → shrinks on focus/filled); textarea ≈ 145 px; 24 px vertical gap;
submit = primary pill. Newsletter: 430×62 field with a 40 px white circular arrow button inside on the right, 14 px
incentive line below. Select in the wizard: 47 px tall, 1.5 px border, r 10 px.

### 7.7 Sliders / carousels

| Slider | Behaviour |
|---|---|
| Card rows on mobile (products, sports, categories) | **CSS only**: `overflow-x:auto; scroll-snap-type:x mandatory; scroll-padding:20px; scrollbar-width:none`; container bleeds to the screen edges (`margin:0 -20px; padding:0 20px`); cards 289 px (≈ 74 vw) + 32 px gap → one card + a 69 px peek of the next. **No dots, no arrows, no autoplay** — the peek is the affordance. Verified: a 200 px nudge snaps to 321 px (= card + gap). |
| Same rows on desktop | static grids (no slider) |
| UGC video carousel | Embla, free drag + wheel gestures, loop, center-aligned, cards 300×533 gap 24, **two 40 px dark circular arrows centered below**, no dots |
| Announcement bar (if >1 message, non-marquee mode) | Flickity `fade:true, wrapAround:true, autoPlay:5000` |
| PDP gallery | desktop: 2-column image grid (**373 px** square tiles, gap 20 px, r 15), no slider; mobile: swipe gallery |

### 7.8 Marquee

Announcement bar only: duplicated inline-flex track, `animation: scrolling-left 46s linear infinite`
(`translate3d(-100%,0,0) → (-200%,0,0)`), items ≈ 310–380 px apart with a centered "•" separator, 16 px icon + 13 px
text; pauses for `prefers-reduced-motion`. There is no big typographic marquee on the site.

### 7.9 Reviews / testimonials

Home: H2 "Worn by pros. Loved by everyone." (48.5 px, left) + "10,000+ 5 Star Reviews" (21 px) + UGC video carousel.
PDP: the same H2 at 68 px **centered with gradient-highlighted words**, then the video carousel, later a Klaviyo
review list: big "4.9 /5" numeral, amber stars, distribution bars, customer photo grid, filter pills, review rows with
hairline dividers, a dark pill "Show more". Star colour `rgb(245,158,11)`.

### 7.10 Trust strip (above the footer on every page)

3 columns separated by 1 px rules; each = 24 px line icon + 18 px/500 title + 13 px text. Padding 20/40 px. It is
the last element of the white "sheet": its **bottom corners are rounded (22.7 px)** and the gradient footer is
revealed underneath.

### 7.11 Footer

1. **Gradient panel** (314 px desktop / 745 px mobile; padding 72/72 → 54/54): `linear-gradient(120deg, deep navy →
   burgundy 50 % → dark rust)` on a near-black base, rounded top *and* bottom corners. Left half: colour logo
   (233×40), 5 social icons 24 px with 28 px gaps, two link columns (16.5 px/400 white, 12 px row gap). 1 px vertical
   rule (white 10 %). Right half: newsletter heading 21 px/600, field, incentive line.
2. **Copyright bar** (110 px): near-black; copyright 14 px, legal links 11.2 px with draw-in underline, payment icons
   38×24 right-aligned.

### 7.12 Sticky buy bar (PDP)

Floating card bottom-right (≈ 550×113 px, 20 px from the edges), white, 1 px border 10 %, r 15 px: 80 px thumbnail,
title 16/500, variant 12 px grey, price, dark pill. Appears after the main buy button leaves the viewport.
(Analogue for us: a floating "Gutscheine bestellen" bar.)

---

## 8. Motion catalogue

Global tokens (theme CSS):
`--animation-primary: .5s cubic-bezier(.3,1,.3,1)` (hover/UI), `--animation-nav: .5s cubic-bezier(.6,0,.4,1)` (header),
`--animation-smooth: .7s cubic-bezier(.7,0,.3,1)` (highlights), `--animation-fast: .3s` and `--animation-short: .2s`
(both `cubic-bezier(.7,0,.3,1)`), drawers/dropdown `cubic-bezier(.7,0,.2,1)`, reveals `cubic-bezier(.16,1,.3,1)`.
Everything is switched off under `prefers-reduced-motion: reduce`.

| # | Animation | Trigger | Properties | Duration / easing / stagger |
|---|---|---|---|---|
| 8.1 | **Page load / hero** | load | grey skeleton → poster → video cross-fade; header and hero copy are simply there. **No hero text choreography.** | poster visible ≈ 0.5 s, video ≈ 0.7 s; video fade 200 ms |
| 8.2 | **Heading word reveal** (`split-words` + `animate-element[data-animate="fade-up-large"]`) | `Motion.inView` (first intersection, once) | each **word**: `translateY(90%) + opacity 0 → 0 / 1` (at 48.5 px type = 43.65 px travel) | **1000 ms**, `cubic-bezier(.16,1,.3,1)`, **30 ms per word**; banner titles start after **250 ms** |
| 8.3 | Generic block reveal (`fade-up`, theme default) | inView; waits for the block's images to load | `translateY(min(2rem,90%)) + opacity 0 → 0/1` | **1500 ms**, same easing, optional `data-animate-delay` |
| 8.4 | Image reveal (`zoom-out`) | inView | `scale(1.3) → 1` inside the clipped wrapper | **1300 ms**, same easing |
| 8.5 | `fade-in` | inView | opacity 0→1 | 1500 ms |
| 8.6 | **Card list stagger** (`motion-list`) | inView | cards `translateY(50px)`, `opacity 0`, `visibility hidden` → 0/1/visible (mobile: 30 px) | **500 ms** "ease", **100 ms stagger** (mobile 300 ms / 50 ms). Used on the 3 category cards; the 4-up product/sport rows are static. |
| 8.7 | **Scroll-scrubbed product explainer** (PDP, desktop only) | scroll position | wrapper `height: 500vh`; child `position:sticky; top:0; height:100vh`; canvas 80 % wide (max 1456 px), 2:1; **151 WebP frames** preloaded, frame = `round(progress × 150)`, rAF-throttled; after the last frame it smooth-scrolls to the section end. Sequence: insole top view → layers separate (exploded view) → re-assemble → flip to underside. | scrubbed, no easing. **Hidden on mobile** (replaced by a static collage + feature list). |
| 8.8 | Highlighted word | inView (after the word reveal finished) | gradient text fill wipes in via `background-size 0 → 100%` with `background-clip:text` | 700 ms `cubic-bezier(.7,0,.3,1)` |
| 8.9 | Squiggle underline | inView | SVG path `stroke-dashoffset 1 → 0` (accent stroke) | 1300 ms `cubic-bezier(.65,0,.35,1)` |
| 8.10 | Sticky header state | scroll > 102 px | see §4 | 500 ms `cubic-bezier(.6,0,.4,1)` (+100 ms delay on the backdrop) |
| 8.11 | **Sheet overlap** (not an animation, a layering trick) | — | every `.section:before` paints the section background with `height: calc(100% + radius)`, so it continues 22.7 px under the next section, whose top corners are rounded. Hero media is 745 px tall inside a 722.5 px section for the same reason. | — |
| 8.12 | **Footer reveal** (`footer-parallax`) | scroll-linked (`Motion.scroll`, offset "enter") | footer panel `translateY(-50%) → 0` while it enters; a dark gradient overlay on top shrinks `height 100% → 0` (opacity .8). Measured: −156.8 px at 900 px before the end → 0 at 100 px before the end. | scrubbed; **disabled on touch / < 768 px** |
| 8.13 | Collage parallax (PDP) | scroll-linked | side columns `translateY −15 % → 15 %` and `−6 % → 6 %` | scrubbed |
| 8.14 | Button liquid fill | mouseenter / leave | §7.1 | 600 ms |
| 8.15 | Link underline draw / retract | hover | `background-size` | 500 ms `cubic-bezier(.3,1,.3,1)` |
| 8.16 | Image card hover | hover | img scale 1.05; arrow `rotate(90deg)`; underline | 500 ms `cubic-bezier(.3,1,.3,1)` |
| 8.17 | Magnet | mousemove | translate ≤ ±5 px | spring, 1.5 s |
| 8.18 | Dropdown | hover on nav item | §4 | 600 ms `cubic-bezier(.7,0,.2,1)`; overlay 800 ms + 100 ms delay; dot 300 ms |
| 8.19 | Mobile bottom sheet | tap | §11 | 600 ms `cubic-bezier(.7,0,.2,1)`; overlay 800 ms |
| 8.20 | Accordion | click | §7.5 | 300 ms linear + icon 500 ms |
| 8.21 | Marquee | always | §7.8 | 46 s linear infinite |
| 8.22 | Media preloader | until image loaded | scaleX shimmer bar | 1.2 s linear infinite |
| 8.23 | Play/pause chip | hover | bg/backdrop/opacity | 200 ms `cubic-bezier(.7,0,.3,1)` |

What is **absent** (equally important for the feel): no scroll-jacking or smooth-scroll library, no parallax on text,
no pinned horizontal sections, no page-transition overlays, no cursor follower (the theme's `mouse-cursor` element
exists but is disabled), no bouncing/elastic easings, no count-up numerals — stat numbers are static.
The custom science/story pages have **no reveal animations at all**; their impact comes from type scale and rhythm.

Evidence: `motion/home-desktop-scroll.webm` (+ `-scroll-sheet.png`, `-load-sheet.png`, `-load-sheet-fine.png`),
`motion/home-mobile-scroll.webm`, `motion/science-desktop-scroll.webm`, `motion/home-desktop-reveal-*-f00…f11.png`
(60 ms frame bursts), `motion/home-desktop-footer-reveal-500/200/000.png`, `motion/interact/scrollseq-desktop-sheet.png`,
`motion/home-desktop-mechanics.json`, `motion/hover/home-hover-report.json`.

---

## 9. Homepage, section by section

Total height **7048 px** desktop / **7280 px** mobile. All sections are white unless stated. Slice files:
`shots/home-desktop-slice-01…09.png` (scrollY 0, 810, 1620, 2430, 3240, 4050, 4860, 5670, 6148),
`shots/home-mobile-slice-01…10.png`, full pages `shots/home-desktop-full.png`, `shots/home-mobile-full.png`.

| # | Section (purpose) | Layout | Height D / M | Background role | Transition to next | Screens |
|---|---|---|---|---|---|---|
| 0 | **Header** (no announcement bar on home) | transparent over hero, white type | 92 / 77 | none → white when scrolled | — | `home-desktop-slice-01`, `motion/home-desktop-header-*.png` |
| 1 | **Hero video** — emotional promise + 2 CTAs | full-bleed looping montage; bottom-centered: display headline (2 lines, ≈800 px wide) → 15 px subline → glass pill "Shop Insoles" + underlined text link; pause chip bottom-right | **723 / 600** | footage + black 10 % | next section's **rounded top corners (22.7 px) slide over the video**, which continues 22.7 px underneath | `home-desktop-slice-01`, `home-mobile-slice-01` |
| 2 | **Hero product / endorsement** — "the insoles pros actually use" | 50/50: left 4:3 athlete photo with name caption baked in (r 20); right centered stack: display headline, side-view product cut-out (662 px wide, links to PDP), 20 px lead, arrow link | 640 / 676 | white | plain (72 px padding) | `home-desktop-slice-01/02`, `home-mobile-slice-02` |
| 3 | **Product line-up** — 4 products comparable at a glance | 4 × 322 px cards: 1:1 grey studio tile + rating pill, name/price row, 4 icon spec rows (Purpose / Feel / Support / Thickness) | 702 / 613 | white | plain | `home-desktop-slice-02/03`, `home-mobile-slice-02/03` |
| 4 | **Shop by activity** — audience entry points | 4 × 4:5 photo cards, white title bottom-left, arrow bottom-right | 547 / 469 | white | plain | `home-desktop-slice-03`, `home-mobile-slice-03` |
| 5 | **Technology pillars** — "The Most Advanced Insoles Ever Made" | header row: H2 48.5 px + 16 px text (max 896 px) left, outline pill "Learn more →" right; below 4 columns, each a **looping 3-D icon video** (1:1, 298 px) + 18.5 px title + 16 px text. H2 reveals word by word. | 725 / 1022 | white | next section has rounded top corners | `home-desktop-slice-04`, `motion/home-desktop-reveal-multicolumn_feNmid-f00…11.png` |
| 6 | **Story video banner** — athlete testimonial | full-bleed dark photo (click-to-play), H2 48.5 px white bottom-left (2 lines, word reveal after 250 ms), glass pill with arrow, 48 px play circle bottom-right | 638 / 488 | dark imagery (the only dark band on the page) | following white sheet overlaps with rounded corners | `home-desktop-slice-05` |
| 7 | **Category cards** — Insoles / Socks / Apparel | 3 × 436 px 4:5 cards, title 25 px + 14 px subline overlaid; **cards stagger in** (50 px, 500 ms, 100 ms apart) | 689 / 469 | white | plain | `home-desktop-slice-06`, `motion/home-desktop-reveal-collection-list-f00…10.png` |
| 8 | **Promo 2-up** — "Find your right insole" / "Science behind Move" | 2 × 660 px 16:9 cards (one light, one dark image → ink vs. white text) | 515 / 518 | white | plain | `home-desktop-slice-06/07` |
| 9 | **Retail availability** | single rounded light-grey card, 50/50 text + photo | 569 / 662 | white page, **soft-grey card** | plain | `home-desktop-slice-07` |
| 10 | **Social proof** — "Worn by pros. Loved by everyone." | left-aligned H2 + "10,000+ 5 Star Reviews", 9:16 UGC video carousel, 2 arrow circles | 146 + 601 / 149 + 454 | white | — | `home-desktop-slice-08`, `motion/interact/ugc-0-initial.png` |
| 11 | **Trust strip** — trial / shipping / fit | 3 columns with dividers; **bottom corners of the white sheet are rounded** | 131 / 209 | white | footer slides out from underneath (−50 % → 0) | `home-desktop-slice-09`, `motion/home-desktop-footer-reveal-500/200/000.png` |
| 12 | **Footer** | gradient panel (logo, socials, links | newsletter) + near-black copyright bar with payment icons | 314 + 110 / 745 + 208 | brand gradient, then near-black | — | `home-desktop-slice-09` |

Rhythm: hero → *product* → *range* → *audiences* → *technology* → **dark emotional break** → *categories* → *tools* →
*availability* → *proof* → *reassurance* → footer. One dark band in the middle, one gradient at the end; everything
else is white with 144 px of air (72 + 72) between content blocks. Only two H2s exist on the whole homepage — most
sections are self-explanatory card rows **without** a heading.

### 9.1 Patterns from the sub-pages worth re-using

| Page | Pattern | Screens |
|---|---|---|
| science | **Typographic hero**: 88 px uppercase display H1 (3 lines, centered, 1100 px), product side-view cut-out below (920 px), 20 px subline; no photo background | `shots/science-desktop-slice-01.png` |
| science | **Stat banner**: near-black banner card ("120,000 FOOTSCANS" + subline) → 2 soft-grey stat cards ("85%", "50%") with 3-D renders → centered dark pill CTA | `science-desktop-slice-01/02` |
| science | **Text + image explainer**: centered display H2, then 2-col row (580 px text at 17/27 | 580 px square render), gap 40; alternates left/right | `science-desktop-slice-02/05` |
| science | **Evidence block** ("The physics of landing"): display H2 → 2 photos of unequal ratio with text on top of the left column → stat trio (icon chip, 72 px numeral, grey label) → centered 22 px conclusion | `science-desktop-slice-03/04` |
| science | **Layer accordion**: wide exploded render (1200×426) → accordion (max 1000 px) with chips | `science-desktop-slice-06/07` |
| science | **Impact statement**: display H2 → 20 px centered paragraph (820 px) → 120 px numeral "14 tons" + uppercase grey label → paragraph → 32 px uppercase closing line | `science-desktop-slice-07/08` |
| science | **Line-up cards** with dark "Shop" pills | `science-desktop-slice-08/09` |
| story | **Video hero under solid header** with 97 px display H1 + text link | `shots/story-desktop-slice-01.png` |
| story | **Manifesto intro**: 80 px display H2 (3 lines) + 20 px centered paragraph (≈ 800 px) | `story-desktop-slice-03` |
| story | **Benefit strip**: one grey panel, 4 columns with line icons and dividers | `story-desktop-slice-03/04` |
| story | **Origin story**: display H2 (2 lines, full width) → 2-col: 580 px portrait photo (square corners here, name + title baked in bottom-left in display type) | 17/27 narrative paragraphs, last line bold | `story-desktop-slice-04` |
| product | Buy box: 2-col gallery grid (373 px tiles, gap 20) + sticky info column (510 px): title 40 px + price right, star row, icon spec rows, option buttons (≈ 92×48, r ≈ 6, 1 px border; selected = 2 px ink border — read from the screenshot, not computed), quantity pill (58 px) + 368×60 primary pill (measured), guarantee list | `shots/product-desktop-slice-01.png` |
| product | **Centered H2 with gradient-highlighted word** (68 px) + 16 px subline; scroll-scrubbed explainer; 4-col feature panel on `rgb(240,240,240)`; contained 16:9 video; **near-black FAQ + form section**; reviews | `product-desktop-slice-03/05/07/10/12`, `motion/interact/scrollseq-desktop-sheet.png` |
| faq | Page title at display size (Poppins 600), bordered FAQ card + form column | `shots/faq-desktop-slice-01.png`, `motion/interact/accordion-desktop-1-open.png` |
| landing | Alternating image/text rows (image 50 %, text vertically centered, 25 px H3 + 16 px), mosaic gallery, FAQ card (narrow, centered 660 px), full-bleed closing banner with display headline, 4-up cards | `shots/landing-desktop-full.png` |
| teamsales | Minimal B2B page: centered rich text + narrow contact form | `shots/teamsales-desktop-slice-01.png` |

---

## 10. Colour usage pattern (roles, not values)

| Role | How move.one uses it | Share |
|---|---|---|
| **Canvas** | pure white for practically every section; no alternating tinted bands | ≈ 80 % |
| **Ink** | one near-black (`rgb(31,29,30)`) for all text, primary buttons, icon strokes, the copyright bar, the single dark content section per long page (PDP FAQ) and dark banner cards | text + 1 band |
| **Soft neutral** | two very light warm greys (`#f7f5f5`, `#f3f1f1`/`#f0f0f0`) for cards, panels, chips, input fills, image placeholders and product-shot backdrops → "grey tiles on white" | cards only |
| **Muted text** | `#6b6b6b` (or ink at 55–65 %) for captions, stat labels, eyebrows, helper text | small text |
| **Hairlines** | ink at 10 % (dividers, borders, header line), 6 % (light), 40 % (emphasis); on dark: white at 10 % | — |
| **Accent** (their hot pink) | *never* a section background, *never* the standard button. Only: squiggle underline under one heading, gradient fill of 1–2 words in centered H2s (`linear-gradient(120deg, warm light → accent 45 % → ink)`), the tint of the overlay behind dropdown/drawer/menu (accent at 70 %, or 10→50 % gradient), progress/selected states in the wizard, sale price | < 2 % |
| **Brand gradient** | dark 3-stop gradient (`120deg`/`70deg`, cool dark → warm dark) used **only as bookends**: announcement bar (top, inner pages) and footer panel (bottom). Also the colour world of the 3-D renders and product prints, which ties imagery to the brand. | bookends |
| **On-image** | white text/icons, glass chips (`rgba(255,255,255,.75)` + blur 12 px), glass buttons (transparent + blur + 1 px 30 % border) | — |
| **Semantic** | amber stars only for ratings; success/error pastel pairs for form states | — |

**Mapping onto our palette** (deep navy, olive green, light steel blue, off-white):

| Reference role | Ours |
|---|---|
| Canvas (white) | **off-white** page background; keep *pure white* available for cards so that "tile on canvas" still reads (the reference does grey-on-white; we do white-or-steel-tint-on-off-white) |
| Ink (near-black) | **deep navy** for all text, primary pills, icon strokes, dark FAQ/contact section, copyright bar, dark stat banner card |
| Soft neutral | **light steel blue at ≈ 20–35 % tint** (stat cards, benefit strip, chips, input fill, image placeholders); hairlines = navy at 10 % |
| Muted text | navy at 60 % |
| Accent | **olive green**, used with the same stinginess: squiggle under one heading per page, 1–2 highlighted words in centered H2s (gradient: light steel blue → olive 45 % → navy), progress bar / selected state / focus ring in the voucher configurator, check-marks in lists. Standard buttons stay navy. One exception is legitimate (as in the reference's wizard): the **final order CTA** may be solid olive. |
| Brand gradient bookends | `linear-gradient(120deg, deep navy, navy→olive mix 50 %, dark olive)` for footer panel and optional top info bar |
| Overlay tint behind menu/drawer | navy at 65–70 % (olive tints photos muddy; the principle "brand-coloured, not black" is kept) |
| On-image | off-white text, glass chips/buttons identical |

Contrast check to do during build: olive on off-white for text < 24 px will likely fail AA — keep olive for graphics
and large display words only, exactly as the reference does with its pink.

---

## 11. What makes this site feel premium — 12 concrete observations

1. **Sheets, not stripes.** Sections are stacked "cards" with 22.7 px top corners; the previous section (even video)
   continues 22.7 px underneath, and the footer slides out from below the last sheet. One idea, applied everywhere.
2. **A single radius system.** 15 px for every image/card, 22.7 px for sections, full pills for every button, 6 px for
   inputs. No sharp corner appears next to a round one (exception: one portrait in the story page).
3. **Extreme but disciplined type contrast.** 80–97 px uppercase display lines at line-height 0.82–0.9 against 16 px
   body; nothing decorative in between. Tracking tightens with size (−0.025 → −0.05 em). Only two H2s on the homepage.
4. **Colour restraint.** White + one ink + soft grey tiles; accent < 2 % of pixels; gradient only as top/bottom bookend.
   Imagery and 3-D renders carry the colour.
5. **No shadows, no heavy borders.** Depth comes from layering and from frosted-glass chips/buttons
   (`backdrop-filter: blur(12px)`) on footage; lines are 1 px at 10 % ink.
6. **Video as a material.** Art-directed hero montage with a dedicated portrait cut for phones, looping 3-D icon
   videos instead of flat icons, always muted/looping/poster-first, always with a discreet pause chip.
7. **Slow-out motion with small distances.** 1–1.5 s durations on `cubic-bezier(.16,1,.3,1)`, ≤ 50 px travel, word
   stagger 30 ms, card stagger 100 ms; nothing bounces, nothing scroll-jacks, each reveal fires once.
8. **Every interactive thing answers within 500–600 ms** and in the same dialect: liquid fill on pills, underline
   draw/retract on links, arrow rotating 90° + image 1.05 on cards, magnet on nav/icon buttons, dot under the active
   nav item.
9. **Generous, regular rhythm.** 72 px section padding (144 px between blocks), 18 px card gaps, one 1344 px column,
   text measure capped at 640–900 px, leads at 20–22 px.
10. **Photography with built-in calm zones.** Cohesive grade, people in action in 4:5, product renders on neutral
    studio grey, text placed where the picture is quiet → overlays of 0–10 % suffice.
11. **Numbers as typography.** Stats are 72–120 px display numerals with tiny grey labels; product facts are
    icon + label + value rows with hairlines instead of tables.
12. **Finish.** Brand-tinted (not black) overlays, concave corner joins between header and dropdown, floating labels,
    skeleton shimmer while images load, 44 px hit areas, sticky buy bar, `prefers-reduced-motion` honoured,
    poster-first LCP and hover-prefetching for instant page changes.

---

## 12. Mobile (390 px) — condensed spec

| Topic | Finding |
|---|---|
| Header | 77 px, constant (no shrink); transparent + white icons over the hero, white + ink once `scrollY` > ≈ 87 px; logo 90×19 left; right: search, cart, hamburger — 44×44 targets, 20/20/24 px icons; always sticky |
| Menu | **bottom sheet**, not a side drawer: white panel from y = 60 px to the bottom (784 of 844 px), top radius **20 px**, a small grab handle (≈ 40×4 px, read from the screenshot), slides up with `transform .6s cubic-bezier(.7,0,.2,1)`; backdrop = accent at 70 % fading in over .8 s (header stays visible, tinted). Items: Poppins **24 px / 600 / −0.025 em**, 44 px rows (padding 10 px 0), **fade in one after another** (≈ 60–100 ms apart, see `motion/interact/mobilemenu-open-sheet.png`); sub-menus are inline accordions (height 300 ms linear, chevron `scaleY(-1)` 500 ms); sticky bottom row: dark "Login" pill (32 px) + 5 social icons |
| Gutters / rhythm | 20 px side padding (content 350 px); section padding 54 px (= 72 × 0.75); section radius 16 px; card radius 10 px |
| Stacking | 2-col → 1-col (image first, then headline, text, link); feature columns → **2×2** (167 px, gap 16/40); promo cards stacked (350×197); trust strip stacked + centered; footer stacked (745 px) with newsletter first-class |
| Sliders | 4-up and 3-up card rows become **native scroll-snap sliders** (`x mandatory`, scroll-padding 20 px, hidden scrollbar, edge-bleed −20 px): card **289 px ≈ 74 vw**, gap 32 px, 69 px peek; no dots/arrows/autoplay. UGC carousel: swipe |
| Type | hero display 40–48 px / lh .82–.9; display H2 36 px; Poppins H2 32 / 32; large H2 40 px; card titles 20 px; lead 17 / 25.5; body 16 / 25.6; hero subline 14 / 22.4; buttons 14 px (50 px tall), small buttons 12 px (44 px tall); FAQ question 16 / 20 |
| Hero | 600 px tall (≈ 71 % of the viewport → the next sheet's rounded edge is visible above the fold), dedicated 4:5 video, headline image 350 px wide, glass pill (192×50) + text link side by side, 40 px pause chip |
| Touch behaviour | hover effects are switched off for touch (`theme.config.isTouch`): no liquid fill, no magnet, no image zoom; **footer reveal disabled**; scroll-scrubbed explainer **removed** (`display:none` < 768 px) and replaced by a static collage + stacked feature list; heading word reveals unchanged (1000 ms / 30 ms); card stagger lighter (30 px, 300 ms, 50 ms) |
| Accordion | rows 96 px (2-line questions), padding 28 px 0, plus icon 17 px; card padding shrinks to ≈ 20 px |
| Sticky UI | header; wizard-style bottom action bar (`position:fixed`, white 97 % + blur 6 px, top hairline, `padding-bottom: calc(.85rem + env(safe-area-inset-bottom))`) |

Screens: `shots/home-mobile-slice-01…10.png`, `shots/science-mobile-slice-01…14.png`, `shots/story-mobile-*.png`,
`shots/product-mobile-*.png`, `motion/interact/mobilemenu-1-open.png`, `…/mobilemenu-2-submenu.png`,
`…/mobileslider-0-start.png` / `-1-after-swipe.png`, `…/accordion-mobile-1-open.png`, `motion/home-mobile-scroll.webm`.

---

## 13. Translation guide — 3-page German B2B site (Home · Über uns · Gutscheine)

Context shift to keep in mind: move.one sells €50 products to athletes with hype; we sell **individually fitted
functional insoles to companies via employee vouchers**. Keep the *form* (sheets, pills, display type, calm motion,
video, numerals), lower the *temperature*: fewer exclamation-style lines, more evidence, more trust markers, a clear
path to the order form. German copy runs ≈ 25–35 % longer → plan for 3-line display headlines and wider text blocks.

### 13.1 Global shell

| Element | Build it like this |
|---|---|
| Fonts | Poppins 400/500/600 + **Poppins 900 uppercase** as display voice (§2.2): `letter-spacing:-.055em; word-spacing:.12em; line-height:.95`. Display sizes: hero `clamp(2.5rem, 6.2vw, 5.5rem)`, section `clamp(2.125rem, 5.2vw, 4.5rem)` (≈ 10 % below the reference because German words are longer), numerals as in §2.3. Use `&shy;` in compounds (Mitarbeiter&shy;gesundheit, Orthopädie&shy;schuh&shy;technik). |
| Tokens | container 1344 px @1440 (max 1820), gutters 48 (≥ 1280) / 36 (≥ 1024) / 20, section padding 72 / 54, radii 22.7→16 (sections), 15→10 (cards), pill buttons, 6 px inputs, hairline = navy 10 %, easing set from §8 |
| Header | transparent over the Home hero (off-white logo + links), solid on Über uns / Gutscheine; 92 → 81 px shrink, white/off-white backdrop fade 500 ms, 1 px hairline; nav centered: **Home · Über uns · Gutscheine**; right side instead of shop icons: one small navy pill **"Gutscheine bestellen"** (the persistent conversion target) ; magnet + dot indicator on nav items |
| Top info bar (inner pages, optional) | 48 px navy→olive gradient marquee, 13 px/500: "Individuell angepasst · Für Unternehmen jeder Größe · Steuerlich begünstigter Sachbezug*" — 46 s linear loop (*only claim what legal has approved) |
| Mobile nav | bottom sheet with 3 items at 24 px/600 + the CTA pill + contact line; navy 70 % backdrop |
| Footer | rounded gradient panel (navy → navy/olive → dark olive, 120deg) revealed from under the last sheet (`translateY(-50%) → 0`, desktop only): logo, short claim, link columns (Seiten / Rechtliches: Impressum, Datenschutz, AGB), contact block (phone, mail, address) instead of the newsletter — or a slim "Rückruf anfordern" field in the same 62 px input style; navy copyright bar below |
| Trust strip (end of every page) | 3 columns with line icons: e.g. "Individuelle Anpassung vor Ort", "Ein Gutschein pro Mitarbeiter:in", "Persönliche Ansprechpartner" |

### 13.2 Page: Home

| Our section | Reference pattern | Notes / numbers |
|---|---|---|
| **Hero video** | home §9 #1 | full-bleed muted loop, 722 px desktop / 600 px mobile (deliver 16:9 **and** 4:5 cut), poster first, black or navy overlay ≤ 15 %, bottom-centered: display headline (live text, 2–3 lines, max 900 px) → 16 px subline → glass pill "Gutscheine anfragen" + text link "So funktioniert's"; pause chip bottom-right. No text choreography on load — let the footage move. Footage idea: measuring feet, workshop craft, people at work standing/walking. |
| **Intro / value proposition** | home #2 (split feature) | 50/50: left 4:3 photo (r 20) of the fitting situation; right centered stack: display line ("EINLAGEN, DIE ZUM FUSS PASSEN."), side-view insole cut-out, 20 px lead, arrow link to Über uns |
| **Health benefits** | story "benefit strip" + home #5 | H2 (Poppins 600, 48 px, word reveal) + lead left, outline pill right; below 4 columns with **looping 1:1 icon clips or line icons** (posture, joints, fatigue, sick days) + 18.5 px title + 16 px text. Alternative compact form: one steel-blue-tint panel with 4 divided columns |
| **Product technology explainer** | product §8.7 (desktop) + science "layer accordion" | desktop: sticky scroll-scrub stage (`500vh` wrapper → reduce to **300–350vh**, 100vh sticky, canvas 80 % / max 1456 px, 2:1) showing the insole layers separating; ~90–120 WebP frames at 1600 px are enough. Under the stage a 4-column feature panel. Mobile + reduced-motion fallback: static exploded render + accordion of layers with chips ("Material", "Funktion"). If no 3-D sequence can be produced: use the science "text + image explainer" rows instead — do not fake it with a generic parallax. |
| **Scientific studies, visualised** | science "stat banner" + "evidence block" + "impact statement" | 1) navy banner card with one display line ("STUDIENLAGE" / key finding) + subline; 2) 2–3 steel-tint stat cards (72 px numeral + 15 px label + small render/icon) — **every numeral needs a footnote marker and a source line** (14 px, muted) — the reference gets away without sources, a B2B health site must not; 3) stat trio with icon chips; 4) one 120 px "hero numeral" with uppercase grey label and a 20 px interpretation paragraph (max 820 px). Numerals static (the reference does not count up); if a count-up is wanted keep it ≤ 1.2 s, ease-out, once. Charts: same visual language — thick rounded bars in navy with one olive highlight, labels in 14 px muted, no grid chrome. |
| **How it works (steps)** | science "stat trio" layout + landing alternating rows | 3–4 steps in a row: 64 px round steel-tint chip with the step number in display type → 18.5 px/600 title → 16 px text; thin 1 px connector line between chips on desktop; stagger in like cards (50 px, 500 ms, 100 ms). Mobile: vertical list with the line on the left. Steps: Gutscheine bestellen → Mitarbeiter:in vereinbart Termin → Fußanalyse & Anpassung → fertige Einlagen. |
| **Dark emotional break** | home #6 | full-bleed photo/video band with rounded top corners, white H2 bottom-left (word reveal, 250 ms delay), glass pill; e.g. a customer company quote or a workshop film (click-to-play with 48 px play circle) |
| **Voucher teaser** | home #9 (image-with-text card) + #8 promo cards | one large rounded steel-tint card, 50/50: left eyebrow (13 px uppercase, .04 em) + H2 + 16 px text + primary navy pill "Zum Gutschein-Konfigurator" + arrow link "Angebot per E-Mail"; right a mock-up photo of the voucher/gift card. Optionally two 16:9 promo cards below ("Für Unternehmen" / "Für Mitarbeitende"). |
| **FAQ (short)** | product dark FAQ section | near-black → **navy** section with rounded-sheet transition: left bordered card with 5–6 questions, right "Noch Fragen?" + 3-field form or phone/mail; inverted pill. Full FAQ lives on Gutscheine. |
| Trust strip + footer | §7.10 / §7.11 | as global shell |

Suggested order: Hero → Intro → Benefits → Technology → Studies → How it works → Dark break → Voucher teaser → FAQ → trust → footer
(the same alternation as the reference: mostly canvas, one dark band, gradient bookend).

### 13.3 Page: Über uns

| Our section | Reference pattern | Notes |
|---|---|---|
| Page hero | science typographic hero (no photo) **or** story video hero | recommended: typographic — 88 px display H1 (3 lines, centered, max 1100 px: "HANDWERK TRIFFT BEWEGUNGS&shy;WISSENSCHAFT"), below it a wide workshop/team photo (r 15, 1344×560) instead of the product cut-out, then a 20 px lead |
| Origin story | story "origin story" | display H2 across the full width → 2 columns: 580 px portrait/workshop photo left | 17/27 narrative paragraphs right, last sentence bold |
| **Founder profiles with CV timeline** | story portrait block + science accordion + stat trio (combined; the reference has no timeline) | per founder one row, alternating sides: **4:5 portrait** (r 15; name + role overlaid bottom-left in display type, white, like the athlete caption) | right: eyebrow (role), H3 30 px/600 name, 16 px bio, then the **timeline**: vertical 1 px navy-10 % line, 10 px olive dots, each entry = year in display numerals (28–32 px) + 16 px/600 title + 14 px muted detail; entries stagger in (30 px, 400 ms, 80 ms apart) when the row enters. Mobile: portrait first, timeline full width. Qualifications as chips (`#f0f0f0`-style → steel tint, 14 px, pill). |
| Values / method | story benefit strip | 4 divided columns in one tinted panel |
| Numbers about the company | science stat banner | navy banner card + 2–3 stat cards (years, fitted pairs, partner companies) |
| Workshop gallery | landing mosaic | 5-image mosaic, r 15, optional column parallax ±6–15 % on desktop |
| Closing CTA | landing closing banner | full-bleed photo band with rounded top, display headline + glass pill → Gutscheine |

### 13.4 Page: Gutscheine (voucher purchase)

| Our section | Reference pattern | Notes |
|---|---|---|
| Page hero | faq page title + science hero | left-aligned large Poppins-600 title (`title-lg`, 68 px → 40 px) or display H1; 20 px lead; 3 inline trust facts with check icons (olive) |
| **Voucher configurator + order form** | product buy box (2-col, sticky side) + faq form column + sticky buy bar | **Left (≈ 60 %)**: bordered card (1 px navy 10 %, r 22, padding 48 → 20 mobile) with numbered groups separated by hairlines: ① Anzahl Gutscheine (quantity pill 58 px with − / + and direct input; quick-select option buttons 10 / 25 / 50 / 100+), ② Leistungsumfang / Gutscheinwert (option cards: white, 1–2 px border navy 10 %, r 14, padding 18 px 20 px, title 17 px/600 + 15 px muted line; **selected = olive border + olive 4 % tint + inset ring**, 150 ms), ③ Versand (digital / gedruckt), ④ Firmendaten (inputs 62 px, r 6, tinted fill, floating labels, 24 px gaps; two columns ≥ 768 px), ⑤ Nachricht (textarea 145 px), consent checkbox. **Right (≈ 40 %)**: `position:sticky; top: 81px + 24px` summary card on steel tint (r 15): chosen options, **sum in display numerals (40–52 px)**, per-voucher price in 14 px muted, tax note, primary CTA pill full width (60 px tall; here solid olive is allowed) + secondary "Angebot als PDF anfordern" outline pill, below a mini trust list. **Mobile**: summary collapses into a fixed bottom action bar (white 97 % + blur, hairline, safe-area padding) showing sum + CTA. A 4 px olive progress bar at the top of the card can reflect completed groups (`width .35s ease`). Validation: inline, pastel error pair, never red blocks. |
| How redemption works | how-it-works steps (same component as Home) | 3 steps from the employee's perspective |
| For whom / pricing logic | science line-up cards | 3 tinted cards (kleine Teams / Mittelstand / Konzern) with a dark pill each that pre-fills the configurator |
| Full FAQ | faq page | bordered card with grouped questions, group titles with the **olive squiggle underline** (SVG stroke draw 1.3 s), one-open-at-a-time accordion (300 ms), sticky contact column |
| Closing reassurance | trust strip + footer | — |

### 13.5 Motion budget for our build

| Use | Spec to implement |
|---|---|
| Library | Motion One (`motion` package, ≈ 5 kB used) **or** plain IntersectionObserver + WAAPI — both reproduce the reference exactly; no GSAP needed. Word splitting: Splitting.js or a 15-line helper (wrap words in `span > span`, outer `overflow:hidden` is *not* used by the reference — the words simply fade while rising). |
| H2 reveal | words: `translateY(90%)`, `opacity 0` → `0 / 1`, 1000 ms, `cubic-bezier(.16,1,.3,1)`, 30 ms stagger, once, trigger on first intersection |
| Block reveal | `translateY(32px)` + fade, 1200–1500 ms, same easing (use sparingly: leads, cards without stagger) |
| Card/step stagger | 50 px (30 px mobile), 500 ms (300 ms), 100 ms (50 ms) apart |
| Image reveal (optional) | `scale(1.3 → 1)` in a clipped wrapper, 1300 ms |
| Buttons | liquid fill ellipse (150 % × 200 %, `translateY(76% → 0 → −76%)`, 600 ms), label colour 500 ms with 100 ms delay, pointer-fine only |
| Links / cards | underline draw/retract 500 ms `cubic-bezier(.3,1,.3,1)`; image 1.05; arrow rotate 90° |
| Header | 500 ms `cubic-bezier(.6,0,.4,1)`, threshold header height + 10 px, ±10 px hysteresis |
| Footer reveal | scroll-linked `translateY(-50% → 0)`, desktop only |
| Scroll-scrub | canvas frame sequence, rAF-throttled, `prefers-reduced-motion` → first frame only |
| Highlight word / squiggle | 700 ms `cubic-bezier(.7,0,.3,1)` / 1300 ms `cubic-bezier(.65,0,.35,1)` |
| Never | smooth-scroll hijacking, bounce easings, looping attention-seekers, parallax on text |

### 13.6 Deliberate deviations from the reference

1. Live text instead of headline images (reference bakes display type into PNG/JPG on Home).
2. Display line-height 0.95 instead of 0.82 (umlauts), display sizes ≈ 10 % smaller (word length).
3. Sources/footnotes under every statistic; calmer, factual wording (B2B health context, HWG-compliant claims).
4. Off-white canvas with white/steel-tint cards instead of white canvas with grey cards.
5. No e-commerce chrome (search, cart, ratings pills); the header CTA pill replaces it.
6. Overlay tint in navy rather than in the accent colour.
7. Shorter scroll-scrub distance (300–350vh instead of 500vh) — fewer frames, less scrolling for a B2B audience.

---

## 14. Evidence index

| Folder | Content |
|---|---|
| `shots/` | `<page>-<desktop|mobile>-slice-NN.png` (viewport slices, 90 % overlap step), `…-full.png`, `…-index.json` (scrollY per slice). Pages: `home`, `science`, `story`, `product`, `faq`, `landing`, `teamsales`, `painrelief`, `finder`. Note: `product-desktop` has a gap between slice 09 and 10 (scrollY 6659–7290) because the scroll-scrub component auto-scrolls at its end; that area (4-column feature panel on `rgb(240,240,240)`) is visible in `product-desktop-full.png`. Full-page stitches show the footer overlapping the last section — that is the footer-reveal transform, not a capture bug. |
| `motion/` | `home-desktop-scroll.webm` (25 s), `home-mobile-scroll.webm`, `science-desktop-scroll.webm` + `*-timeline.json`; contact sheets `home-desktop-load-sheet.png` (0–4 s, 5 fps), `home-desktop-load-sheet-fine.png` (0.28–1.9 s, 12.5 fps), `home-desktop-scroll-sheet.png` (2 fps); `home-<device>-header-*.png`; `home-<device>-reveal-<section>-fNN.png` (60 ms bursts); `home-<device>-footer-reveal-*.png`; `home-<device>-mechanics.json` (header states, WAAPI animation dumps, parallax probes) |
| `motion/hover/` | `home-NN-<target>-0-before / 1-mid / 2-after.png`, `*-strip.png`, `home-hover-report.json` (computed-style diffs + transitions) |
| `motion/interact/` | `dropdown-*`, `mobilemenu-*`, `accordion-*`, `ugc-*`, `scrollseq-*`, `mobileslider-*` (+ `*-report.json`, `*-sheet.png`); `finder-*` = secondary evidence only |
| `fonts/` | `font-compare.png/.json`, `font-compare-tracked.png`, `ref-parafina-h1.png`, `ref-parafina-h2.png` |
| `data/` | `measure/<page>-<device>.json` (typography, sections, grids, media, overlays, components, header), `assets/theme.css`, `theme.js`, `vendor.js`, `science-scroll.js`, `science-custom.css`, page HTML snapshots, recon/popup logs |
