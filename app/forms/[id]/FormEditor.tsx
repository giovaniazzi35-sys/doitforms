"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/Logo";
import type { DoitForm, FormField, FieldType } from "@/lib/types";
import {
  addField,
  updateField,
  deleteField,
  reorderFields,
  publishForm,
  updateForm,
} from "./actions";
import { StepList } from "@/components/editor/StepList";
import { FieldEditor } from "@/components/editor/FieldEditor";
import { FormRenderer } from "@/components/FormRenderer";
import { OptionsTab } from "@/components/editor/OptionsTab";
import { ShareTab } from "@/components/editor/ShareTab";
import { ResponsesTab } from "@/components/editor/ResponsesTab";

type Tab = "editor" | "opcoes" | "compartilhar" | "respostas";

const TAB_LABELS: Record<Tab, string> = {
  editor: "Editor",
  opcoes: "Opções",
  compartilhar: "Compartilhar",
  respostas: "Respostas",
};

export function FormEditor({
  initialForm,
  initialFields,
}: {
  initialForm: DoitForm;
  initialFields: FormField[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "editor";

  const [tab, setTab] = useState<Tab>(
    (["editor", "opcoes", "compartilhar", "respostas"].includes(initialTab)
      ? initialTab
      : "editor") as Tab,
  );
  const [form, setForm] = useState<DoitForm>(initialForm);
  const [fields, setFields] = useState<FormField[]>(
    [...initialFields].sort((a, b) => a.position - b.position),
  );
  const [selectedId, setSelectedId] = useState<string>(
    initialFields[0]?.id ?? "",
  );
  const [publishing, setPublishing] = useState(false);
  const [dirty, setDirty] = useState(initialForm.has_draft);

  const selected = fields.find((f) => f.id === selectedId) || fields[0];
  const selectedIndex = fields.findIndex((f) => f.id === selected?.id);

  const patchForm = useCallback(
    (patch: Partial<DoitForm>) => {
      setForm((f) => ({ ...f, ...patch }));
      setDirty(true);
    },
    [],
  );

  async function persistForm(patch: Record<string, unknown>) {
    patchForm(patch as Partial<DoitForm>);
    await updateForm(form.id, patch);
  }

  async function handleAddField(type: FieldType) {
    // insert before the trailing thank-you screen if present
    const lastIsThankyou = fields[fields.length - 1]?.type === "thankyou";
    const position = lastIsThankyou ? fields.length - 1 : fields.length;
    const created = await addField(form.id, type, position);
    const next = [...fields];
    next.splice(position, 0, created);
    // normalize positions locally
    const renum = next.map((f, i) => ({ ...f, position: i }));
    setFields(renum);
    setSelectedId(created.id);
    setDirty(true);
    await reorderFields(
      form.id,
      renum.map((f) => f.id),
    );
  }

  function patchField(id: string, patch: Partial<FormField>) {
    setFields((fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)));
    setDirty(true);
  }

  async function saveField(id: string, patch: Record<string, unknown>) {
    patchField(id, patch as Partial<FormField>);
    await updateField(form.id, id, patch);
  }

  async function handleDeleteField(id: string) {
    const target = fields.find((f) => f.id === id);
    if (target && (target.type === "welcome" || target.type === "thankyou")) {
      if (
        !confirm(
          "Remover a tela de " +
            (target.type === "welcome" ? "boas-vindas" : "agradecimento") +
            "?",
        )
      )
        return;
    }
    const remaining = fields.filter((f) => f.id !== id);
    setFields(remaining);
    if (selectedId === id) setSelectedId(remaining[0]?.id ?? "");
    await deleteField(form.id, id);
  }

  async function move(id: string, dir: -1 | 1) {
    const idx = fields.findIndex((f) => f.id === id);
    const target = idx + dir;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    [next[idx], next[target]] = [next[target], next[idx]];
    const renum = next.map((f, i) => ({ ...f, position: i }));
    setFields(renum);
    setDirty(true);
    await reorderFields(
      form.id,
      renum.map((f) => f.id),
    );
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      await publishForm(form.id);
      setForm((f) => ({ ...f, published: true, has_draft: false }));
      setDirty(false);
    } finally {
      setPublishing(false);
    }
  }

  function switchTab(t: Tab) {
    setTab(t);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", t);
    window.history.replaceState({}, "", url.toString());
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      {/* top bar */}
      <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-700">
            ←
          </Link>
          <input
            value={form.title}
            onChange={(e) => patchForm({ title: e.target.value })}
            onBlur={(e) => updateForm(form.id, { title: e.target.value })}
            className="w-56 truncate rounded px-1 text-sm font-semibold text-slate-800 outline-none focus:bg-slate-50"
          />
        </div>

        <nav className="flex items-center gap-1">
          {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                tab === t
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {form.published && (
            <a
              href={`/f/${form.slug}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              👁 Ver
            </a>
          )}
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="rounded-lg bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {publishing
              ? "Publicando..."
              : dirty || !form.published
                ? "Publicar"
                : "Publicado ✓"}
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === "editor" && (
          <div className="flex h-full">
            <StepList
              fields={fields}
              selectedId={selected?.id ?? ""}
              onSelect={setSelectedId}
              onAdd={handleAddField}
              onMove={move}
              onDelete={handleDeleteField}
            />
            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto lg:grid-cols-2">
              <div className="thin-scroll overflow-y-auto border-r border-slate-100 bg-white p-6">
                {selected ? (
                  <FieldEditor
                    key={selected.id}
                    field={selected}
                    onChange={(patch) => patchField(selected.id, patch)}
                    onSave={(patch) => saveField(selected.id, patch)}
                  />
                ) : (
                  <p className="text-sm text-slate-400">
                    Adicione um campo para começar.
                  </p>
                )}
              </div>
              <div className="hidden bg-slate-100 lg:block">
                <div className="h-full overflow-hidden">
                  <div className="mx-auto flex h-full max-w-md items-center justify-center p-4">
                    <div className="h-[90%] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                      <FormRenderer
                        form={form}
                        fields={fields}
                        mode="preview"
                        forcedIndex={selectedIndex}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "opcoes" && (
          <div className="h-full overflow-y-auto">
            <OptionsTab
              form={form}
              onPatch={patchForm}
              onPersist={persistForm}
              onDeleted={() => router.push("/dashboard")}
            />
          </div>
        )}

        {tab === "compartilhar" && (
          <div className="h-full overflow-y-auto">
            <ShareTab form={form} hasDraft={dirty} />
          </div>
        )}

        {tab === "respostas" && (
          <div className="h-full overflow-hidden">
            <ResponsesTab form={form} fields={fields} />
          </div>
        )}
      </div>
    </div>
  );
}
