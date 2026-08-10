"use client";

import { useState } from "react";
import type {
  DoitForm,
  FormStyle,
  FormSettings,
  PixelConfig,
  NotificationSettings,
  PopupSettings,
} from "@/lib/types";
import { DEFAULT_STYLE, DEFAULT_PIXEL_CONFIG } from "@/lib/types";
import { deleteAllResponses, deleteFormAndRedirect } from "@/app/forms/[id]/actions";
import {
  GOOGLE_FONTS,
  THEME_PRESETS,
  TEXT_ANIMATIONS,
  BUTTON_ANIMATIONS,
  FONT_SIZE_SCALES,
} from "@/lib/themes";

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

  const popup: PopupSettings = settings.popup || {};

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
  function patchPopup(p: Partial<PopupSettings>) {
    patchSettings({ popup: { ...popup, ...p } });
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

      {/* ── Temas prontos ── */}
      <Section
        title="Temas prontos"
        subtitle="Selecione um tema para aplicar cores, fonte e animações de uma vez."
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {THEME_PRESETS.map((t) => {
            const active = (style.backgroundColor === t.style.backgroundColor &&
              style.buttonColor === t.style.buttonColor);
            return (
              <button
                key={t.id}
                onClick={() => patchStyle(t.style as FormStyle)}
                className={`flex flex-col items-start gap-1 rounded-xl border-2 px-3 py-2.5 text-left transition hover:shadow-md ${
                  active
                    ? "border-brand-500 bg-brand-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* mini color preview */}
                <div
                  className="h-5 w-full rounded"
                  style={{ backgroundColor: t.style.backgroundColor }}
                >
                  <div
                    className="h-full w-8 rounded"
                    style={{ backgroundColor: t.style.buttonColor }}
                  />
                </div>
                <span className="text-base leading-none">{t.emoji}</span>
                <span className="text-xs font-semibold text-slate-700">{t.name}</span>
                <span className="text-[10px] text-slate-400">{t.description}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* ── Estilo personalizado ── */}
      <Section title="Personalizar estilo" subtitle="Cores, fonte, logotipo e fundo.">
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

      {/* ── Tipografia ── */}
      <Section title="Tipografia" subtitle="Fonte, tamanho e escala responsiva dos textos.">
        <div className="space-y-4">
          <Row label="Fonte">
            <select
              value={style.font || "Inter"}
              onChange={(e) => patchStyle({ font: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            >
              {GOOGLE_FONTS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </Row>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Tamanho dos textos</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {FONT_SIZE_SCALES.map((s) => {
                const active = (style.fontSizeScale || "md") === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => patchStyle({ fontSizeScale: s.id as FormStyle["fontSizeScale"] })}
                    className={`rounded-lg border-2 px-2 py-2 text-center text-xs transition ${
                      active
                        ? "border-brand-500 bg-brand-50 text-brand-700 font-semibold"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    <div className="font-semibold">{s.label}</div>
                    <div className="opacity-60">{s.desc}</div>
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              Os tamanhos são fluidos e se adaptam automaticamente a celulares, computadores e TVs.
            </p>
          </div>
        </div>
      </Section>

      {/* ── Animações ── */}
      <Section title="Animações" subtitle="Efeitos de entrada do texto e do botão CTA.">
        <div className="space-y-4">
          <Row label="Animação do texto">
            <select
              value={style.textAnimation || "none"}
              onChange={(e) => patchStyle({ textAnimation: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            >
              {TEXT_ANIMATIONS.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </Row>
          <Row label="Animação do botão">
            <select
              value={style.buttonAnimation || "none"}
              onChange={(e) => patchStyle({ buttonAnimation: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            >
              {BUTTON_ANIMATIONS.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </Row>
        </div>
      </Section>

      {/* ── Popup de notificação ── */}
      <Section
        title="Popup de notificação"
        subtitle="Exibe um aviso no canto superior direito para criar senso de urgência e prova social."
      >
        <div className="space-y-4">
          <Toggle
            label="Ativar popup"
            desc={`Aparece a cada ${popup.interval ?? 25} segundos.`}
            checked={!!popup.enabled}
            onChange={(v) => patchPopup({ enabled: v })}
          />
          {popup.enabled && (
            <>
              <Row label="Mensagem">
                <input
                  defaultValue={popup.message || ""}
                  onBlur={(e) => patchPopup({ message: e.target.value })}
                  placeholder="Alguém acabou de se inscrever! 🎉"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
              </Row>
              <Row label="Emoji / ícone">
                <input
                  defaultValue={popup.emoji || ""}
                  onBlur={(e) => patchPopup({ emoji: e.target.value })}
                  placeholder="🔔"
                  className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
              </Row>
              <Row label="Nome / autor (opcional)">
                <input
                  defaultValue={popup.author || ""}
                  onBlur={(e) => patchPopup({ author: e.target.value })}
                  placeholder="João de São Paulo"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
              </Row>
              <Row label={`Intervalo (segundos)`}>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={5}
                    max={120}
                    step={5}
                    value={popup.interval ?? 25}
                    onChange={(e) => patchPopup({ interval: Number(e.target.value) })}
                    className="w-full accent-brand-600"
                  />
                  <span className="w-10 text-right text-sm font-medium text-slate-600">
                    {popup.interval ?? 25}s
                  </span>
                </div>
              </Row>
            </>
          )}
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
