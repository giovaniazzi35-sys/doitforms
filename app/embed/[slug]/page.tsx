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
  const { data: form } = await supabase
    .from("df_forms")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (!form) notFound();

  const { data: fields } = await supabase
    .from("df_form_fields")
    .select("*")
    .eq("form_id", form.id)
    .order("position", { ascending: true });

  const { data: trackingData } = await supabase.rpc("df_public_tracking", {
    p_slug: slug,
  });
  const tracking = (trackingData || {}) as PublicTracking;
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
        form={form as DoitForm}
        fields={(fields || []) as FormField[]}
        mode="live"
        pixelId={tracking.pixel_id}
        pageViewEventId={pageViewEventId}
      />
    </div>
  );
}
