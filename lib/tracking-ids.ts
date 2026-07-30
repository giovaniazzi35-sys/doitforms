/**
 * Users often paste the whole tag snippet Google/Meta gives them instead of the
 * bare id. These helpers extract the id from either the raw id or a full pasted
 * snippet, so the fields are foolproof.
 */

export function extractGtmId(input: string): string {
  if (!input) return "";
  const m = input.match(/GTM-[A-Z0-9]+/i);
  return (m ? m[0] : input).trim().toUpperCase();
}

export function extractGaId(input: string): string {
  if (!input) return "";
  // GA4 measurement id (G-XXXX) or legacy UA-XXXX / AW-XXXX.
  const m = input.match(/\b((?:G|UA|AW)-[A-Z0-9-]+)\b/i);
  return (m ? m[1] : input).trim().toUpperCase();
}

export function extractPixelId(input: string): string {
  if (!input) return "";
  // Prefer the id inside fbq('init','...') when a full snippet is pasted.
  const init = input.match(/fbq\(\s*['"]init['"]\s*,\s*['"](\d{6,})['"]/);
  if (init) return init[1];
  const digits = input.match(/\d{9,}/);
  return (digits ? digits[0] : input).trim();
}

export function extractTikTokId(input: string): string {
  if (!input) return "";
  // TikTok pixel id is an alphanumeric token; pull it from ttq.load('...') too.
  const load = input.match(/ttq\.load\(\s*['"]([A-Z0-9]+)['"]/i);
  if (load) return load[1];
  return input.trim();
}
