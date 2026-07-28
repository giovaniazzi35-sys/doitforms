"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { deleteResponse } from "@/app/forms/[id]/actions";
import type { DoitForm, FormField, FormResponse } from "@/lib/types";

export function ResponsesTab({
  form,
  fields,
}: {
  form: DoitForm;
  fields: FormField[];
}) {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [table, setTable] = useState(false);

  const questionFields = useMemo(
    () =>
      [...fields]
        .filter((f) => f.type !== "welcome" && f.type !== "thankyou")
        .sort((a, b) => a.position - b.position),
    [fields],
  );

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("df_responses")
        .select("*, df_response_answers(*)")
        .eq("form_id", form.id)
        .order("created_at", { ascending: false });
      const rows = (data || []) as FormResponse[];
      setResponses(rows);
      setSelectedId(rows[0]?.id ?? null);
      setLoading(false);
    })();
  }, [form.id]);

  const selected = responses.find((r) => r.id === selectedId) || null;

  function answerFor(resp: FormResponse, fieldId: string): string {
    return (
      resp.df_response_answers?.find((a) => a.field_id === fieldId)?.value || "—"
    );
  }

  async function handleDelete(id: string) {
    if (!confirm("Remover esta resposta?")) return;
    await deleteResponse(form.id, id);
    setResponses((rs) => rs.filter((r) => r.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function exportCsv() {
    const headers = [
      "identificador",
      "data",
      ...questionFields.map((f) => f.title),
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_term",
      "utm_content",
      "gclid",
      "fbclid",
    ];
    const rows = responses.map((r) => [
      r.submission_id,
      new Date(r.created_at).toLocaleString("pt-BR"),
      ...questionFields.map((f) => answerFor(r, f.id).replace(/^—$/, "")),
      r.utm_source || "",
      r.utm_medium || "",
      r.utm_campaign || "",
      r.utm_term || "",
      r.utm_content || "",
      r.gclid || "",
      r.fbclid || "",
    ]);
    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.title.replace(/\s+/g, "_")}_respostas.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="grid h-full place-items-center text-slate-400">
        Carregando respostas...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
        <h2 className="text-lg font-bold text-slate-900">
          {responses.length}{" "}
          {responses.length === 1 ? "resposta" : "respostas"}
        </h2>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span>Tabela</span>
            <button
              onClick={() => setTable((t) => !t)}
              className={`relative h-6 w-11 rounded-full transition ${
                table ? "bg-brand-600" : "bg-slate-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                  table ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
          </label>
          <button
            onClick={exportCsv}
            disabled={!responses.length}
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
          >
            ⬇ Exportar CSV
          </button>
        </div>
      </div>

      {responses.length === 0 ? (
        <div className="grid flex-1 place-items-center text-center text-slate-400">
          <div>
            <p className="text-4xl">📭</p>
            <p className="mt-3">Ainda não há respostas.</p>
            <p className="text-sm">
              Compartilhe o link do formulário para começar a receber.
            </p>
          </div>
        </div>
      ) : table ? (
        <TableView
          responses={responses}
          questionFields={questionFields}
          answerFor={answerFor}
        />
      ) : (
        <div className="flex min-h-0 flex-1">
          {/* list */}
          <div className="thin-scroll w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white">
            {responses.map((r, i) => {
              const name =
                r.df_response_answers?.find((a) => a.value)?.value ||
                "Sem nome";
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`block w-full border-b border-slate-50 px-4 py-3 text-left transition ${
                    selectedId === r.id ? "bg-brand-50" : "hover:bg-slate-50"
                  }`}
                >
                  <span className="text-xs font-bold text-slate-400">
                    {responses.length - i}.
                  </span>{" "}
                  <span className="text-sm font-medium text-slate-700">
                    {name}
                  </span>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {new Date(r.created_at).toLocaleString("pt-BR")}
                  </p>
                </button>
              );
            })}
          </div>

          {/* detail */}
          <div className="thin-scroll min-h-0 flex-1 overflow-y-auto p-6">
            {selected && (
              <DetailView
                response={selected}
                questionFields={questionFields}
                answerFor={answerFor}
                onDelete={() => handleDelete(selected.id)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailView({
  response,
  questionFields,
  answerFor,
  onDelete,
}: {
  response: FormResponse;
  questionFields: FormField[];
  answerFor: (r: FormResponse, id: string) => string;
  onDelete: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="mb-6 border-b border-slate-100 pb-4 text-xs text-slate-400">
          <p>
            Data de início:{" "}
            {new Date(response.created_at).toLocaleString("pt-BR")}
          </p>
          <p>Identificador: {response.submission_id}</p>
        </div>

        <div className="space-y-5">
          {questionFields.map((f) => (
            <div key={f.id}>
              <p className="text-sm font-semibold text-brand-600">{f.title}</p>
              <p className="mt-1 text-slate-800">{answerFor(response, f.id)}</p>
            </div>
          ))}
        </div>

        {/* tracking block */}
        <div className="mt-8 rounded-xl bg-slate-50 p-4 text-sm">
          <TrackRow label="Source" value={response.utm_source} />
          <TrackRow label="Medium" value={response.utm_medium} />
          <TrackRow label="Campaign" value={response.utm_campaign} />
          <TrackRow label="Term" value={response.utm_term} />
          <TrackRow label="Content" value={response.utm_content} />
          <TrackRow label="Gclid" value={response.gclid} />
          <TrackRow label="Fbclid" value={response.fbclid} />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onDelete}
            className="text-sm font-medium text-rose-500 hover:text-rose-600"
          >
            🗑 Remover
          </button>
        </div>
      </div>
    </div>
  );
}

function TrackRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex gap-3 py-0.5">
      <span className="w-24 shrink-0 font-medium text-slate-400">{label}:</span>
      <span className="truncate text-slate-600">
        {value || "Não informado"}
      </span>
    </div>
  );
}

function TableView({
  responses,
  questionFields,
  answerFor,
}: {
  responses: FormResponse[];
  questionFields: FormField[];
  answerFor: (r: FormResponse, id: string) => string;
}) {
  return (
    <div className="thin-scroll flex-1 overflow-auto p-4">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500">
            <th className="whitespace-nowrap px-3 py-2 font-semibold">Data</th>
            {questionFields.map((f) => (
              <th key={f.id} className="whitespace-nowrap px-3 py-2 font-semibold">
                {f.title}
              </th>
            ))}
            <th className="px-3 py-2 font-semibold">Source</th>
            <th className="px-3 py-2 font-semibold">Medium</th>
            <th className="px-3 py-2 font-semibold">Campaign</th>
          </tr>
        </thead>
        <tbody>
          {responses.map((r) => (
            <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50">
              <td className="whitespace-nowrap px-3 py-2 text-slate-400">
                {new Date(r.created_at).toLocaleDateString("pt-BR")}
              </td>
              {questionFields.map((f) => (
                <td key={f.id} className="px-3 py-2 text-slate-700">
                  {answerFor(r, f.id)}
                </td>
              ))}
              <td className="px-3 py-2 text-slate-500">{r.utm_source || "—"}</td>
              <td className="px-3 py-2 text-slate-500">{r.utm_medium || "—"}</td>
              <td className="px-3 py-2 text-slate-500">
                {r.utm_campaign || "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
