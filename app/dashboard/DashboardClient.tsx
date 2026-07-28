"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createForm, deleteForm } from "./actions";

interface FormItem {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  responseCount: number;
}

export function DashboardClient({ forms }: { forms: FormItem[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const filtered = forms.filter((f) =>
    f.title.toLowerCase().includes(query.toLowerCase()),
  );

  async function handleCreate() {
    setCreating(true);
    const fd = new FormData();
    fd.set("title", "Novo formulário");
    try {
      await createForm(fd);
    } catch {
      setCreating(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Excluir o formulário "${title}" e todas as respostas?`)) return;
    await deleteForm(id);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            🔍
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar formulário"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-700 outline-none focus:border-brand-400"
          />
        </div>
        <button
          onClick={handleCreate}
          disabled={creating}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
        >
          {creating ? "Criando..." : "＋ Criar novo"}
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center">
          <p className="text-4xl">📝</p>
          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            {query ? "Nenhum formulário encontrado" : "Você ainda não tem formulários"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {query
              ? "Tente outra busca."
              : "Crie seu primeiro formulário e comece a captar leads."}
          </p>
          {!query && (
            <button
              onClick={handleCreate}
              disabled={creating}
              className="mt-6 rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              ＋ Criar formulário
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <Link href={`/forms/${f.id}`} className="flex flex-1 items-center gap-4">
                <div className="grid h-14 w-20 place-items-center rounded-lg bg-gradient-to-br from-brand-50 to-slate-50 text-2xl">
                  📄
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{f.title}</h3>
                    {f.published ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                        Publicado
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">
                        Rascunho
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {f.responseCount}{" "}
                    {f.responseCount === 1 ? "resposta" : "respostas"}
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-2">
                <Link
                  href={`/forms/${f.id}?tab=respostas`}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Respostas
                </Link>
                <button
                  onClick={() => handleDelete(f.id, f.title)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-rose-500 hover:bg-rose-50"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
