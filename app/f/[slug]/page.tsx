import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FormRenderer } from "@/components/FormRenderer";
import { MetaPixel } from "@/components/MetaPixel";
import type { DoitForm, FormField } from "@/lib/types";

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

  return { form: form as DoitForm, fields: (fields || []) as FormField[] };
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

  return (
    <div className="min-h-screen">
      <MetaPixel pixelId={data.form.pixel_id} firePageView={true} />
      <FormRenderer form={data.form} fields={data.fields} mode="live" />
    </div>
  );
}
