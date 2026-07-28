"use client";

import { useState } from "react";
import {
  FIELD_TYPE_LABELS,
  type FormField,
  type FieldType,
} from "@/lib/types";

const ADDABLE: FieldType[] = [
  "short_text",
  "long_text",
  "email",
  "phone",
  "multiple_choice",
  "welcome",
  "thankyou",
];

const TYPE_BADGE: Record<FieldType, string> = {
  welcome: "bg-emerald-50 text-emerald-600",
  thankyou: "bg-emerald-50 text-emerald-600",
  short_text: "bg-sky-50 text-sky-600",
  long_text: "bg-sky-50 text-sky-600",
  email: "bg-violet-50 text-violet-600",
  phone: "bg-rose-50 text-rose-600",
  multiple_choice: "bg-purple-50 text-purple-600",
};

export function StepList({
  fields,
  selectedId,
  onSelect,
  onAdd,
  onMove,
  onDelete,
}: {
  fields: FormField[];
  selectedId: string;
  onSelect: (id: string) => void;
  onAdd: (type: FieldType) => void;
  onMove: (id: string, dir: -1 | 1) => void;
  onDelete: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="thin-scroll flex-1 overflow-y-auto p-3">
        {fields.map((f, i) => (
          <div
            key={f.id}
            onClick={() => onSelect(f.id)}
            className={`group mb-1.5 cursor-pointer rounded-lg border px-3 py-2.5 transition ${
              selectedId === f.id
                ? "border-brand-300 bg-brand-50"
                : "border-transparent hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-700">
                  {f.title || "Sem título"}
                </p>
                <span
                  className={`mt-0.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${TYPE_BADGE[f.type]}`}
                >
                  {FIELD_TYPE_LABELS[f.type]}
                </span>
              </div>
              <div className="flex flex-col opacity-0 transition group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove(f.id, -1);
                  }}
                  className="px-1 text-xs text-slate-400 hover:text-slate-700"
                  title="Mover para cima"
                >
                  ▲
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMove(f.id, 1);
                  }}
                  className="px-1 text-xs text-slate-400 hover:text-slate-700"
                  title="Mover para baixo"
                >
                  ▼
                </button>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(f.id);
                }}
                className="px-1 text-slate-300 opacity-0 transition hover:text-rose-500 group-hover:opacity-100"
                title="Excluir"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="relative border-t border-slate-100 p-3">
        <button
          onClick={() => setShowMenu((s) => !s)}
          className="w-full rounded-lg border border-dashed border-brand-300 py-2.5 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
        >
          ＋ Adicionar campo
        </button>
        {showMenu && (
          <div className="absolute bottom-16 left-3 right-3 z-10 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
            {ADDABLE.map((t) => (
              <button
                key={t}
                onClick={() => {
                  onAdd(t);
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
              >
                <span
                  className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${TYPE_BADGE[t]}`}
                >
                  {FIELD_TYPE_LABELS[t]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
