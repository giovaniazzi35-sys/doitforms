"use client";

import Script from "next/script";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

/**
 * Injects the Meta (Facebook) Pixel base code for a given pixel id. PageView
 * fires inside the bootstrap itself (guaranteed after init); pass
 * `pageViewEventId` to deduplicate against the server-side Conversions API
 * PageView. Other events are fired imperatively via the helpers below.
 */
export function MetaPixel({
  pixelId,
  firePageView = true,
  pageViewEventId,
}: {
  pixelId?: string | null;
  firePageView?: boolean;
  pageViewEventId?: string;
}) {
  if (!pixelId) return null;

  const safePixelId = pixelId.replace(/[^0-9A-Za-z_-]/g, "");
  const safeEventId = (pageViewEventId || "").replace(/[^0-9A-Za-z-]/g, "");
  const pageViewCall = firePageView
    ? safeEventId
      ? `fbq('track', 'PageView', {}, { eventID: '${safeEventId}' });`
      : `fbq('track', 'PageView');`
    : "";

  return (
    <Script id={`meta-pixel-${safePixelId}`} strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${safePixelId}');
        ${pageViewCall}
      `}
    </Script>
  );
}

const STANDARD_EVENTS = new Set([
  "PageView",
  "ViewContent",
  "Lead",
  "CompleteRegistration",
  "Contact",
  "SubmitApplication",
  "Schedule",
  "StartTrial",
  "Subscribe",
  "AddToCart",
  "InitiateCheckout",
  "Purchase",
  "Search",
  "AddPaymentInfo",
  "AddToWishlist",
  "CustomizeProduct",
  "Donate",
  "FindLocation",
]);

/**
 * Fire a Meta Pixel event. Standard event names use `track`; anything else
 * falls back to `trackCustom`. `eventId` enables Conversions API dedup.
 */
export function fbqTrack(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string,
) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  const method = STANDARD_EVENTS.has(event) ? "track" : "trackCustom";
  if (eventId) window.fbq(method, event, params ?? {}, { eventID: eventId });
  else if (params) window.fbq(method, event, params);
  else window.fbq(method, event);
}

export function fbqTrackCustom(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string,
) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (eventId) window.fbq("trackCustom", event, params ?? {}, { eventID: eventId });
  else if (params) window.fbq("trackCustom", event, params);
  else window.fbq("trackCustom", event);
}
