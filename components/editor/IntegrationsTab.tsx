"use client";

import Link from "next/link";
import type { DoitForm, FormField, ConversionTrigger } from "@/lib/types";
import {
  extractGtmId,
  extractGaId,
  extractPixelId,
  extractTikTokId,
} from "@/lib/tracking-ids";

const FIELD_ICONS: Record<string, string> = {
  welcome: "👋",
  short_text: "✏️",
  long_text: "📝",
  email: "📧",
  phone: "📱",
  multiple_choice: "☑️",
  thankyou: "🎉",
};

const FIELD_LABELS: Record<string, string> = {
  welcome: "Boas-vindas",
  short_text: "Resposta curta",
  long_text: "Texto longo",
  email: "E-mail",
  phone: "Telefone",
  multiple_choice: "Múltipla escolha",
  thankyou: "Agradecimento",
};

const CRM_INTEGRATIONS = [
  {
    name: "Active Campaign",
    desc: "Envie novos contatos automaticamente para o Active Campaign",
  },
  { name: "Kommo", desc: "Envie novos contatos automaticamente para a Kommo" },
  {
    name: "RD Station CRM",
    desc: "Envie novos contatos automaticamente para o RD Station CRM",
  },
  {
    name: "Google Planilha",
    desc: "Envie automaticamente novas respostas recebidas diretamente para uma planilha do Google",
  },
];

