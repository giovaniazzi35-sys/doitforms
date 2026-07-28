"use client";

import { useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

/**
 * Injects the Meta (Facebook) Pixel base code for a given pixel id and fires
 * PageView on mount. Additional events (Lead, ViewContent, custom) are fired
 * imperatively via the helpers below from the form renderer.
 */
export function MetaPixel({
  pixelId,
  firePageView = true,
}: {
  pixelId?: string | null;
  firePageView?: boolean;
}) {
  useEffect(() => {
    if (!pixelId) return;
    if (firePageView) fbqTrack("PageView");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pixelId]);

  if (!pixelId) return null;

  return (
    <Script id={`meta-pixel-${pixelId}`} strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
      `}
    </Script>
  );
}

export function fbqTrack(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (params) window.fbq("track", event, params);
  else window.fbq("track", event);
}

export function fbqTrackCustom(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  if (params) window.fbq("trackCustom", event, params);
  else window.fbq("trackCustom", event);
}
