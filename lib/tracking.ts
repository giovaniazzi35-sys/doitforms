export interface TrackingData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  gclid?: string;
  fbclid?: string;
  fbp?: string;
  fbc?: string;
  referrer?: string;
  user_agent?: string;
}

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "fbclid",
] as const;

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"),
  );
  return match ? decodeURIComponent(match[1]) : undefined;
}

/**
 * Collect UTM params, gclid, fbclid from the URL plus Meta's _fbp / _fbc cookies.
 * Mirrors respondi's "Rastreio e variáveis personalizadas" capture.
 */
export function collectTracking(): TrackingData {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  const data: TrackingData = {};

  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) (data as Record<string, string>)[key] = value;
  }

  // Meta browser cookies (set by the Pixel) improve match quality.
  const fbp = readCookie("_fbp");
  const fbc = readCookie("_fbc");
  if (fbp) data.fbp = fbp;
  // If fbclid present but _fbc not yet set, synthesize a valid fbc value.
  if (fbc) {
    data.fbc = fbc;
  } else if (data.fbclid) {
    data.fbc = `fb.1.${Date.now()}.${data.fbclid}`;
  }

  if (document.referrer) data.referrer = document.referrer;
  data.user_agent = navigator.userAgent;

  return data;
}

/** Append captured UTM params to an outgoing (redirect) URL. */
export function appendUtmToUrl(url: string, tracking: TrackingData): string {
  try {
    const u = new URL(url);
    for (const key of UTM_KEYS) {
      const v = (tracking as Record<string, string | undefined>)[key];
      if (v && !u.searchParams.has(key)) u.searchParams.set(key, v);
    }
    return u.toString();
  } catch {
    return url;
  }
}