export function IntegrationsTab({
  form,
  fields,
  hasDraft,
  onPersist,
}: {
  form: DoitForm;
  fields: FormField[];
  hasDraft: boolean;
  onPersist: (patch: Record<string, unknown>) => void | Promise<void>;
}) {
  const trigger: ConversionTrigger = form.conversion_trigger || {
    type: "finish",
  };
  const allFields = [...fields].sort((a, b) => a.position - b.position);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Integrações</h1>
      <p className="mt-1 text-sm text-slate-500">
        Integre seu formulário com outros serviços online.
      </p>

      {hasDraft && (
        <div className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Você possui alterações ainda não publicadas no seu formulário.{" "}
          <strong>Publique</strong> para que as integrações usem a versão mais
          recente.
        </div>
      )}

      {/* CRM/no-code integrations — visual parity; wiring comes with providers */}
      <section className="mt-8 space-y-5">
        {CRM_INTEGRATIONS.map((i) => (
          <div key={i.name} className="flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                {i.name}
                <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-600">
                  PRO
                </span>
              </p>
              <p className="text-xs text-slate-400">{i.desc}</p>
            </div>
            <button
              disabled
              title="Em breve"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-400"
            >
              Em breve
            </button>
          </div>
        ))}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-800">Webhooks</p>
            <p className="text-xs text-slate-400">
              Notifique uma URL com as novas respostas
            </p>
          </div>
          <button
            disabled
            title="Em breve"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-400"
          >
            Em breve
          </button>
        </div>
      </section>

      {/* Métricas e conversões */}
      <section className="mt-10 border-t border-slate-100 pt-8">
        <h2 className="text-lg font-semibold text-slate-900">
          Métricas e conversões
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Os eventos são sempre enviados para essas integrações. Deixe em
          branco para usar o padrão da{" "}
          <Link href="/conta" className="font-medium text-brand-600 underline">
            sua conta
          </Link>
          .
        </p>

        <div className="mt-6 space-y-5">
          <MetricField
            label="Facebook (Meta Pixel)"
            badge="PRO"
            hint="ID do seu pixel no Facebook. Eventos: PageView, ViewContent (por etapa), Lead e EndForm — com deduplicação via API de Conversão se você configurou o token na sua conta."
            value={form.pixel_id ?? ""}
            placeholder="Padrão da conta"
            onSave={(v) => {
              const id = extractPixelId(v);
              onPersist({ pixel_id: id || null });
            }}
          />
          <MetricField
            label="Google Tag Manager"
            badge="EMPRESA"
            hint="Cole o ID do container (GTM-XXXXXXX) ou o código completo do GTM que o Google fornece — extraímos o ID automaticamente."
            value={form.gtm_id ?? ""}
            placeholder="GTM-XXXXXXX ou cole o código completo"
            onSave={(v) => {
              const id = extractGtmId(v);
              onPersist({ gtm_id: id || null });
            }}
          />
          <MetricField
            label="Google Analytics"
            badge="PRO"
            hint="Cole o ID de métrica (G-XXXXXXXXXX) ou o código completo — extraímos o ID."
            value={form.ga_id ?? ""}
            placeholder="G-XXXXXXXXXX ou cole o código completo"
            onSave={(v) => {
              const id = extractGaId(v);
              onPersist({ ga_id: id || null });
            }}
          />
          <MetricField
            label="TikTok"
            badge="NOVO"
            hint="Adicione seu TikTok Events Manager ID (ou cole o código)."
            value={form.tiktok_pixel_id ?? ""}
            placeholder="Padrão da conta"
            onSave={(v) => {
              const id = extractTikTokId(v);
              onPersist({ tiktok_pixel_id: id || null });
            }}
          />
        </div>
      </section>

      {/* Configurar conversão */}
      <section className="mt-10 border-t border-slate-100 pt-8 pb-16">
        <h2 className="text-lg font-semibold text-slate-900">
          Configurar conversão
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Determine a partir de qual momento um preenchimento será considerado
          uma conversão — o evento de conversão será enviado para as
          plataformas nesse instante.
        </p>

        <div className="mt-5 space-y-2">
          <label
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${
              trigger.type === "finish"
                ? "border-brand-400 bg-brand-50 text-brand-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <input
              type="radio"
              name="conv"
              checked={trigger.type === "finish"}
              onChange={() =>
                onPersist({ conversion_trigger: { type: "finish" } })
              }
              className="accent-brand-600"
            />
            🔀 Ao finalizar o formulário por qualquer caminho
          </label>

          <label
            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${
              trigger.type === "field"
                ? "border-brand-400 bg-brand-50 text-brand-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            <input
              type="radio"
              name="conv"
              checked={trigger.type === "field"}
              onChange={() =>
                onPersist({
                  conversion_trigger: {
                    type: "field",
                    fieldId: allFields[0]?.id ?? null,
                  },
                })
              }
              className="accent-brand-600"
            />
            🏁 Ao chegar em um campo específico
          </label>

          {trigger.type === "field" && (
            <div className="mt-3 grid gap-2">
              {allFields.map((f, i) => {
                const selected = trigger.fieldId === f.id;
                const icon = FIELD_ICONS[f.type] ?? "📋";
                return (
                  <button
                    key={f.id}
                    onClick={() =>
                      onPersist({
                        conversion_trigger: { type: "field", fieldId: f.id },
                      })
                    }
                    className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition ${
                      selected
                        ? "border-brand-500 bg-brand-50"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        selected
                          ? "bg-brand-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-base">{icon}</span>
                    <span className="flex-1 min-w-0">
                      <span className={`block truncate text-sm font-medium ${selected ? "text-brand-700" : "text-slate-700"}`}>
                        {f.title || "(sem título)"}
                      </span>
                      <span className="text-xs text-slate-400">{FIELD_LABELS[f.type]}</span>
                    </span>
                    {selected && (
                      <span className="shrink-0 text-brand-600">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function MetricField({
  label,
  badge,
  hint,
  value,
  placeholder,
  onSave,
}: {
  label: string;
  badge?: string;
  hint: string;
  value: string;
  placeholder?: string;
  onSave: (v: string) => void;
}) {
  return (
    <div>
      <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        {label}
        {badge && (
          <span
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
              badge === "NOVO"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-brand-50 text-brand-600"
            }`}
          >
            {badge}
          </span>
        )}
      </p>
      <p className="mt-0.5 text-xs text-slate-400">{hint}</p>
      <input
        defaultValue={value}
        onBlur={(e) => onSave(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400"
      />
    </div>
  );
}
