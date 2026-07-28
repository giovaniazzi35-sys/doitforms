"use client";

import { useState } from "react";
import type { DoitForm } from "@/lib/types";

export function ShareTab({
  form,
  hasDraft,
}: {
  form: DoitForm;
  hasDraft: boolean;
}) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const link = `${origin}/f/${form.slug}`;
  const [copied, setCopied] = useState(false);
  const [width, setWidth] = useState("100");
  const [widthUnit, setWidthUnit] = useState("%");
  const [height, setHeight] = useState("600");
  const [embedCode, setEmbedCode] = useState<string | null>(null);

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function generateEmbed() {
    const code = `<iframe src="${origin}/embed/${form.slug}" width="${width}${widthUnit}" height="${height}px" frameborder="0" style="border:0;border-radius:12px" title="${form.title}"></iframe>`;
    setEmbedCode(code);
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 lg:grid-cols-2">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Link</h2>
        <p className="mt-1 text-sm text-slate-500">
          Envie esse link por e-mail ou compartilhe nas suas redes sociais.
        </p>

        {!form.published && (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            ⚠️ Este formulário ainda não foi publicado. Publique para que o link
            funcione.
          </p>
        )}
        {form.published && hasDraft && (
          <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
            Existe um rascunho não publicado. Publique para aplicar as mudanças.
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <input
            readOnly
            value={link}
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600"
          />
          <button
            onClick={() => copy(link)}
            className="rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
          >
            {copied ? "Copiado!" : "Copiar"}
          </button>
        </div>

        <div className="mt-4 flex gap-4 text-sm font-medium text-slate-500">
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-brand-600"
          >
            Facebook
          </a>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(link)}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-brand-600"
          >
            Twitter
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-brand-600"
          >
            LinkedIn
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(link)}`}
            target="_blank"
            rel="noreferrer"
            className="hover:text-brand-600"
          >
            WhatsApp
          </a>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-bold text-slate-900">
            Código de incorporação
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Adicione o formulário no seu site.
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">Largura</span>
              <div className="flex">
                <input
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-20 rounded-l-lg border border-slate-200 px-2 py-2 text-sm outline-none"
                />
                <select
                  value={widthUnit}
                  onChange={(e) => setWidthUnit(e.target.value)}
                  className="rounded-r-lg border border-l-0 border-slate-200 px-2 py-2 text-sm"
                >
                  <option>%</option>
                  <option>px</option>
                </select>
              </div>
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-slate-600">Altura (px)</span>
              <input
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-24 rounded-lg border border-slate-200 px-2 py-2 text-sm outline-none"
              />
            </label>
            <button
              onClick={generateEmbed}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Gerar código
            </button>
          </div>

          {embedCode && (
            <div className="mt-4">
              <textarea
                readOnly
                value={embedCode}
                rows={3}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-600"
              />
              <button
                onClick={() => copy(embedCode)}
                className="mt-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                {copied ? "Copiado!" : "Copiar código"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* preview mock */}
      <div className="hidden rounded-2xl bg-slate-100 p-8 lg:block">
        <p className="text-center text-sm text-slate-400">
          Exemplo de como ficará no seu site
        </p>
        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <div className="h-2 w-3/4 rounded bg-slate-100" />
            <div className="h-2 w-full rounded bg-slate-100" />
          </div>
          <div className="my-6 grid h-48 place-items-center rounded-xl bg-brand-600 text-white">
            Seu formulário aqui
          </div>
          <div className="space-y-2">
            <div className="h-2 w-full rounded bg-slate-100" />
            <div className="h-2 w-2/3 rounded bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
