// Measures computed typography and geometry of key home elements (desktop + mobile).
import { writeFileSync } from 'node:fs';
import { open, primeReveals, roundDir, sleep } from './review-lib.mjs';

const out = roundDir(undefined, 'data');
const device = process.argv[2] || 'desktop';
const width = process.argv[3] ? parseInt(process.argv[3], 10) : null;
const cfg =
  width && device === 'desktop'
    ? { viewport: { width, height: 900 }, deviceScaleFactor: 1, isMobile: false }
    : device;

const { browser, page } = await open('/', cfg);
await primeReveals(page);
await page.evaluate(() => window.scrollTo(0, 0));
await sleep(600);

const data = await page.evaluate(() => {
  const px = (v) => Math.round(parseFloat(v) * 100) / 100;
  const byText = (sel, txt) =>
    [...document.querySelectorAll(sel)].find((e) =>
      (e.getAttribute('aria-label') || e.textContent || '').replace(/\s+/g, ' ').trim().startsWith(txt),
    );
  const type = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      text: (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50),
      fs: px(cs.fontSize),
      lh: cs.lineHeight === 'normal' ? 'normal' : px(cs.lineHeight),
      fw: cs.fontWeight,
      ls: cs.letterSpacing === 'normal' ? 0 : Math.round((parseFloat(cs.letterSpacing) / parseFloat(cs.fontSize)) * 1000) / 1000,
      tt: cs.textTransform,
      color: cs.color,
      w: Math.round(r.width),
      h: Math.round(r.height),
      x: Math.round(r.left),
      y: Math.round(r.top + scrollY),
      lines: Math.round(r.height / parseFloat(cs.lineHeight === 'normal' ? cs.fontSize : cs.lineHeight)),
      maxW: cs.maxWidth,
    };
  };
  const box = (el) => {
    if (!el) return null;
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      x: Math.round(r.left),
      y: Math.round(r.top + scrollY),
      w: Math.round(r.width * 10) / 10,
      h: Math.round(r.height * 10) / 10,
      radius: cs.borderRadius,
      bg: cs.backgroundColor,
      pad: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
      gap: cs.gap,
      shadow: cs.boxShadow,
      border: `${cs.borderTopWidth} ${cs.borderTopColor}`,
      backdrop: cs.backdropFilter,
    };
  };
  const res = {};
  res.viewport = { w: innerWidth, h: innerHeight, docH: document.documentElement.scrollHeight };

  // header
  const header = document.querySelector('header');
  res.header = box(header);
  res.headerInner = box(header?.firstElementChild);
  res.navLinks = [...document.querySelectorAll('header nav a')].slice(0, 3).map(type);
  res.headerCta = { type: type(byText('header a', 'Gutscheine anfragen')), box: box(byText('header a', 'Gutscheine anfragen')) };
  const lock = header?.querySelector('a');
  res.lockup = { box: box(lock), spans: [...(lock?.querySelectorAll('span') || [])].map(type).slice(0, 6) };

  // hero
  const h1 = document.querySelector('h1');
  res.h1 = type(h1);
  const heroSection = h1?.closest('section');
  res.hero = box(heroSection);
  res.heroSub = type(byText('section p', 'Zwei Physiotherapeuten'));
  const heroBtn = byText('a', 'Gutscheine für Ihr Team');
  res.heroBtn = { type: type(heroBtn), box: box(heroBtn) };
  const heroLink = byText('a', 'Was die Forschung zeigt');
  res.heroLink = { type: type(heroLink), box: box(heroLink) };
  const pause = document.querySelector('button[aria-label*="Video"]');
  res.pause = { box: box(pause), label: pause?.getAttribute('aria-label') };
  const heroMedia = heroSection?.querySelector('video, img');
  res.heroMedia = box(heroMedia);

  // intro
  const introH2 = byText('h2', 'VORGEFORMT') || byText('h2', 'Vorgeformt');
  res.introH2 = type(introH2);
  const intro = introH2?.closest('section');
  res.intro = box(intro);
  const introImg = intro?.querySelector('img');
  res.introImgWrap = box(introImg?.parentElement);
  res.introImg = box(introImg);
  res.introCaption = [...(intro?.querySelectorAll('figcaption *, figure span, figure p') || [])].map(type).slice(0, 4);
  res.introLead = type(byText('p', 'Formthotics sind vorgeformte'));
  res.introLink = type(byText('a', 'So läuft die Anpassung ab'));
  res.introProduct = box(intro?.querySelectorAll('img')[1]);

  // facts
  const stat = [...document.querySelectorAll('*')].find((e) => e.children.length === 0 && /^46/.test(e.textContent.trim()));
  res.statNumeral = type(stat);
  res.statLabel = type(byText('p', 'der Beschäftigten in Deutschland'));
  res.statSource = type(byText('p', 'Quelle: BIBB'));
  res.bridge = type(byText('p', 'Der Fuß ist die einzige Stelle'));

  // audiences
  const audH2 = byText('h2', 'Für lange Tage');
  res.audH2 = type(audH2);
  res.audText = type(byText('p', 'Wer im Beruf viel steht'));
  const tiles = [...document.querySelectorAll('button')].filter((b) => /Handel|Pflege|Logistik|Sport/.test(b.textContent));
  res.tiles = tiles.map(box);
  res.tileTitle = type(tiles[0]?.querySelector('h3, span, p'));
  res.tileRowGap = tiles.length > 1 ? Math.round((tiles[1].getBoundingClientRect().left - tiles[0].getBoundingClientRect().right) * 10) / 10 : null;
  res.audSource = type(byText('p', 'EU-OSHA 2021 ·'));

  // pressure
  const prH2 = byText('h2', 'Wo der Druck entsteht');
  res.prH2 = type(prH2);
  res.prEyebrow = type(byText('p, span', 'Messbar'));
  res.prText = type(byText('p', 'Forschende der La Trobe'));
  const canvas = document.querySelector('canvas');
  res.canvas = box(canvas);
  res.prSection = box(prH2?.closest('section'));

  // technology
  const teH2 = byText('h2', 'Was eine funktionelle');
  res.teH2 = type(teH2);
  res.teText = type(byText('p', 'Formthotics werden seit 1981'));
  const teBtn = byText('a', 'Zum Hersteller');
  res.teBtn = { type: type(teBtn), box: box(teBtn), rel: teBtn?.rel, target: teBtn?.target };
  const teTitles = ['Thermoformbar', 'Aus dem Block', 'Tiefe Fersenschale', 'Fein justierbar'].map((t) => byText('h3', t));
  res.teTitle = type(teTitles[0]);
  res.teBody = type(byText('p', 'Der Formax-Schaum'));
  res.teCols = teTitles.map((t) => box(t?.parentElement));
  res.teMedia = box(teTitles[0]?.closest('li, div, article')?.parentElement?.querySelector('img')?.parentElement);

  // fitting
  const fiH2 = byText('h2', 'Ein Termin');
  res.fiH2 = type(fiH2);
  res.fiSection = box(fiH2?.closest('section'));

  // studies
  const stH2 = byText('h2', 'Was Studien zeigen');
  res.stH2 = type(stH2);
  res.stLead = type(byText('p', 'Mehrere unabhängige'));
  const cards = [...document.querySelectorAll('article, li')].filter((e) => /DOI/.test(e.textContent) && e.querySelector('svg'));
  res.studyCards = cards.map(box);
  res.studyFigure = type(cards[0]?.querySelector('p, span, div'));
  res.studyTitle = type(cards[0]?.querySelector('h3'));
  res.studyStatement = type(byText('p', 'Bei 30 Personen'));
  res.studyLimits = type(byText('p', 'Einmalige Druckmessung'));
  res.studySource = type(byText('p', 'Chia JKK'));
  res.limitsBox = box(byText('h3', 'Was nicht belegt ist')?.parentElement);
  res.carouselBtns = [...document.querySelectorAll('button[aria-label*="Studie"]')].map(box);

  // voucher teaser
  const voH2 = byText('h2', 'Gutscheine für Ihr Team');
  res.voH2 = type(voH2);
  let panel = voH2;
  while (panel && getComputedStyle(panel).backgroundColor !== 'rgb(237, 242, 245)') panel = panel.parentElement;
  res.voPanel = box(panel);
  res.voTextSide = box(voH2?.parentElement);
  res.voBtn = box([...document.querySelectorAll('main a')].find((a) => a.textContent.trim().startsWith('Gutscheine anfragen')));

  // founders
  res.foH2 = type(byText('h2', 'Angepasst von'));
  // trust
  res.trustTitle = type(byText('h3, p', 'Befund vor Produkt'));
  res.trustText = type(byText('p', 'Jede Versorgung beginnt'));
  // footer
  const footer = document.querySelector('footer');
  res.footer = box(footer);
  res.footerPanel = box(footer?.querySelector('[class*="gradient"], div'));
  res.footerHeading = type(byText('footer h2, footer h3, footer p', 'Gutscheine für Ihr Unternehmen'));
  res.footerLink = type(byText('footer a', 'Über uns'));
  res.footerLegal = type([...document.querySelectorAll('footer a')].reverse().find((a) => a.textContent.trim() === 'Impressum'));
  res.copyright = type(byText('footer p, footer span', '© 2026'));

  // all h2 for overview
  res.allH2 = [...document.querySelectorAll('h2')].map(type);
  return res;
});

const name = width ? `home-measure-${device}-${width}` : `home-measure-${device}`;
writeFileSync(`${out}/${name}.json`, JSON.stringify(data, null, 2));
console.log(JSON.stringify(data, null, 1));
await browser.close();
