"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_STYLE,
  FIELD_TYPE_LABELS,
  type DoitForm,
  type FormField,
  type FieldOption,
} from "@/lib/types";
import { FieldEditor } from "./FieldEditor";

type Align = "left" | "center" | "right";

/**
 * WYSIWYG step editor — edit the form directly on the rendered step (no side
 * preview). Handles text alignment and preserves line breaks. Advanced
 * settings live in a collapsible panel so every feature stays reachable.
 */
export function InlineEditor({
  form,
  field,
  allFields,
  index,
  total,
  onChange,
  onSave,
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
  onPrev: () => void;
  onNext: () => void;
}) {
  const [showSettings, setShowSettings] = useState(false);
  const style = { ...DEFAULT_STYLE, ...form.style };
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

        <button
          onClick={() => setShowSettings((s) => !s)}
          className={`ml-auto rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
            showSettings
              ? "border-brand-300 bg-brand-50 text-brand-700"
              : "border-slate-200 text-slate-600 hover:bg-slate-50"
          }`}
        >
          ⚙ Configurações avançadas
        </button>
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

        {/* advanced settings drawer */}
        {showSettings && (
          <div className="thin-scroll max-h-[45%] overflow-y-auto border-t border-slate-200 bg-white p-5 lg:max-h-none lg:w-96 lg:border-l lg:border-t-0">
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
