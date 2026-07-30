"use client";

import {
  FIELD_TYPE_LABELS,
  type FormField,
  type FieldOption,
  type TrackedButton,
} from "@/lib/types";

export function FieldEditor({
  field,
  allFields,
  onChange,
  onSave,
}: {
  field: FormField;
  allFields: FormField[];
  onChange: (patch: Partial<FormField>) => void;
  onSave: (patch: Record<string, unknown>) => void;
}) {
  const isScreen = field.type === "welcome" || field.type === "thankyou";
  const isChoice = field.type === "multiple_choice";
  const cfg = field.config || {};

  function updateConfig(patch: Record<string, unknown>) {
    const config = { ...field.config, ...patch };
    onChange({ config });
    onSave({ config });
  }

  function updateOptions(options: FieldOption[]) {
    onChange({ options });
    onSave({ options });
  }

  // Steps a branch can jump to: any field after this one, plus "finish".
  const idx = allFields.findIndex((f) => f.id === field.id);
  const jumpTargets = allFields
    .map((f, i) => ({ ...f, i }))
    .filter((f) => f.i > idx);

  const buttons: TrackedButton[] = cfg.buttons || [];

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <span className="inline-block rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
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
            value={cfg.placeholder || ""}
            onChange={(e) => updateConfig({ placeholder: e.target.value })}
            placeholder="Ex: Digite sua resposta"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
          />
        </Labeled>
      )}

      {isChoice && (
        <>
          <Labeled label="Opções">
            <div className="space-y-2">
              {field.options.map((opt, i) => (
                <div key={opt.id} className="rounded-lg border border-slate-100 p-2">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded border border-slate-200 text-xs font-bold text-slate-400">
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
                        updateOptions(
                          field.options.filter((o) => o.id !== opt.id),
                        )
                      }
                      className="text-slate-300 hover:text-rose-500"
                      disabled={field.options.length <= 1}
                    >
                      ✕
                    </button>
                  </div>

                  {cfg.logicEnabled && (
                    <div className="mt-2 flex items-center gap-2 pl-9 text-xs text-slate-500">
                      <span className="whitespace-nowrap">Se escolher → ir para</span>
                      <select
                        value={opt.goTo ?? ""}
                        onChange={(e) => {
                          const next = field.options.map((o) =>
                            o.id === opt.id
                              ? { ...o, goTo: e.target.value || null }
                              : o,
                          );
                          updateOptions(next);
                        }}
                        className="flex-1 rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-brand-400"
                      >
                        <option value="">Próxima etapa</option>
                        {jumpTargets.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.i + 1}. {t.title || FIELD_TYPE_LABELS[t.type]}
                          </option>
                        ))}
                        <option value="submit">Finalizar formulário</option>
                      </select>
                    </div>
                  )}
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
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                ＋ Adicionar opção
              </button>
            </div>
          </Labeled>

          <div className="space-y-1 rounded-xl border border-slate-100 p-3">
            <Toggle
              label="Múltipla seleção"
              checked={!!cfg.multiple}
              onChange={(v) => updateConfig({ multiple: v })}
            />
            <Toggle
              label="Embaralhar opções"
              checked={!!cfg.shuffle}
              onChange={(v) => updateConfig({ shuffle: v })}
            />
            <Toggle
              label="Mostrar na mesma linha"
              checked={!!cfg.sameLine}
              onChange={(v) => updateConfig({ sameLine: v })}
            />
            <Toggle
              label='Adicionar opção "outros"'
              checked={!!cfg.allowOther}
              onChange={(v) => updateConfig({ allowOther: v })}
            />
            <Toggle
              label="Lógica condicional (pular etapas)"
              desc="Cada opção pode levar o respondente a uma etapa diferente."
              checked={!!cfg.logicEnabled}
              onChange={(v) => updateConfig({ logicEnabled: v })}
            />
          </div>
        </>
      )}

      {field.type === "welcome" && (
        <Labeled label="Texto do botão principal">
          <input
            value={cfg.buttonText || ""}
            onChange={(e) => updateConfig({ buttonText: e.target.value })}
            placeholder="Começar →"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
          />
        </Labeled>
      )}

      {field.type === "thankyou" && (
        <Labeled label="Redirecionar para (opcional)">
          <input
            value={cfg.redirectUrl || ""}
            onChange={(e) => updateConfig({ redirectUrl: e.target.value })}
            placeholder="https://seusite.com/obrigado"
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-400"
          />
        </Labeled>
      )}

      {/* Custom tracked buttons on screens */}
      {isScreen && (
        <Labeled label="Botões extras (rastreados)">
          <div className="space-y-3">
            {buttons.map((b) => (
              <div
                key={b.id}
                className="space-y-2 rounded-lg border border-slate-100 p-2"
              >
                <input
                  defaultValue={b.label}
                  onBlur={(e) =>
                    updateConfig({
                      buttons: buttons.map((x) =>
                        x.id === b.id ? { ...x, label: e.target.value } : x,
                      ),
                    })
                  }
                  placeholder="Texto do botão (ex: Falar no WhatsApp)"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
                <input
                  defaultValue={b.url || ""}
                  onBlur={(e) =>
                    updateConfig({
                      buttons: buttons.map((x) =>
                        x.id === b.id ? { ...x, url: e.target.value } : x,
                      ),
                    })
                  }
                  placeholder="Link de destino (opcional)"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                />
                <div className="flex items-center gap-2">
                  <input
                    defaultValue={b.event || ""}
                    onBlur={(e) =>
                      updateConfig({
                        buttons: buttons.map((x) =>
                          x.id === b.id ? { ...x, event: e.target.value } : x,
                        ),
                      })
                    }
                    placeholder="Evento do Pixel (ex: Contact)"
                    className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
                  />
                  <button
                    onClick={() =>
                      updateConfig({
                        buttons: buttons.filter((x) => x.id !== b.id),
                      })
                    }
                    className="text-slate-300 hover:text-rose-500"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() =>
                updateConfig({
                  buttons: [
                    ...buttons,
                    {
                      id: crypto.randomUUID(),
                      label: "Novo botão",
                      event: "ClickButton",
                    },
                  ],
                })
              }
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              ＋ Adicionar botão
            </button>
            <p className="text-xs text-slate-400">
              Cada clique dispara o evento informado no Pixel do Meta (e na API
              de Conversão) e, se houver link, redireciona levando os UTMs.
            </p>
          </div>
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
    <div className="flex items-start justify-between gap-4 py-1.5">
      <div>
        <p className="text-sm text-slate-600">{label}</p>
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
