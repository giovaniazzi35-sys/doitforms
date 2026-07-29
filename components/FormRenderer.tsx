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

  async function submitResponse(): Promise<boolean> {
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
      });
      if (error) throw error;

      // Completion events: EndForm always; conversion (Lead) unless the
      // configured trigger already fired it at a specific field.
      fireDualEvent("EndForm", { content_name: form.title });
      const trigger = form.conversion_trigger || { type: "finish" };
      if (trigger.type !== "field") {
        fireConversion({ trigger: "finish" });
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

    const nextIndex = index + 1;
    const nextField = ordered[nextIndex];

    // Conversion trigger "ao chegar em um campo específico".
    const trigger = form.conversion_trigger || { type: "finish" };
    if (
      mode === "live" &&
      trigger.type === "field" &&
      nextField &&
      trigger.fieldId === nextField.id
    ) {
      fireConversion({ trigger: "field", step_title: nextField.title });
    }

    // Submit right before showing the thank-you screen (or at the very end).
    if (!nextField || nextField.type === "thankyou") {
      const ok = await submitResponse();
      if (!ok) return;
    }

    if (!nextField) {
      // No explicit thank-you screen; handle redirect if configured.
      handleThankyouRedirect(current);
      return;
    }
    setIndex(nextIndex);

    if (nextField.type === "thankyou") handleThankyouRedirect(nextField);
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

  const heading = (
    <div className="text-center">
      <h2
        className="text-2xl font-bold leading-snug sm:text-3xl"
        style={{ color: qColor }}
      >
        {field.title}
      </h2>
      {field.description && (
        <p className="mt-3 text-base text-slate-500">{field.description}</p>
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
            style={{ borderColor: aColor, color: aColor }}
          />
        ) : field.type === "multiple_choice" ? (
          <div className="grid gap-3">
            {field.options.map((opt, i) => {
              const selected = value === opt.label;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setValue(opt.label);
                    setTimeout(onEnter, 180);
                  }}
                  className="flex items-center gap-3 border-2 px-4 py-3 text-left text-base transition hover:bg-black/[0.02]"
                  style={{
                    borderColor: selected ? style.buttonColor : "#e2e8f0",
                    backgroundColor: selected ? `${style.buttonColor}12` : undefined,
                    borderRadius: radius,
                    color: qColor,
                  }}
                >
                  <span
                    className="grid h-7 w-7 shrink-0 place-items-center rounded border text-xs font-bold"
                    style={{
                      borderColor: selected ? style.buttonColor : "#cbd5e1",
                      backgroundColor: selected ? style.buttonColor : undefined,
                      color: selected ? "#fff" : "#94a3b8",
                    }}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt.label}
                </button>
              );
            })}
          </div>
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
            style={{ borderColor: aColor, color: aColor }}
          />
        )}
      </div>
    </div>
  );
}
