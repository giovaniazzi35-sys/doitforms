"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Update the signed-in user's own integration defaults. RLS on df_profiles
 * restricts writes to the owner's row, so users can never touch (or read)
 * another user's pixel or CAPI token.
 */
export async function updateIntegrations(patch: {
  meta_pixel_id?: string | null;
  meta_capi_token?: string | null;
  ga_id?: string | null;
  gtm_id?: string | null;
  tiktok_pixel_id?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");

  const clean = Object.fromEntries(
    Object.entries(patch).map(([k, v]) => [
      k,
      typeof v === "string" && v.trim() === "" ? null : v,
    ]),
  );

  const { error } = await supabase
    .from("df_profiles")
    .update(clean)
    .eq("id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/conta");
}
