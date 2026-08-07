/**
 * Incremental / partial response saving. Posts directly to the PostgREST RPC
 * (df_save_response) so it works both during interaction and on page unload
 * (keepalive). Fire-and-forget: tracking/persistence must never block or break
 * the form.
 */
export interface SaveArgs {
  slug: string;
  submissionId: string;
  completed: boolean;
  disqualified: boolean;
  tracking: Record<string, unknown>;
  answers: unknown[];
  keepalive?: boolean;
}

export async function saveResponse(args: SaveArgs): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  try {
    const res = await fetch(`${url}/rest/v1/rpc/df_save_response`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        p_slug: args.slug,
        p_submission_id: args.submissionId,
        p_completed: args.completed,
        p_disqualified: args.disqualified,
        p_tracking: args.tracking,
        p_answers: args.answers,
      }),
      keepalive: args.keepalive ?? false,
    });
    return res.ok;
  } catch {
    return false;
  }
}
