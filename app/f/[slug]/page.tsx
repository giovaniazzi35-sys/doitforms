import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FormRenderer } from "@/components/FormRenderer";
import { MetaPixel } from "@/components/MetaPixel";
import { TrackingScripts } from "@/components/TrackingScripts";
import type { DoitForm, FormField, PublicTracking } from "@/lib/types";

export const dynamic = "force-dynamic";

interface PublicFormPayload {
  form: DoitForm;
  fields: FormField[];
  tracking: PublicTracking;
}

/**
 * Public form data goes exclusively through the df_get_public_form RPC
 * (SECURITY DEFINER). There is no table-level SELECT policy exposing df_forms
 * or df_form_fields to anon/authenticated — this is the only door in, and it
 * only ever returns ONE published form's own data (never another user's).
 */
async function getForm(slug: string): Promise<PublicFormPayload | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("df_get_public_form", {
    p_slug: slug,
  });
  if (error || !data || !data.form) return null;

  return {
    form: data.form as DoitForm,
    fields: (data.fields || []) as FormField[],
    tracking: (data.tracking || {}) as PublicTracking,
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
