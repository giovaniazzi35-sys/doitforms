"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { generateSlug } from "@/lib/slug";
import { DEFAULT_STYLE, DEFAULT_PIXEL_CONFIG } from "@/lib/types";
import type {
  FormField,
  FormSettings,
  ConversionTrigger,
} from "@/lib/types";

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
      title: "🚀 Bem-vindo! **Vamos começar?**",
      description:
        "🏆 **Rápido**: leva menos de 2 minutos\n📈 **Simples**: uma pergunta por vez\n✅ **Seguro**: seus dados ficam protegidos",
      required: false,
      options: [],
      config: { buttonText: "Começar →", align: "left" },
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

/**
 * Duplicate an existing form (owner only) into a fresh draft.
 *
 * Field ids are referenced from three places — per-option branching (`goTo`),
 * the conversion trigger and the duplicate-limit setting — so every copied
 * field gets a new id and all of those references are remapped. Without the
 * remap the copy's logic would silently point at the original's fields.
 * Responses are never copied.
 */
export async function duplicateForm(formId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: src, error: srcError } = await supabase
    .from("df_forms")
    .select("*")
    .eq("id", formId)
    .eq("user_id", user.id)
    .single();
  if (srcError || !src) throw new Error("Formulário não encontrado");

  const { data: srcFields, error: fieldsError } = await supabase
    .from("df_form_fields")
    .select("*")
    .eq("form_id", formId)
    .order("position", { ascending: true });
  if (fieldsError) throw new Error(fieldsError.message);

  const fields = (srcFields || []) as FormField[];

  // old field id -> new field id
  const idMap = new Map<string, string>();
  for (const f of fields) idMap.set(f.id, crypto.randomUUID());
  const remap = (id?: string | null) =>
    id && idMap.has(id) ? idMap.get(id)! : null;

  // Unique "(cópia)" title so the list stays readable after several copies.
  const base = (src.title || "Formulário").replace(/ \(cópia( \d+)?\)$/, "");
  const { data: siblings } = await supabase
    .from("df_forms")
    .select("title")
    .eq("user_id", user.id)
    .like("title", `${base} (cópia%`);
  const taken = new Set((siblings || []).map((s) => s.title));
  let title = `${base} (cópia)`;
  for (let n = 2; taken.has(title); n++) title = `${base} (cópia ${n})`;

  const trigger: ConversionTrigger = src.conversion_trigger || {
    type: "finish",
  };
  const settings: FormSettings = src.settings || {};

  const { data: copy, error: insertError } = await supabase
    .from("df_forms")
    .insert({
      user_id: user.id,
      title,
      slug: generateSlug(),
      // A copy always starts as an unpublished draft so the owner can tweak
      // it before it goes live on its own public URL.
      published: false,
      has_draft: true,
      style: src.style ?? DEFAULT_STYLE,
      settings: {
        ...settings,
        limitDuplicateFieldId: remap(settings.limitDuplicateFieldId),
      },
      pixel_id: src.pixel_id,
      pixel_config: src.pixel_config ?? DEFAULT_PIXEL_CONFIG,
      ga_id: src.ga_id,
      gtm_id: src.gtm_id,
      tiktok_pixel_id: src.tiktok_pixel_id,
      conversion_trigger:
        trigger.type === "field"
          ? { type: "field", fieldId: remap(trigger.fieldId) }
          : trigger,
      track_utm: src.track_utm,
      append_utm_to_links: src.append_utm_to_links,
    })
    .select("id")
    .single();

  if (insertError || !copy) {
    throw new Error(insertError?.message || "Falha ao duplicar formulário");
  }

  if (fields.length) {
    // NOTE: PostgREST bulk insert requires every object to share the same keys.
    const { error: copyFieldsError } = await supabase
      .from("df_form_fields")
      .insert(
        fields.map((f, i) => ({
          id: idMap.get(f.id)!,
          form_id: copy.id,
          position: i,
          type: f.type,
          title: f.title,
          description: f.description,
          required: f.required,
          options: (f.options || []).map((o) => ({
            ...o,
            // "submit" is a sentinel, not a field id — keep it as-is.
            goTo: o.goTo === "submit" ? "submit" : remap(o.goTo),
          })),
          config: f.config ?? {},
        })),
      );
    if (copyFieldsError) {
      // Roll back so a half-copied form never shows up in the dashboard.
      await supabase.from("df_forms").delete().eq("id", copy.id);
      throw new Error(copyFieldsError.message);
    }
  }

  revalidatePath("/dashboard");
  redirect(`/forms/${copy.id}`);
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
