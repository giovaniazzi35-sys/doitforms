"use client";

import { useState } from "react";
import { updateIntegrations } from "./actions";
import type { ProfileIntegrations } from "@/lib/types";

export function ContaClient({
  email,
  initial,
}: {
  email: string;
  initial: ProfileIntegrations;
}) {
  const [values, setValues] = useState<ProfileIntegrations>(initial);
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ProfileIntegrations>(
    key: K,
    value: ProfileIntegrations[K],
  ) {
    setValues((v) => ({ ...v, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateIntegrations(values);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">Conta e integrações</h1>
      <p className="mt-1 text-sm text-slate-500">
        Conectado como <strong>{email}</strong>. Os códigos abaixo são{" "}
        <strong>seus</strong> — cada usuário instala o próprio pixel e nunca
        compartilha dados com outras contas.
      </p>

      <section className="mt-8 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Meta (Facebook) — Pixel &amp; API de Conversão
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Usados como padrão em todos os seus formulários (você pode
          sobrescrever o Pixel por formulário na aba Integrações do editor).
        </p>

        <div className="mt-5 space-y-4">
          <Field
            label="ID do Pixel do Meta"
            hint="Encontre em Gerenciador de Eventos → Fontes de dados."
            value={values.meta_pixel_id ?? ""}
            onChange={(v) => set("meta_pixel_id", v)}
            placeholder="Ex: 1218447823340395"
          />
          <div>
            <Field
              label="Token da API de Conversão (opcional)"
              hint="Gerado no Gerenciador de Eventos → Configurações → API de Conversões. Fica guardado com segurança e nunca aparece no seu formulário público."
              value={values.meta_capi_token ?? ""}
              onChange={(v) => set("meta_capi_token", v)}
              placeholder="EAAG..."
              type={showToken ? "text" : "password"}
            />
            <button
              type="button"
              onClick={() => setShowToken((s) => !s)}
              className="mt-1 text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              {showToken ? "Ocultar token" : "Mostrar token"}
            </button>
          </div>
          <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
            Com o token preenchido, cada evento (PageView, ViewContent, Lead,
            EndForm) também é enviado pelo servidor via API de Conversão, com
            deduplicação automática (event_id compartilhado com o Pixel do
            navegador).
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          Outras métricas (padrão da conta)
        </h2>
        <div className="mt-5 space-y-4">
          <Field
            label="Google Analytics (ID de métrica)"
            value={values.ga_id ?? ""}
            onChange={(v) => set("ga_id", v)}
            placeholder="G-XXXXXXXXXX"
          />
          <Field
            label="Google Tag Manager (ID do container)"
            value={values.gtm_id ?? ""}
            onChange={(v) => set("gtm_id", v)}
            placeholder="GTM-XXXXXXX"
          />
          <Field
            label="TikTok Events Manager ID"
            value={values.tiktok_pixel_id ?? ""}
            onChange={(v) => set("tiktok_pixel_id", v)}
            placeholder="CXXXXXXXXXXXXXXXXX"
          />
        </div>
      </section>

      {error && (
        <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
          {error}
        </p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {saving ? "Salvando..." : "Salvar integrações"}
        </button>
        {saved && (
          <span className="text-sm font-medium text-emerald-600">
            ✓ Salvo com sucesso
          </span>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {hint && <span className="mb-1.5 block text-xs text-slate-400">{hint}</span>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400"
      />
    </label>
  );
}
