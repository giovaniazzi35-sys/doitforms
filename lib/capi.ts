/**
 * Fire a Meta Conversions API event via the df-capi Supabase Edge Function.
 * The function resolves the form owner's pixel id + CAPI token server-side;
 * no secret ever reaches the browser. Fire-and-forget: tracking must never
 * block or break the form experience.
 */
export function sendCapiEvent(args: {
  slug: string;
  eventName: string;
  eventId?: string;
  fbp?: string;
  fbc?: string;
  customData?: Record<string, unknown>;
}): void {
  if (typeof window === "undefined") return;
  try {
    void fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/df-capi`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        },
        body: JSON.stringify({
          ...args,
          eventSourceUrl: window.location.href,
        }),
        keepalive: true,
      },
    ).catch(() => {});
  } catch {
    // never let tracking break the form
  }
}
