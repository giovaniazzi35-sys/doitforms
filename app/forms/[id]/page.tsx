import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FormEditor } from "./FormEditor";
import type { DoitForm, FormField } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function FormEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: form } = await supabase
    .from("df_forms")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!form) notFound();

  const { data: fields } = await supabase
    .from("df_form_fields")
    .select("*")
    .eq("form_id", id)
    .order("position", { ascending: true });

  return (
    <FormEditor
      initialForm={form as DoitForm}
      initialFields={(fields || []) as FormField[]}
    />
  );
}
