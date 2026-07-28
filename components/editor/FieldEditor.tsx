"use client";

import { FIELD_TYPE_LABELS, type FormField, type FieldOption } from "@/lib/types";

export function FieldEditor({
  field,
  onChange,
  onSave,
}: {
  field: FormField;
  onChange: (patch: Partial<FormField>) => void;
  onSave: (patch: Record<string, unknown>) => void;
}) {
  const isScreen = field.type === "welcome" || field.type === "thankyou";
  const isChoice = field.type === "multiple_choice";

  function updateConfig(patch: Record<string, unknown>) {
    const config = { ...field.config, ...patch };
    onChange({ config });
    onSave({ config });
  }

  function updateOptions(options: FieldOption[]) {
    onChange({ options });
    onSave({ options });
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <span
          className={`inline-block rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500`}
        >
          {FIELD_TYPE_LABELS[field.type]}
        </span>
      </div>

      <Labeled label={isScreen ? "Título da tela" : "Pergunta"}>
        <input
          value={field.title}
          onChange={(e) => onChange({ title: e.target.value })}
          onBlur={(e) => onSave({ title: e.target.value })}
          placeholder="Digite aqui..."
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
        />
      </Labeled>

      <Labeled label="Descrição (opcional)">
        <textarea
          value={field.description}
          onChange={(e) => onChange({ description: e.target.value })}
          onBlur={(e) => onSave({ description: e.target.value })}
          rows={2}
          placeholder="Texto de apoio"
          className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
        />
      </Labeled>

      {!isScreen && !isChoice && (
        <Labeled label="Placeholder">
          <input
            value={field.config?.placeholder || ""}
            onChange={(e) => updateConfig({ placeholder: e.target.value })}
            placeholder="Ex: Digite sua resposta"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
          />
        </Labeled>
      )}

      {isChoice && (
        <Labeled label="Opções">
          <div className="space-y-2">
            {field.options.map((opt, i) => (
              <div key={opt.id} className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded border border-slate-200 text-xs font-bold text-slate-400">
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
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
                <button
                  onClick={() =>
                    updateOptions(field.options.filter((o) => o.id !== opt.id))
                  }
                  className="text-slate-300 hover:text-rose-500"
                  disabled={field.options.length <= 1}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() =>
                updateOptions([
                  ...field.options,
                  { id: crypto.randomUUID(), label: `Opção ${field.options.length + 1}` },
                ])
              }
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              ＋ Adicionar opção
            </button>
          </div>
        </Labeled>
      )}

      {isScreen && field.type === "welcome" && (
        <Labeled label="Texto do botão">
          <input
            value={field.config?.buttonText || ""}
            onChange={(e) => updateConfig({ buttonText: e.target.value })}
            placeholder="Começar →"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
          />
        </Labeled>
      )}

      {field.type === "thankyou" && (
        <Labeled label="Redirecionar para (opcional)">
          <input
            value={field.config?.redirectUrl || ""}
            onChange={(e) => updateConfig({ redirectUrl: e.target.value })}
            placeholder="https://seusite.com/obrigado"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
          />
        </Labeled>
      )}

      {!isScreen && (
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => {
              onChange({ required: e.target.checked });
              onSave({ required: e.target.checked });
            }}
            className="h-4 w-4 rounded border-slate-300 text-brand-600"
          />
          <span className="text-sm text-slate-600">Resposta obrigatória</span>
        </label>
      )}
    </div>
  );
}

function Labeled({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
