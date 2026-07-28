import { NextResponse } from "next/server";

/**
 * Meta Conversions API (server-side) scaffold.
 *
 * This route is intentionally disabled by default. To enable server-side
 * deduplicated events (recommended alongside the browser Pixel), set the
 * META_CAPI_ACCESS_TOKEN env var and POST here from the form renderer with the
 * event payload. It forwards to Meta's Graph API using the same event_id as the
 * browser event so Meta can deduplicate.
 *
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
 */
export async function POST(request: Request) {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json(
      { ok: false, disabled: true, reason: "META_CAPI_ACCESS_TOKEN not set" },
      { status: 200 },
    );
  }

  try {
    const body = await request.json();
    const { pixelId, eventName, eventId, userData, customData, eventSourceUrl } =
      body ?? {};
    if (!pixelId || !eventName) {
      return NextResponse.json({ ok: false, reason: "missing pixelId/eventName" }, { status: 400 });
    }

    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: eventName,
              event_time: Math.floor(Date.now() / 1000),
              event_id: eventId,
              action_source: "website",
              event_source_url: eventSourceUrl,
              user_data: userData ?? {},
              custom_data: customData ?? {},
            },
          ],
        }),
      },
    );
    const json = await res.json();
    return NextResponse.json({ ok: res.ok, meta: json }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { ok: false, reason: e instanceof Error ? e.message : "error" },
      { status: 500 },
    );
  }
}
