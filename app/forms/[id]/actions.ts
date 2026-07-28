"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { FieldType, FormField } from "@/lib/types";
import { FIELD_TYPE_LABELS } from "@/lib/types";

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Não autenticado");
  return { supabase, user };
}

export async function updateForm(
  formId: string,
  patch: Record<string, unknown>,
) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("df_forms")
    .update({ ...patch, has_draft: true })
    .eq("id", formId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath(`/forms/${formId}`);
}

export async function addField(formId: string, type: FieldType, position: number) {
  const { supabase } = await requireUser();
  const defaults = defaultForType(type);
  const { data, error } = await supabase
    .from("df_form_fields")
    .insert({ form_id: formId, type, position, ...defaults })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  await supabase.from("df_forms").update({ has_draft: true }).eq("id", formId);
  revalidatePath(`/forms/${formId}`);
  return data as FormField;
}

export async function updateField(
  formId: string,
  fieldId: string,
  patch: Record<string, unknown>,
) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("df_form_fields")
    .update(patch)
    .eq("id", fieldId);
  if (error) throw new Error(error.message);
  await supabase.from("df_forms").update({ has_draft: true }).eq("id", formId);
  revalidatePath(`/forms/${formId}`);
}

export async function deleteField(formId: string, fieldId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("df_form_fields")
    .delete()
    .eq("id", fieldId);
  if (error) throw new Error(error.message);
  await supabase.from("df_forms").update({ has_draft: true }).eq("id", formId);
  revalidatePath(`/forms/${formId}`);
}

export async function reorderFields(formId: string, orderedIds: string[]) {
  const { supabase } = await requireUser();
  await Promise.all(
    orderedIds.map((id, i) =>
      supabase.from("df_form_fields").update({ position: i }).eq("id", id),
    ),
  );
  await supabase.from("df_forms").update({ has_draft: true }).eq("id", formId);
  revalidatePath(`/forms/${formId}`);
}

export async function publishForm(formId: string) {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("df_forms")
    .update({ published: true, has_draft: false })
    .eq("id", formId)
    .eq("user_id", user.id);
  if (error) throw new Error(error.message);
  revalidatePath(`/forms/${formId}`);
}

export async function deleteResponse(formId: string, responseId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("df_responses")
    .delete()
    .eq("id", responseId);
  if (error) throw new Error(error.message);
  revalidatePath(`/forms/${formId}`);
}

export async function deleteAllResponses(formId: string) {
  const { supabase } = await requireUser();
  const { error } = await supabase
    .from("df_responses")
    .delete()
    .eq("form_id", formId);
  if (error) throw new Error(error.message);
  revalidatePath(`/forms/${formId}`);
}

export async function deleteFormAndRedirect(formId: string) {
  const { supabase, user } = await requireUser();
  await supabase
    .from("df_forms")
    .delete()
    .eq("id", formId)
    .eq("user_id", user.id);
  revalidatePath("/dashboard");
}

function defaultForType(type: FieldType): Partial<FormField> {
  const label = FIELD_TYPE_LABELS[type];
  switch (type) {
    case "welcome":
      return {
        title: "Bem-vindo!",
        description: "Vamos começar?",
        config: { buttonText: "Começar →" },
      };
    case "thankyou":
      return {
        title: "Obrigado! 🎉",
        description: "Recebemos suas respostas.",
        config: {},
      };
    case "multiple_choice":
      return {
        title: "Nova pergunta de múltipla escolha",
        required: true,
        options: [
          { id: crypto.randomUUID(), label: "Opção 1" },
          { id: crypto.randomUUID(), label: "Opção 2" },
        ],
      };
    case "phone":
      return {
        title: "Qual o seu número de WhatsApp?",
        required: true,
        config: { placeholder: "(00) 00000-0000" },
      };
    case "email":
      return {
        title: "Qual o seu e-mail?",
        required: true,
        config: { placeholder: "voce@email.com" },
      };
    case "long_text":
      return {
        title: "Conte mais para a gente",
        config: { placeholder: "Escreva aqui..." },
      };
    default:
      return {
        title: `Nova pergunta (${label})`,
        required: true,
        config: { placeholder: "Sua resposta" },
      };
  }
}
