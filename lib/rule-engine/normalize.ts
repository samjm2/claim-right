// documents never say the same thing the same way. "Knee MRI" vs "MRI, Left Knee",
// "$4,800.00" vs "4800", "July 2, 2026" vs "07/02/2026". everything here exists so the
// engine compares meaning, not characters.

export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// tokens worth comparing on — drop filler words that add noise to overlap scoring
const STOPWORDS = new Set(["the", "of", "and", "for", "a", "an", "with", "left", "right", "at", "in"]);

function significantTokens(s: string): Set<string> {
  return new Set(normalizeText(s).split(" ").filter((t) => t.length > 1 && !STOPWORDS.has(t)));
}

// jaccard overlap of significant tokens — resilient to word order and extra descriptors
function tokenOverlap(a: string, b: string): number {
  const sa = significantTokens(a);
  const sb = significantTokens(b);
  if (sa.size === 0 || sb.size === 0) return 0;
  let shared = 0;
  for (const t of sa) if (sb.has(t)) shared++;
  return shared / new Set([...sa, ...sb]).size;
}

// people: a denial and an auth letter often differ in casing/spacing, sometimes middle initials.
// matching on surname + at least one other shared token is enough and avoids false negatives.
export function namesMatch(a: string, b: string): boolean {
  const ta = normalizeText(a).split(" ").filter(Boolean);
  const tb = normalizeText(b).split(" ").filter(Boolean);
  if (ta.length === 0 || tb.length === 0) return false;
  const surnameMatch = ta[ta.length - 1] === tb[tb.length - 1];
  return surnameMatch && tokenOverlap(a, b) >= 0.3;
}

// providers carry org noise: "Center", "Imaging", "LLC". strip it, then require strong overlap.
const PROVIDER_NOISE = new Set(["center", "imaging", "medical", "llc", "inc", "clinic", "hospital", "health", "radiology", "associates"]);

export function providersMatch(a: string, b: string): boolean {
  const strip = (s: string) => new Set([...significantTokens(s)].filter((t) => !PROVIDER_NOISE.has(t)));
  const sa = strip(a);
  const sb = strip(b);
  if (sa.size === 0 || sb.size === 0) return tokenOverlap(a, b) >= 0.5;
  let shared = 0;
  for (const t of sa) if (sb.has(t)) shared++;
  return shared / Math.min(sa.size, sb.size) >= 0.6;
}

// services: "Knee MRI" and "MRI, Left Knee" share the tokens that matter (mri, knee).
// require the imaging modality to match AND some body-part overlap.
const MODALITIES = ["mri", "ct", "pet", "xray", "ultrasound", "mammogram", "echocardiogram"];

export function servicesMatch(a: string, b: string): boolean {
  const na = normalizeText(a).replace("x ray", "xray");
  const nb = normalizeText(b).replace("x ray", "xray");
  const modA = MODALITIES.find((m) => na.includes(m));
  const modB = MODALITIES.find((m) => nb.includes(m));
  if (modA && modB) return modA === modB && tokenOverlap(a, b) >= 0.25;
  // no recognized modality — fall back to plain overlap
  return tokenOverlap(a, b) >= 0.5;
}

// dates arrive as ISO, US slashes, or "Month D, YYYY". parse all three into a comparable value.
const MONTHS: Record<string, number> = {
  january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
  july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
};

export function parseDate(s: string): Date | null {
  const trimmed = s.trim();

  const iso = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));

  const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) return new Date(Number(slash[3]), Number(slash[1]) - 1, Number(slash[2]));

  const words = normalizeText(trimmed).match(/^([a-z]+) (\d{1,2}) (\d{4})$/);
  if (words && words[1] in MONTHS) return new Date(Number(words[3]), MONTHS[words[1]], Number(words[2]));

  return null;
}

// inclusive — a service on the last valid day is still covered
export function dateInRange(date: Date, from: Date, to: Date): boolean {
  const d = date.getTime();
  return d >= from.getTime() && d <= to.getTime();
}

// "2026-07-02" -> "July 2, 2026" for anything user-facing. leaves unparseable input alone.
export function formatDate(s: string): string {
  const d = parseDate(s);
  return d ? d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : s;
}

export function parseMoney(s: string): number {
  return Number(s.replace(/[^0-9.]/g, ""));
}
