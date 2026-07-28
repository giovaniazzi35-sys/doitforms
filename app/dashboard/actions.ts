"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/slug";
import { DEFAULT_STYLE, DEFAULT_PIXEL_CONFIG } from "@/lib/types";

export async function createForm(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const title = (formData.get("title") as string)?.trim() || "Novo formulário";

  const { data: form, error } = await supabase
    .from("df_forms")
    .insert({
      user_id: user.id,
      title,
      slug: generateSlug(),
      style: DEFAULT_STYLE,
      pixel_config: DEFAULT_PIXEL_CONFIG,
      settings: {
        notifications: { mode: "complete", emailAlert: true, alertEmail: user.email },
        removeBranding: false,
      },
    })
    .select("id")
    .single();

  if (error || !form) {
    throw new Error(error?.message || "Falha ao criar formulário");
  }

  // Seed with a welcome screen, one question, and a thank-you screen.
  // NOTE: PostgREST bulk insert requires every object to share the same keys,
  // so each row lists the full column set explicitly.
  const { error: seedError } = await supabase.from("df_form_fields").insert([
    {
      form_id: form.id,
      position: 0,
      type: "welcome",
      title: "🚀 Bem-vindo! Vamos começar?",
      description: "Responda algumas perguntas rápidas para continuar.",
      required: false,
      options: [],
      config: { buttonText: "Começar →" },
    },
    {
      form_id: form.id,
      position: 1,
      type: "short_text",
      title: "Qual o seu nome?",
      description: "",
      required: true,
      options: [],
      config: { placeholder: "Digite seu nome" },
    },
    {
      form_id: form.id,
      position: 2,
      type: "thankyou",
      title: "Obrigado pelo interesse! 🎉",
      description: "Recebemos suas respostas. Em breve entraremos em contato.",
      required: false,
      options: [],
      config: {},
    },
  ]);
  if (seedError) throw new Error(seedError.message);

  revalidatePath("/dashboard");
  redirect(`/forms/${form.id}`);
}

export async function deleteForm(formId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("df_forms")
    .delete()
    .eq("id", formId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
}
