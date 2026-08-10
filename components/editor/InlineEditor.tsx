"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_STYLE,
  FIELD_TYPE_LABELS,
  type DoitForm,
  type FormField,
  type FormStyle,
  type FieldOption,
} from "@/lib/types";
import {
  getGoogleFontUrl,
  GOOGLE_FONTS,
  THEME_PRESETS,
  TEXT_ANIMATIONS,
  BUTTON_ANIMATIONS,
  FONT_SIZE_SCALES,
} from "@/lib/themes";
import { FieldEditor } from "./FieldEditor";

type Align = "left" | "center" | "right";

/**
 * WYSIWYG step editor — edit the form directly on the rendered step (no side
 * preview). Handles text alignment and preserves line breaks. Advanced
 * settings live in a collapsible panel so every feature stays reachable.
 */
type Panel = "none" | "settings" | "style";

export function InlineEditor({
  form,
  field,
  allFields,
  index,
  total,
  onChange,
  onSave,
  onStylePatch,
  onPrev,
  onNext,
}: {
  form: DoitForm;
  field: FormField;
  allFields: FormField[];
  index: number;
  total: number;
  onChange: (patch: Partial<FormField>) => void;
  onSave: (patch: Record<string, unknown>) => void;
  onStylePatch: (patch: Partial<FormStyle>) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [panel, setPanel] = useState<Panel>("none");
  const showSettings = panel === "settings";
  const showStyle = panel === "style";

  function togglePanel(p: Panel) {
    setPanel((cur) => (cur === p ? "none" : p));
  }
  const style = { ...DEFAULT_STYLE, ...form.style };

  // Load Google Font in the editor canvas so the preview matches the published form.
  useEffect(() => {
    const fontUrl = getGoogleFontUrl(style.font || "Inter");
    if (!fontUrl) return;
    const id = `gf-${(style.font || "").replace(/\s+/g, "-").toLowerCase()}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = fontUrl;
    document.head.appendChild(link);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [style.font]);
  const cfg = field.config || {};
  const align: Align = cfg.align || "left";
  const radius = `${style.borderRadius ?? 8}px`;
  const isScreen = field.type === "welcome" || field.type === "thankyou";
  const isChoice = field.type === "multiple_choice";

  const alignClass =
    align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center";
  const justify =
    align === "left" ? "justify-start" : align === "right" ? "justify-end" : "justify-center";

  function updateConfig(patch: Record<string, unknown>) {
    const config = { ...field.config, ...patch };
    onChange({ config });
    onSave({ config });
  }
  function setAlign(a: Align) {
    updateConfig({ align: a });
  }
  function updateOptions(options: FieldOption[]) {
    onChange({ options });
    onSave({ options });
  }

  const bg = style.backgroundImage
    ? {
        backgroundImage: `url(${style.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { backgroundColor: style.backgroundColor };

  return (
    <div className="flex h-full flex-col bg-slate-100">
      {/* toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
        {/* mobile step nav */}
        <div className="flex items-center gap-1 md:hidden">
          <ToolbarBtn onClick={onPrev} disabled={index === 0} label="‹" />
          <span className="px-1 text-xs font-semibold text-slate-500">
            {index + 1}/{total}
          </span>
          <ToolbarBtn onClick={onNext} disabled={index >= total - 1} label="›" />
          <span className="mx-1 h-5 w-px bg-slate-200" />
        </div>

        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
          {FIELD_TYPE_LABELS[field.type]}
        </span>

        {/* alignment */}
        <div className="flex rounded-lg border border-slate-200 p-0.5">
          <AlignBtn active={align === "left"} onClick={() => setAlign("left")} icon="⬅" title="Alinhar à esquerda" />
          <AlignBtn active={align === "center"} onClick={() => setAlign("center")} icon="⬌" title="Centralizar" />
          <AlignBtn active={align === "right"} onClick={() => setAlign("right")} icon="➡" title="Alinhar à direita" />
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            onClick={() => togglePanel("style")}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
              showStyle
                ? "border-brand-300 bg-brand-50 text-brand-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            🎨 Estilo
          </button>
          <button
            onClick={() => togglePanel("settings")}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
              showSettings
                ? "border-brand-300 bg-brand-50 text-brand-700"
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            ⚙ Campo
          </button>
        </div>
      </div>

      {/* editable surface + settings */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* the form itself, editable */}
        <div
          className="thin-scroll min-h-0 flex-1 overflow-y-auto"
          style={bg}
        >
          <div
            className="mx-auto w-full max-w-xl px-5 py-10 sm:py-16"
            style={{ fontFamily: style.font }}
          >
            {style.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={style.logo}
                alt="logo"
                className="mx-auto mb-8 h-12 object-contain"
              />
            )}

            <AutoTextarea
              value={field.title}
              onChange={(v) => onChange({ title: v })}
              onBlur={(v) => onSave({ title: v })}
              placeholder="Escreva o título aqui..."
              className={`w-full resize-none whitespace-pre-line bg-transparent text-2xl font-bold leading-snug outline-none sm:text-3xl ${alignClass}`}
              style={{ color: style.questionColor, textAlign: align }}
            />

            <AutoTextarea
              value={field.description}
              onChange={(v) => onChange({ description: v })}
              onBlur={(v) => onSave({ description: v })}
              placeholder="Descrição (opcional) — pressione Enter para quebrar linha"
              className={`mt-4 w-full resize-none whitespace-pre-line bg-transparent text-base leading-relaxed opacity-80 outline-none ${alignClass}`}
              style={{ textAlign: align, color: style.questionColor }}
            />
            <p className={`mt-1 text-xs text-slate-400 ${alignClass}`}>
              Enter quebra a linha · **texto** vira <strong>negrito</strong>
            </p>

            {/* type-specific inline editing */}
            {isChoice && (
              <div className="mt-8 grid gap-3">
                {field.options.map((opt, i) => (
                  <div
                    key={opt.id}
                    className="flex items-center gap-3 border-2 px-4 py-3"
                    style={{ borderColor: "#e2e8f0", borderRadius: radius }}
                  >
                    <span
                      className="grid h-7 w-7 shrink-0 place-items-center rounded border text-xs font-bold text-slate-400"
                      style={{ borderColor: "#cbd5e1" }}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    <input
                      value={opt.label}
                      onChange={(e) => {
                        const next = field.options.map((o) =>
                          o.id === opt.id ? { ...o, label: e.target.value } : o,
                        );
                        onChange({ options: next });
                      }}
                      onBlur={() => onSave({ options: field.options })}
                      placeholder={`Opção ${i + 1}`}
                      className="flex-1 bg-transparent text-base outline-none"
                      style={{ color: style.questionColor }}
                    />
                    <button
                      onClick={() =>
                        updateOptions(field.options.filter((o) => o.id !== opt.id))
                      }
                      disabled={field.options.length <= 1}
                      className="text-slate-300 hover:text-rose-500 disabled:opacity-30"
                      title="Remover opção"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    updateOptions([
                      ...field.options,
                      {
                        id: crypto.randomUUID(),
                        label: `Opção ${field.options.length + 1}`,
                      },
                    ])
                  }
                  className="w-full rounded-lg border-2 border-dashed border-slate-200 py-2.5 text-sm font-semibold text-slate-400 transition hover:border-brand-300 hover:text-brand-600"
                >
                  ＋ Adicionar opção
                </button>
              </div>
            )}

            {!isScreen && !isChoice && (
              <div className="mt-8">
                <input
                  value={cfg.placeholder || ""}
                  onChange={(e) => updateConfig({ placeholder: e.target.value })}
                  placeholder="Texto de exemplo do campo (ex: Digite seu nome)"
                  className="w-full border-b-2 bg-transparent px-1 py-3 text-lg outline-none"
                  style={{
                    borderColor: style.answerColor,
                    color: style.answerColor,
                    textAlign: align,
                  }}
                />
                <p className="mt-1 text-center text-xs text-slate-400">
                  ↑ Esse é o texto de exemplo que aparece no campo de resposta.
                </p>
              </div>
            )}

            {field.type === "welcome" && (
              <div className={`mt-8 flex ${justify}`}>
                <input
                  value={cfg.buttonText || ""}
                  onChange={(e) => updateConfig({ buttonText: e.target.value })}
                  placeholder="Texto do botão"
                  className="rounded-lg px-6 py-3 text-center text-base font-semibold text-white shadow-sm outline-none"
                  style={{ backgroundColor: style.buttonColor, borderRadius: radius }}
                  size={Math.max((cfg.buttonText || "Texto do botão").length, 8)}
                />
              </div>
            )}
          </div>
        </div>

        {/* style panel */}
        {showStyle && (
          <div className="thin-scroll max-h-[55%] overflow-y-auto border-t border-slate-200 bg-white p-4 lg:max-h-none lg:w-80 lg:border-l lg:border-t-0">
            <h3 className="mb-3 text-sm font-bold text-slate-700">Aparência do formulário</h3>

            {/* Theme presets */}
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Temas</p>
            <div className="mb-4 grid grid-cols-2 gap-1.5">
              {THEME_PRESETS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onStylePatch(t.style as FormStyle)}
                  className="flex items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5 text-left text-xs transition hover:border-brand-300 hover:bg-brand-50"
                >
                  <span
                    className="h-4 w-4 shrink-0 rounded-full border border-slate-200"
                    style={{ backgroundColor: t.style.buttonColor }}
                  />
                  <span className="truncate font-medium text-slate-700">{t.emoji} {t.name}</span>
                </button>
              ))}
            </div>

            {/* Font */}
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Fonte</p>
            <select
              value={style.font || "Inter"}
              onChange={(e) => onStylePatch({ font: e.target.value })}
              className="mb-4 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
            >
              {GOOGLE_FONTS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            {/* Font size scale */}
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Tamanho do texto</p>
            <div className="mb-4 grid grid-cols-4 gap-1">
              {FONT_SIZE_SCALES.map((s) => {
                const active = (style.fontSizeScale || "md") === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => onStylePatch({ fontSizeScale: s.id as FormStyle["fontSizeScale"] })}
                    className={`rounded-lg border py-1.5 text-center text-xs font-medium transition ${
                      active
                        ? "border-brand-500 bg-brand-50 text-brand-700"
                        : "border-slate-200 text-slate-500 hover:border-slate-300"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Colors */}
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Cores</p>
            <div className="mb-4 space-y-2">
              {[
                { label: "Botão", key: "buttonColor" },
                { label: "Pergunta", key: "questionColor" },
                { label: "Resposta", key: "answerColor" },
                { label: "Fundo", key: "backgroundColor" },
              ].map(({ label, key }) => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={(style as Record<string, string>)[key] || "#000000"}
                    onChange={(e) => onStylePatch({ [key]: e.target.value } as Partial<FormStyle>)}
                    className="h-7 w-8 cursor-pointer rounded border border-slate-200"
                  />
                  <span className="text-xs text-slate-600">{label}</span>
                </div>
              ))}
            </div>

            {/* Text animation */}
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Animação do texto</p>
            <select
              value={style.textAnimation || "none"}
              onChange={(e) => onStylePatch({ textAnimation: e.target.value })}
              className="mb-4 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
            >
              {TEXT_ANIMATIONS.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>

            {/* Button animation */}
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Animação do botão</p>
            <select
              value={style.buttonAnimation || "none"}
              onChange={(e) => onStylePatch({ buttonAnimation: e.target.value })}
              className="mb-4 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
            >
              {BUTTON_ANIMATIONS.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>

            {/* Border radius */}
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Bordas — {style.borderRadius ?? 8}px
            </p>
            <input
              type="range"
              min={0}
              max={24}
              value={style.borderRadius ?? 8}
              onChange={(e) => onStylePatch({ borderRadius: Number(e.target.value) })}
              className="w-full accent-brand-600"
            />
          </div>
        )}

        {/* field settings drawer */}
        {showSettings && (
          <div className="thin-scroll max-h-[45%] overflow-y-auto border-t border-slate-200 bg-white p-5 lg:max-h-none lg:w-80 lg:border-l lg:border-t-0">
            <h3 className="mb-4 text-sm font-bold text-slate-700">
              Configurações do campo
            </h3>
            <FieldEditor
              field={field}
              allFields={allFields}
              onChange={onChange}
              onSave={onSave}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/** Textarea that auto-grows with its content and preserves line breaks. */
function AutoTextarea({
  value,
  onChange,
  onBlur,
  placeholder,
  className,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur: (v: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onBlur={(e) => onBlur(e.target.value)}
      className={className}
      style={style}
    />
  );
}

function AlignBtn({
  active,
  onClick,
  icon,
  title,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`rounded-md px-2.5 py-1 text-sm transition ${
        active ? "bg-brand-600 text-white" : "text-slate-500 hover:bg-slate-100"
      }`}
    >
      {icon}
    </button>
  );
}

function ToolbarBtn({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-slate-200 px-2 py-1 text-sm font-bold text-slate-500 transition hover:bg-slate-50 disabled:opacity-30"
    >
      {label}
    </button>
  );
}
