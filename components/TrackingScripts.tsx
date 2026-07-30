"use client";

import Script from "next/script";

/**
 * Injects the owner's analytics tags on public forms: Google Analytics 4,
 * Google Tag Manager and TikTok Pixel. Minimal loaders — each queues calls
 * and loads the official SDK for the given container/measurement id.
 */
export function TrackingScripts({
  gaId,
  gtmId,
  tiktokId,
}: {
  gaId?: string | null;
  gtmId?: string | null;
  tiktokId?: string | null;
}) {
  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`}
            strategy="afterInteractive"
          />
          <Script id="df-ga4" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){ dataLayer.push(arguments); }
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      )}

      {gtmId && (
        <>
          <Script id="df-gtm" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
              (function(){
                var s = document.createElement('script');
                s.async = true;
                s.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent('${gtmId}');
                document.head.appendChild(s);
              })();
            `}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-sync-scripts */}
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(gtmId)}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="gtm"
            />
          </noscript>
        </>
      )}

      {tiktokId && (
        <Script id="df-ttq" strategy="afterInteractive">
          {`
            (function(w){
              var t = w.ttq = w.ttq || [];
              if (t.loaded) return;
              var methods = ['page','track','identify','ready','on','off','once','alias','group','enableCookie','disableCookie'];
              methods.forEach(function(m){
                t[m] = t[m] || function(){ t.push([m].concat([].slice.call(arguments))); };
              });
              t.load = function(id){
                t._i = id;
                var s = document.createElement('script');
                s.async = true;
                s.src = 'https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=' + encodeURIComponent(id) + '&lib=ttq';
                document.head.appendChild(s);
              };
              t.loaded = true;
              t.load('${tiktokId}');
              t.page();
            })(window);
          `}
        </Script>
      )}
    </>
  );
}
