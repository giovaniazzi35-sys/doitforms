"use client";

import { useState } from "react";
import type {
  DoitForm,
  FormStyle,
  FormSettings,
  PixelConfig,
  NotificationSettings,
} from "@/lib/types";
import { DEFAULT_STYLE, DEFAULT_PIXEL_CONFIG } from "@/lib/types";
import { deleteAllResponses, deleteFormAndRedirect } from "@/app/forms/[id]/actions";

const FONTS = ["Inter", "Lato", "Roboto", "Poppins", "Montserrat", "Open Sans"];

export function OptionsTab({
  form,
  onPatch,
  onPersist,
  onDeleted,
}: {
  form: DoitForm;
  onPatch: (patch: Partial<DoitForm>) => void;
  onPersist: (patch: Record<string, unknown>) => void | Promise<void>;
  onDeleted: () => void;
}) {
  const style: FormStyle = { ...DEFAULT_STYLE, ...form.style };
  const settings: FormSettings = form.settings || {};
  const notif: NotificationSettings = settings.notifications || {};
  const pixel: PixelConfig = { ...DEFAULT_PIXEL_CONFIG, ...form.pixel_config };

  function patchStyle(p: Partial<FormStyle>) {
    onPersist({ style: { ...style, ...p } });
  }
  function patchSettings(p: Partial<FormSettings>) {
    onPersist({ settings: { ...settings, ...p } });
  }
  function patchNotif(p: Partial<NotificationSettings>) {
    patchSettings({ notifications: { ...notif, ...p } });
  }
  function patchPixel(p: Partial<PixelConfig>) {
    onPersist({ pixel_config: { ...pixel, ...p } });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Configurações</h1>

      {/* Título */}
      <Section title="Título do formulário">
        <input
          value={form.title}
          onChange={(e) => onPatch({ title: e.target.value })}
          onBlur={(e) => onPersist({ title: e.target.value })}
          maxLength={80}
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
        />
      </Section>

      {/* Estilo */}
      <Section title="Personalizar estilo" subtitle="Cores, fontes e logotipo.">
        <div className="space-y-4">
          <ColorRow label="Cor do botão" value={style.buttonColor!} onChange={(v) => patchStyle({ buttonColor: v })} />
          <ColorRow label="Cor da pergunta" value={style.questionColor!} onChange={(v) => patchStyle({ questionColor: v })} />
          <ColorRow label="Cor da resposta" value={style.answerColor!} onChange={(v) => patchStyle({ answerColor: v })} />
          <ColorRow label="Cor de fundo" value={style.backgroundColor!} onChange={(v) => patchStyle({ backgroundColor: v })} />

          <Row label="Logotipo (URL)">
            <input
              defaultValue={style.logo || ""}
              onBlur={(e) => patchStyle({ logo: e.target.value })}
              placeholder="https://.../logo.png"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          </Row>
          <Row label="Imagem de fundo (URL)">
            <input
              defaultValue={style.backgroundImage || ""}
              onBlur={(e) => patchStyle({ backgroundImage: e.target.value })}
              placeholder="https://.../bg.jpg"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          </Row>
          <Row label="Fonte">
            <select
              value={style.font}
              onChange={(e) => patchStyle({ font: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            >
              {FONTS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </Row>
          <Row label={`Bordas (${style.borderRadius}px)`}>
            <input
              type="range"
              min={0}
              max={24}
              value={style.borderRadius}
              onChange={(e) => patchStyle({ borderRadius: Number(e.target.value) })}
              className="w-full accent-brand-600"
            />
          </Row>
          <Toggle
            label="Remover a marca doitforms"
            desc="Não exibe nossa mensagem ao final do formulário."
            checked={!!settings.removeBranding}
            onChange={(v) => patchSettings({ removeBranding: v })}
          />
        </div>
      </Section>

      {/* Meta Pixel */}
      <Section
        title="Meta Pixel & Conversões"
        subtitle="Dispare eventos do Facebook Pixel conforme o visitante avança."
      >
        <div className="space-y-4">
          <Row label="ID do Pixel do Meta">
            <input
              defaultValue={form.pixel_id || ""}
              onBlur={(e) => onPersist({ pixel_id: e.target.value.trim() || null })}
              placeholder="Ex: 1234567890123456"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          </Row>
          <Toggle
            label="Disparar PageView ao abrir"
            desc="Evento padrão PageView quando o formulário carrega."
            checked={!!pixel.pageViewOnLoad}
            onChange={(v) => patchPixel({ pageViewOnLoad: v })}
          />
          <Toggle
            label="Disparar Lead ao concluir"
            desc="Evento de conversão quando o formulário é finalizado."
            checked={!!pixel.leadOnComplete}
            onChange={(v) => patchPixel({ leadOnComplete: v })}
          />
          <Row label="Nome do evento de conversão">
            <input
              defaultValue={pixel.leadEventName || "Lead"}
              onBlur={(e) => patchPixel({ leadEventName: e.target.value || "Lead" })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          </Row>
          <Toggle
            label="Evento a cada etapa"
            desc="Dispara um evento personalizado sempre que o visitante avança."
            checked={!!pixel.perStepEvent}
            onChange={(v) => patchPixel({ perStepEvent: v })}
          />
          {pixel.perStepEvent && (
            <Row label="Nome do evento por etapa">
              <input
                defaultValue={pixel.perStepEventName || "ViewContent"}
                onBlur={(e) =>
                  patchPixel({ perStepEventName: e.target.value || "ViewContent" })
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
            </Row>
          )}
        </div>
      </Section>

      {/* Notificações */}
      <Section title="Notificações" subtitle="Seja avisado de novos preenchimentos.">
        <div className="space-y-4">
          <Row label="Quando notificar">
            <select
              value={notif.mode || "complete"}
              onChange={(e) =>
                patchNotif({ mode: e.target.value as NotificationSettings["mode"] })
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            >
              <option value="complete">Somente respostas completas</option>
              <option value="all">Todas as respostas</option>
              <option value="none">Não notificar</option>
            </select>
          </Row>
          <Toggle
            label="Receber alerta por e-mail"
            desc="Você será alertado no seu e-mail a cada envio."
            checked={!!notif.emailAlert}
            onChange={(v) => patchNotif({ emailAlert: v })}
          />
          {notif.emailAlert && (
            <Row label="E-mail para alertas">
              <input
                defaultValue={notif.alertEmail || ""}
                onBlur={(e) => patchNotif({ alertEmail: e.target.value })}
                placeholder="voce@email.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
              />
            </Row>
          )}
          <Toggle
            label="Alerta por WhatsApp"
            desc="Receba uma mensagem a cada novo envio (em breve)."
            checked={!!notif.whatsappAlert}
            onChange={(v) => patchNotif({ whatsappAlert: v })}
          />
        </div>
        <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
          O envio de e-mails/WhatsApp é ativado ao conectar um provedor. As
          preferências ficam salvas.
        </p>
      </Section>

      {/* Rastreio */}
      <Section
        title="Rastreio e variáveis personalizadas"
        subtitle="Capture parâmetros de campanha em cada resposta."
      >
        <div className="space-y-4">
          <Toggle
            label="Salvar parâmetros UTM, GCLID e FBCLID"
            desc="utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, fbclid."
            checked={form.track_utm}
            onChange={(v) => onPersist({ track_utm: v })}
          />
          <Toggle
            label="Adicionar UTMs em links"
            desc="Ao redirecionar para um site externo, repassamos os UTMs no link."
            checked={form.append_utm_to_links}
            onChange={(v) => onPersist({ append_utm_to_links: v })}
          />
        </div>
      </Section>

      {/* Tela de desqualificação */}
      <Section
        title="Tela de desqualificação"
        subtitle="Exibida quando o lead é desqualificado pela lógica de qualificação de uma etapa. Ative a Qualificação em um campo de múltipla escolha no editor."
      >
        <div className="space-y-4">
          <Row label="Título">
            <input
              defaultValue={settings.disqualify?.title || ""}
              onBlur={(e) =>
                patchSettings({
                  disqualify: { ...settings.disqualify, title: e.target.value },
                })
              }
              placeholder="Obrigado pelo seu interesse!"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          </Row>
          <Row label="Mensagem">
            <textarea
              defaultValue={settings.disqualify?.message || ""}
              onBlur={(e) =>
                patchSettings({
                  disqualify: {
                    ...settings.disqualify,
                    message: e.target.value,
                  },
                })
              }
              rows={2}
              placeholder="No momento seu perfil não se encaixa, mas agradecemos a participação."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          </Row>
          <Row label="Redirecionar para (opcional)">
            <input
              defaultValue={settings.disqualify?.redirectUrl || ""}
              onBlur={(e) =>
                patchSettings({
                  disqualify: {
                    ...settings.disqualify,
                    redirectUrl: e.target.value,
                  },
                })
              }
              placeholder="https://..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          </Row>
        </div>
      </Section>

      {/* Limites */}
      <Section title="Limites de envio e acesso">
        <div className="space-y-4">
          <Toggle
            label="Bloquear novos envios"
            desc="Fecha o formulário e evita que novas pessoas enviem dados."
            checked={!!settings.block_new}
            onChange={(v) => patchSettings({ block_new: v })}
          />
        </div>
      </Section>

      {/* Danger zone */}
      <div className="mt-10 rounded-2xl border border-rose-200 bg-rose-50 p-6">
        <h3 className="font-semibold text-rose-700">Zona perigosa</h3>
        <p className="mt-1 text-sm text-rose-500">
          As ações abaixo não podem ser revertidas. Tenha cuidado.
        </p>
        <div className="mt-5 space-y-4">
          <DangerAction
            title="Excluir todas as respostas"
            desc="Remove todas as respostas deste formulário. Faça um backup primeiro."
            button="Excluir respostas"
            confirmText="Excluir TODAS as respostas deste formulário?"
            onConfirm={() => deleteAllResponses(form.id)}
          />
          <DangerAction
            title="Excluir formulário"
            desc="Exclui o formulário e todas as respostas."
            button="Excluir formulário"
            confirmText="Excluir este formulário permanentemente?"
            onConfirm={async () => {
              await deleteFormAndRedirect(form.id);
              onDeleted();
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8 border-t border-slate-100 pt-8">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="mb-4 mt-1 text-sm text-slate-500">{subtitle}</p>}
      <div className={subtitle ? "" : "mt-4"}>{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 sm:grid-cols-[200px_1fr] sm:items-center">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div>{children}</div>
    </div>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <Row label={label}>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded border border-slate-200"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-28 rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
        />
      </div>
    </Row>
  );
}

function Toggle({
  label,
  desc,
  checked,
  onChange,
}: {
  label: string;
  desc?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {desc && <p className="text-xs text-slate-400">{desc}</p>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${
          checked ? "bg-brand-600" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function DangerAction({
  title,
  desc,
  button,
  confirmText,
  onConfirm,
}: {
  title: string;
  desc: string;
  button: string;
  confirmText: string;
  onConfirm: () => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <h4 className="text-sm font-semibold text-rose-700">{title}</h4>
      <p className="text-xs text-rose-500">{desc}</p>
      <button
        disabled={busy}
        onClick={async () => {
          if (!confirm(confirmText)) return;
          setBusy(true);
          try {
            await onConfirm();
          } finally {
            setBusy(false);
          }
        }}
        className="mt-2 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-100 disabled:opacity-60"
      >
        {busy ? "..." : button}
      </button>
    </div>
  );
}
