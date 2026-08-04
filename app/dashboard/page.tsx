import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { DashboardClient } from "./DashboardClient";

export const metadata = { title: "Meus formulários · DOITFORMS" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: forms } = await supabase
    .from("df_forms")
    .select("id, title, slug, published, updated_at")
    .order("updated_at", { ascending: false });

  // response counts per form
  const ids = (forms || []).map((f) => f.id);
  const counts: Record<string, number> = {};
  if (ids.length) {
    const { data: responses } = await supabase
      .from("df_responses")
      .select("form_id")
      .in("form_id", ids);
    for (const r of responses || []) {
      counts[r.form_id] = (counts[r.form_id] || 0) + 1;
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
              PRO
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-500 sm:inline">
              {user.email}
            </span>
            <Link
              href="/conta"
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              ⚙ Integrações
            </Link>
            <form action="/auth/signout" method="post">
              <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                Sair
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10">
        <DashboardClient
          forms={(forms || []).map((f) => ({
            ...f,
            responseCount: counts[f.id] || 0,
          }))}
        />
      </main>

      <p className="pb-10 text-center text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-600">
          ← Voltar para a página inicial
        </Link>
      </p>
    </div>
  );
}
