"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fbqTrack } from "@/components/MetaPixel";
import { sendCapiEvent } from "@/lib/capi";
import {
  collectTracking,
  appendUtmToUrl,
  type TrackingData,
} from "@/lib/tracking";
import {
  DEFAULT_STYLE,
  DEFAULT_PIXEL_CONFIG,
  type DoitForm,
  type FormField,
} from "@/lib/types";

type Mode = "live" | "preview";

export function FormRenderer({
  form,
  fields,
  mode = "live",
  /** In preview we can force a specific step for editing. */
  forcedIndex,
  /** Effective pixel id (form override or the owner's account default). */
  pixelId,
  /** Shared with MetaPixel's browser PageView so CAPI can deduplicate. */
  pageViewEventId,
}: {
  form: DoitForm;
  fields: FormField[];
  mode?: Mode;
  forcedIndex?: number;
  pixelId?: string | null;
  pageViewEventId?: string;
}) {
  const ordered = useMemo(
    () => [...fields].sort((a, b) => a.position - b.position),
    [fields],
  );
  const style = { ...DEFAULT_STYLE, ...form.style };
  const pixel = { ...DEFAULT_PIXEL_CONFIG, ...form.pixel_config };
  const effectivePixelId = pixelId ?? form.pixel_id;

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [disqualified, setDisqualified] = useState(false);
  const tracking = useRef<TrackingData>({});
  // Mirror of `answers` that updates synchronously — avoids stale-closure reads
  // in validate/submit (e.g. multiple-choice auto-advance fires via setTimeout).
  const answersRef = useRef<Record<string, string>>({});
  const conversionFired = useRef(false);
  const pageViewSent = useRef(false);

  /** Browser pixel + server CAPI with a shared event_id so Meta deduplicates. */
  function fireDualEvent(
    eventName: string,
    params?: Record<string, unknown>,
    { capi = true }: { capi?: boolean } = {},
  ) {
    if (mode !== "live" || !effectivePixelId) return;
    const eventId = crypto.randomUUID();
    fbqTrack(eventName, params, eventId);
    if (capi) {
      sendCapiEvent({
        slug: form.slug,
        eventName,
        eventId,
        fbp: tracking.current.fbp,
        fbc: tracking.current.fbc,
        customData: params,
      });
    }
  }

  /** The configured conversion event (default Lead). Fires exactly once. */
  function fireConversion(context: Record<string, unknown>) {
    if (conversionFired.current || !pixel.leadOnComplete) return;
    conversionFired.current = true;
    fireDualEvent(pixel.leadEventName || "Lead", {
      content_name: form.title,
      ...(pixel.completeEventValue
        ? { value: pixel.completeEventValue, currency: "BRL" }
        : {}),
      ...context,
    });
  }

  useEffect(() => {
    if (mode !== "live") return;
    tracking.current = collectTracking();
    // PageView: the browser event fires in MetaPixel on init; this sends the
    // deduplicated Conversions API counterpart (same event_id) once per load.
    if (!pageViewSent.current && effectivePixelId && pixel.pageViewOnLoad) {
      pageViewSent.current = true;
      sendCapiEvent({
        slug: form.slug,
        eventName: "PageView",
        eventId: pageViewEventId,
        fbp: tracking.current.fbp,
        fbc: tracking.current.fbc,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const current = mode === "preview" && forcedIndex != null
    ? ordered[Math.min(forcedIndex, ordered.length - 1)]
    : ordered[index];

  if (!current) {
    return (
      <div className="grid min-h-full place-items-center p-8 text-slate-400">
        Nenhuma pergunta ainda.
      </div>
    );
  }

  const questionSteps = ordered.filter(
    (f) => f.type !== "welcome" && f.type !== "thankyou",
  );
  const answeredCount = questionSteps.filter((f) => answers[f.id]).length;
  const progress = questionSteps.length
    ? Math.round((answeredCount / questionSteps.length) * 100)
    : 0;

  function setAnswer(fieldId: string, value: string) {
    answersRef.current = { ...answersRef.current, [fieldId]: value };
    setAnswers(answersRef.current);
  }

  function validate(field: FormField): boolean {
    if (!field.required) return true;
    if (field.type === "welcome" || field.type === "thankyou") return true;
    const v = (answersRef.current[field.id] || "").trim();
    if (!v) {
      setError("Este campo é obrigatório.");
      return false;
    }
    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      setError("Digite um e-mail válido.");
      return false;
    }
    return true;
  }

  async function submitResponse(opts?: {
    disqualified?: boolean;
  }): Promise<boolean> {
    if (submitted) return true;
    if (mode === "preview") {
      setSubmitted(true);
      return true;
    }
    setSubmitting(true);
    setError(null);
    try {
      const supabase = createClient();
      const current = answersRef.current;
      const payload = questionSteps
        .filter((f) => current[f.id] != null)
        .map((f) => ({
          field_id: f.id,
          question_label: f.title,
          field_type: f.type,
          value: current[f.id] ?? "",
        }));

      const { error } = await supabase.rpc("df_submit_response", {
        p_slug: form.slug,
        p_completed: true,
        p_tracking: tracking.current,
        p_answers: payload,
        p_disqualified: !!opts?.disqualified,
      });
      if (error) throw error;

      if (opts?.disqualified) {
        // Disqualified leads: fire a distinct event, never the Lead conversion.
        fireDualEvent("Disqualified", { content_name: form.title });
      } else {
        // Completion events: EndForm always; conversion (Lead) unless the
        // configured trigger already fired it at a specific field.
        fireDualEvent("EndForm", { content_name: form.title });
        const trigger = form.conversion_trigger || { type: "finish" };
        if (trigger.type !== "field") {
          fireConversion({ trigger: "finish" });
        }
      }
      setSubmitted(true);
      return true;
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Falha ao enviar. Tente novamente.",
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  /** Does the current answer disqualify the lead (qualification logic)? */
  function isDisqualifyingAnswer(field: FormField): boolean {
    if (field.type !== "multiple_choice" || !field.config?.qualifyEnabled)
      return false;
    const val = answersRef.current[field.id] || "";
    const chosen = field.config?.multiple ? val.split(OTHER_SEP) : [val];
    return field.options.some(
      (o) => o.disqualify && chosen.includes(o.label),
    );
  }

  function handleDisqualifyRedirect() {
    const url = form.settings?.disqualify?.redirectUrl?.trim();
    if (mode === "live" && url) {
      const final = form.append_utm_to_links
        ? appendUtmToUrl(url, tracking.current)
        : url;
      setTimeout(() => {
        window.location.href = final;
      }, 1200);
    }
  }

  /** Resolve where to go after the current step, honoring conditional logic. */
  function resolveTarget(): { index: number; submit: boolean } {
    // Conditional branching only for single-select multiple choice with logic on.
    if (
      current.type === "multiple_choice" &&
      current.config?.logicEnabled &&
      !current.config?.multiple
    ) {
      const chosen = current.options.find(
        (o) => o.label === answersRef.current[current.id],
      );
      if (chosen?.goTo === "submit") return { index: index + 1, submit: true };
      if (chosen?.goTo) {
        const t = ordered.findIndex((f) => f.id === chosen.goTo);
        if (t >= 0) return { index: t, submit: false };
      }
    }
    return { index: index + 1, submit: false };
  }

  async function goNext() {
    if (!validate(current)) return;
    setError(null);

    // Per-step event (ViewContent by default) with CAPI dedup.
    if (mode === "live" && effectivePixelId && pixel.perStepEvent) {
      const evt = pixel.perStepEventName || "ViewContent";
      fireDualEvent(evt, {
        content_name: form.title,
        content_category: "form_step",
        step: index + 1,
        step_title: current.title,
      });
    }

    // Qualification: a disqualifying answer ends the form on the
    // disqualification screen (no conversion event fires).
    if (isDisqualifyingAnswer(current)) {
      const ok = await submitResponse({ disqualified: true });
      if (!ok) return;
      setDisqualified(true);
      handleDisqualifyRedirect();
      return;
    }

    const { index: targetIndex, submit } = resolveTarget();
    const targetField = submit ? undefined : ordered[targetIndex];

    // Conversion trigger "ao chegar em um campo específico".
    const trigger = form.conversion_trigger || { type: "finish" };
    if (
      mode === "live" &&
      trigger.type === "field" &&
      targetField &&
      trigger.fieldId === targetField.id
    ) {
      fireConversion({ trigger: "field", step_title: targetField.title });
    }

    // Submit right before finishing / reaching a thank-you screen.
    if (submit || !targetField || targetField.type === "thankyou") {
      const ok = await submitResponse();
      if (!ok) return;
    }

    // Explicit "finalizar" branch → jump to a thank-you screen if there is one.
    if (submit) {
      const ty = ordered.findIndex((f) => f.type === "thankyou");
      if (ty >= 0) {
        setIndex(ty);
        handleThankyouRedirect(ordered[ty]);
      }
      return;
    }

    if (!targetField) {
      handleThankyouRedirect(current);
      return;
    }
    setIndex(targetIndex);
    if (targetField.type === "thankyou") handleThankyouRedirect(targetField);
  }

  function handleButtonClick(btn: {
    label: string;
    url?: string;
    event?: string;
  }) {
    fireDualEvent(btn.event || "ClickButton", {
      button_label: btn.label,
      content_name: form.title,
    });
    if (btn.url && mode === "live") {
      const dest = form.append_utm_to_links
        ? appendUtmToUrl(btn.url, tracking.current)
        : btn.url;
      setTimeout(() => {
        window.location.href = dest;
      }, 250);
    }
  }

  function handleThankyouRedirect(field: FormField) {
    const url = field.config?.redirectUrl?.trim();
    if (mode === "live" && url) {
      const final = form.append_utm_to_links
        ? appendUtmToUrl(url, tracking.current)
        : url;
      setTimeout(() => {
        window.location.href = final;
      }, 800);
    }
  }

  function goBack() {
    setError(null);
    setIndex((i) => Math.max(0, i - 1));
  }

  const bg = style.backgroundImage
    ? {
        backgroundImage: `url(${style.backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { backgroundColor: style.backgroundColor };

  const radius = `${style.borderRadius ?? 8}px`;

  // Disqualification end screen (qualification logic).
  if (disqualified) {
    const dq = form.settings?.disqualify || {};
    return (
      <div
        className="relative flex min-h-full w-full flex-col"
        style={{ ...bg, fontFamily: style.font }}
      >
        <div className="flex flex-1 items-center justify-center px-5 py-10">
          <div className="w-full max-w-xl animate-fade-up text-center">
            {style.logo && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={style.logo}
                alt="logo"
                className="mx-auto mb-8 h-12 object-contain"
              />
            )}
            <h2
              className="text-2xl font-bold leading-snug sm:text-3xl"
              style={{ color: style.questionColor }}
            >
              {dq.title || "Obrigado pelo seu interesse!"}
            </h2>
            <p className="mt-3 text-base text-slate-500">
              {dq.message ||
                "No momento seu perfil não se encaixa no que buscamos, mas agradecemos a sua participação."}
            </p>
            {mode === "live" && dq.redirectUrl && (
              <p className="mt-4 text-sm text-slate-400">Redirecionando...</p>
            )}
          </div>
        </div>
        {!form.settings?.removeBranding && (
          <div className="pb-4 text-center">
            <span className="text-xs text-slate-400">Feito com doitforms</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-full w-full flex-col"
      style={{ ...bg, fontFamily: style.font }}
    >
      {/* progress bar */}
      {current.type !== "welcome" && (
        <div className="h-1.5 w-full bg-black/5">
          <div
            className="h-full transition-all"
            style={{ width: `${progress}%`, backgroundColor: style.buttonColor }}
          />
        </div>
      )}

      <div className="flex flex-1 items-center justify-center px-5 py-10">
        <div className="w-full max-w-xl">
          {style.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={style.logo}
              alt="logo"
              className="mx-auto mb-8 h-12 object-contain"
            />
          )}

          <StepBody
            field={current}
            style={style}
            radius={radius}
            value={answers[current.id] || ""}
            setValue={(v) => setAnswer(current.id, v)}
            onEnter={goNext}
          />

          {error && (
            <p className="mt-3 text-sm font-medium text-rose-500">{error}</p>
          )}

          <div className="mt-8 flex items-center gap-3">
            {current.type === "thankyou" ? (
              current.config?.redirectUrl ? (
                <p className="text-sm text-slate-400">Redirecionando...</p>
              ) : null
            ) : (
              <>
                <button
                  onClick={goNext}
                  disabled={submitting}
                  className="rounded-lg px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: style.buttonColor, borderRadius: radius }}
                >
                  {submitting
                    ? "Enviando..."
                    : current.type === "welcome"
                      ? current.config?.buttonText || "Começar →"
                      : isLastQuestion(ordered, index)
                        ? "Enviar →"
                        : "Continuar →"}
                </button>
                {index > 0 && current.type !== "welcome" && (
                  <button
                    onClick={goBack}
                    className="text-sm font-medium text-slate-400 hover:text-slate-600"
                  >
                    Voltar
                  </button>
                )}
              </>
            )}
          </div>

          {/* Custom tracked buttons (welcome / thank-you screens) */}
          {(current.config?.buttons?.length ?? 0) > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {current.config!.buttons!.map((b) => (
                <button
                  key={b.id}
                  onClick={() => handleButtonClick(b)}
                  className="rounded-lg border-2 px-5 py-2.5 text-sm font-semibold transition hover:opacity-90"
                  style={{
                    borderColor: style.buttonColor,
                    color: style.buttonColor,
                    borderRadius: radius,
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {!form.settings?.removeBranding && (
        <div className="pb-4 text-center">
          <span className="text-xs text-slate-400">
            Feito com doitforms
          </span>
        </div>
      )}
    </div>
  );
}

function isLastQuestion(ordered: FormField[], index: number): boolean {
  const next = ordered[index + 1];
  return !next || next.type === "thankyou";
}

const OTHER_SEP = " | ";

/** Deterministic shuffle (seeded by field id) so SSR and client agree. */
function seededShuffle<T>(arr: T[], seedStr: string): T[] {
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++)
    seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const j = seed % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function ChoiceField({
  field,
  style,
  radius,
  value,
  setValue,
  onEnter,
}: {
  field: FormField;
  style: DoitForm["style"];
  radius: string;
  value: string;
  setValue: (v: string) => void;
  onEnter: () => void;
}) {
  const cfg = field.config || {};
  const multiple = !!cfg.multiple;
  const allowOther = !!cfg.allowOther;
  const qColor = style.questionColor;

  const opts = useMemo(
    () => (cfg.shuffle ? seededShuffle(field.options, field.id) : field.options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [field.id],
  );
  const optionLabels = useMemo(
    () => new Set(field.options.map((o) => o.label)),
    [field.options],
  );

  // Rebuild local selection state from the stored value (survives back-nav).
  const initParts = value ? value.split(OTHER_SEP) : [];
  const [selected, setSelected] = useState<string[]>(() =>
    initParts.filter((p) => optionLabels.has(p)),
  );
  const [otherOn, setOtherOn] = useState<boolean>(
    () => allowOther && initParts.some((p) => !optionLabels.has(p)),
  );
  const [otherText, setOtherText] = useState<string>(
    () => initParts.find((p) => !optionLabels.has(p)) || "",
  );

  function compose(sel: string[], on: boolean, txt: string): string {
    const parts = [...sel];
    if (on && txt.trim()) parts.push(txt.trim());
    return parts.join(OTHER_SEP);
  }

  function pickSingle(label: string) {
    setSelected([label]);
    setOtherOn(false);
    setValue(label);
    setTimeout(onEnter, 180);
  }

  function toggleMulti(label: string) {
    const next = selected.includes(label)
      ? selected.filter((l) => l !== label)
      : [...selected, label];
    setSelected(next);
    setValue(compose(next, otherOn, otherText));
  }

  function toggleOther() {
    if (multiple) {
      const on = !otherOn;
      setOtherOn(on);
      setValue(compose(selected, on, otherText));
    } else {
      setSelected([]);
      setOtherOn(true);
      setValue(compose([], true, otherText));
    }
  }

  const isSel = (label: string) =>
    multiple ? selected.includes(label) : selected[0] === label;

  const containerClass = cfg.sameLine
    ? "flex flex-wrap gap-3"
    : "grid gap-3";

  return (
    <div>
      <div className={containerClass}>
        {opts.map((opt) => {
          const on = isSel(opt.label);
          const origIndex = field.options.findIndex((o) => o.id === opt.id);
          return (
            <button
              key={opt.id}
              onClick={() =>
                multiple ? toggleMulti(opt.label) : pickSingle(opt.label)
              }
              className={`flex items-center gap-3 border-2 px-4 py-3 text-left text-base transition hover:bg-black/[0.02] ${
                cfg.sameLine ? "" : "w-full"
              }`}
              style={{
                borderColor: on ? style.buttonColor : "#e2e8f0",
                backgroundColor: on ? `${style.buttonColor}12` : undefined,
                borderRadius: radius,
                color: qColor,
              }}
            >
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded border text-xs font-bold"
                style={{
                  borderColor: on ? style.buttonColor : "#cbd5e1",
                  backgroundColor: on ? style.buttonColor : undefined,
                  color: on ? "#fff" : "#94a3b8",
                }}
              >
                {String.fromCharCode(65 + origIndex)}
              </span>
              {opt.label}
            </button>
          );
        })}

        {allowOther && (
          <button
            onClick={toggleOther}
            className={`flex items-center gap-3 border-2 px-4 py-3 text-left text-base transition hover:bg-black/[0.02] ${
              cfg.sameLine ? "" : "w-full"
            }`}
            style={{
              borderColor: otherOn ? style.buttonColor : "#e2e8f0",
              backgroundColor: otherOn ? `${style.buttonColor}12` : undefined,
              borderRadius: radius,
              color: qColor,
            }}
          >
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded border text-xs font-bold"
              style={{
                borderColor: otherOn ? style.buttonColor : "#cbd5e1",
                backgroundColor: otherOn ? style.buttonColor : undefined,
                color: otherOn ? "#fff" : "#94a3b8",
              }}
            >
              +
            </span>
            Outros
          </button>
        )}
      </div>

      {allowOther && otherOn && (
        <input
          autoFocus
          value={otherText}
          onChange={(e) => {
            setOtherText(e.target.value);
            setValue(compose(selected, true, e.target.value));
          }}
          placeholder="Digite sua resposta"
          className="mt-3 w-full border-b-2 bg-transparent px-1 py-2 text-lg outline-none"
          style={{ borderColor: style.answerColor, color: style.answerColor }}
        />
      )}
    </div>
  );
}

function StepBody({
  field,
  style,
  radius,
  value,
  setValue,
  onEnter,
}: {
  field: FormField;
  style: DoitForm["style"];
  radius: string;
  value: string;
  setValue: (v: string) => void;
  onEnter: () => void;
}) {
  const qColor = style.questionColor;
  const aColor = style.answerColor;
  const align = field.config?.align || "center";
  const alignClass =
    align === "left" ? "text-left" : align === "right" ? "text-right" : "text-center";

  const heading = (
    <div className={alignClass}>
      <h2
        className="whitespace-pre-line text-2xl font-bold leading-snug sm:text-3xl"
        style={{ color: qColor }}
      >
        {field.title}
      </h2>
      {field.description && (
        <p className="mt-3 whitespace-pre-line text-base text-slate-500">
          {field.description}
        </p>
      )}
    </div>
  );

  if (field.type === "welcome" || field.type === "thankyou") {
    return (
      <div className="animate-fade-up">
        {field.config?.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={field.config.imageUrl}
            alt=""
            className="mx-auto mb-6 max-h-52 rounded-xl object-cover"
          />
        )}
        {heading}
      </div>
    );
  }

  const inputBase =
    "w-full border-b-2 bg-transparent px-1 py-3 text-lg outline-none transition placeholder:text-slate-300";

  return (
    <div className="animate-fade-up">
      {heading}
      <div className="mt-8">
        {field.type === "long_text" ? (
          <textarea
            autoFocus
            rows={3}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={field.config?.placeholder || "Sua resposta"}
            className={inputBase}
            style={{ borderColor: aColor, color: aColor, textAlign: align }}
          />
        ) : field.type === "multiple_choice" ? (
          <ChoiceField
            key={field.id}
            field={field}
            style={style}
            radius={radius}
            value={value}
            setValue={setValue}
            onEnter={onEnter}
          />
        ) : (
          <input
            autoFocus
            type={field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onEnter();
              }
            }}
            placeholder={field.config?.placeholder || "Sua resposta"}
            className={inputBase}
            style={{ borderColor: aColor, color: aColor, textAlign: align }}
          />
        )}
      </div>
    </div>
  );
}
