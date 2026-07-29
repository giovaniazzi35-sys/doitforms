import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FormRenderer } from "@/components/FormRenderer";
import { MetaPixel } from "@/components/MetaPixel";
import { TrackingScripts } from "@/components/TrackingScripts";
import type { DoitForm, FormField, PublicTracking } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getForm(slug: string) {
  const supabase = await createClient();
  const { data: form } = await supabase
    .from("df_forms")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (!form) return null;

  const { data: fields } = await supabase
    .from("df_form_fields")
    .select("*")
    .eq("form_id", form.id)
    .order("position", { ascending: true });

  // Effective tracking ids: form override or the owner's account default.
  // The RPC only exposes non-secret ids (never the CAPI token).
  const { data: trackingData } = await supabase.rpc("df_public_tracking", {
    p_slug: slug,
  });

  return {
    form: form as DoitForm,
    fields: (fields || []) as FormField[],
    tracking: (trackingData || {}) as PublicTracking,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getForm(slug);
  if (!data) return { title: "Formulário não encontrado" };
  return {
    title: data.form.settings?.shareTitle || data.form.title,
    description: data.form.settings?.shareDescription,
  };
}

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getForm(slug);
  if (!data) notFound();

  const pageViewEventId = crypto.randomUUID();

  return (
    <div className="min-h-screen">
      <MetaPixel
        pixelId={data.tracking.pixel_id}
        firePageView={true}
        pageViewEventId={pageViewEventId}
      />
      <TrackingScripts
        gaId={data.tracking.ga_id}
        gtmId={data.tracking.gtm_id}
        tiktokId={data.tracking.tiktok_pixel_id}
      />
      <FormRenderer
        form={data.form}
        fields={data.fields}
        mode="live"
        pixelId={data.tracking.pixel_id}
        pageViewEventId={pageViewEventId}
      />
    </div>
  );
}
