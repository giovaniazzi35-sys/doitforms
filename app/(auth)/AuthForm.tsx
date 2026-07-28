"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isSignup = mode === "signup";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    const supabase = createClient();

    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo:
              typeof window !== "undefined"
                ? `${window.location.origin}/auth/callback`
                : undefined,
          },
        });
        if (error) throw error;
        // If email confirmation is disabled, a session is returned right away.
        if (data.session) {
          router.push(redirect);
          router.refresh();
        } else {
          setNotice(
            "Conta criada! Verifique seu e-mail para confirmar e depois faça login.",
          );
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(redirect);
        router.refresh();
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Algo deu errado.";
      setError(translate(message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            <Logo />
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-slate-900">
            {isSignup ? "Crie sua conta" : "Bem-vindo de volta"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isSignup
              ? "Comece a criar formulários de graça."
              : "Entre para acessar seus formulários."}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"
        >
          {isSignup && (
            <Field
              label="Nome"
              type="text"
              value={name}
              onChange={setName}
              placeholder="Seu nome"
              required
            />
          )}
          <Field
            label="E-mail"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="voce@empresa.com"
            required
          />
          <Field
            label="Senha"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            required
            minLength={6}
          />

          {error && (
            <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">
              {error}
            </p>
          )}
          {notice && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {loading
              ? "Aguarde..."
              : isSignup
                ? "Criar conta"
                : "Entrar"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-500">
          {isSignup ? (
            <>
              Já tem conta?{" "}
              <Link href="/login" className="font-semibold text-brand-600">
                Entrar
              </Link>
            </>
          ) : (
            <>
              Não tem conta?{" "}
              <Link href="/signup" className="font-semibold text-brand-600">
                Criar conta grátis
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  minLength,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        minLength={minLength}
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
      />
    </label>
  );
}

function translate(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou senha inválidos.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Este e-mail já está cadastrado.";
  if (m.includes("password")) return "A senha precisa ter ao menos 6 caracteres.";
  if (m.includes("email")) return "Verifique o e-mail informado.";
  return message;
}
