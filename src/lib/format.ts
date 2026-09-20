// German number formatting and typography helpers used by content, statistics, charts and the configurator.

const NBSP = " ";
const WORD_JOINER = "⁠";

export function formatNumber(value: number, decimals = 0, grouping = true): string {
  return new Intl.NumberFormat("de-DE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: grouping,
  }).format(value);
}

// units and count words that must not be separated from their number at a line break
const UNITS = [
  "%",
  "€",
  "g",
  "kPa",
  "cm²",
  "N/cm²",
  "Mio.",
  "Punkte",
  "Sekunden",
  "Minuten",
  "Monate",
  "Monaten",
  "Jahre",
  "Jahren",
  "Stunde",
  "Stunden",
  "Werktagen",
  "Tagen",
  "Schritte",
];
const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
const UNIT_PATTERN = new RegExp(`(\\d)\\s(?=(?:${UNITS.map(escapeRegExp).join("|")})(?!\\p{L}))`, "gu");

/** A non-breaking space between a number and its unit („28 %“, „214 kPa“) and around „=“ („p = 0,03“). */
export function nbspUnits(text: string): string {
  return text.replace(UNIT_PATTERN, `$1${NBSP}`).replace(/\s=\s/g, `${NBSP}=${NBSP}`);
}

/**
 * A line must not end in a single letter plus hyphen („E-“ of „E-Mail“). An invisible word
 * joiner after the hyphen removes that break opportunity. The visible text stays as it is.
 */
export function bindShortPrefixes(text: string): string {
  return text.replace(/(?<!\p{L})(\p{L}-)(?=\p{L})/gu, `$1${WORD_JOINER}`);
}

/** Typography for running copy: both rules above. */
export const typeset = (text: string) => bindShortPrefixes(nbspUnits(text));

// values under these keys are identifiers, paths or addresses, never running copy
const SKIP_KEYS = new Set([
  "id",
  "href",
  "src",
  "doi",
  "image",
  "base",
  "portraitBase",
  "position",
  "icon",
  "tone",
  "initials",
  "code",
]);

/** Applies `typeset` to every copy string inside a content object, so the sources stay readable. */
export function typesetContent<T>(value: T, key?: string): T {
  if (typeof value === "string") return (key && SKIP_KEYS.has(key) ? value : typeset(value)) as T;
  if (Array.isArray(value)) return value.map((item) => typesetContent(item, key)) as T;
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, typesetContent(v, k)]),
    ) as T;
  }
  return value;
}
