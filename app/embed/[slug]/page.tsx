import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormRenderer } from "@/components/FormRenderer";
import { MetaPixel } from "@/components/MetaPixel";
import type { DoitForm, FormField } from "@/lib/types";

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

  return (
    <div className="min-h-screen">
      <MetaPixel pixelId={(form as DoitForm).pixel_id} firePageView={true} />
      <FormRenderer
        form={form as DoitForm}
        fields={(fields || []) as FormField[]}
        mode="live"
      />
    </div>
  );
}
