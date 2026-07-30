import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormRenderer } from "@/components/FormRenderer";
import { MetaPixel } from "@/components/MetaPixel";
import { TrackingScripts } from "@/components/TrackingScripts";
import type { DoitForm, FormField, PublicTracking } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function EmbedFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  // Public form data goes exclusively through the df_get_public_form RPC —
  // there is no table-level SELECT policy on df_forms/df_form_fields for
  // anon/authenticated, so this is the only door in and it never leaks
  // another user's forms.
  const { data, error } = await supabase.rpc("df_get_public_form", {
    p_slug: slug,
  });
  if (error || !data || !data.form) notFound();

  const form = data.form as DoitForm;
  const fields = (data.fields || []) as FormField[];
  const tracking = (data.tracking || {}) as PublicTracking;
  const pageViewEventId = crypto.randomUUID();

  return (
    <div className="min-h-screen">
      <MetaPixel
        pixelId={tracking.pixel_id}
        firePageView={true}
        pageViewEventId={pageViewEventId}
      />
      <TrackingScripts
        gaId={tracking.ga_id}
        gtmId={tracking.gtm_id}
        tiktokId={tracking.tiktok_pixel_id}
      />
      <FormRenderer
        form={form}
        fields={fields}
        mode="live"
        pixelId={tracking.pixel_id}
        pageViewEventId={pageViewEventId}
      />
    </div>
  );
}
