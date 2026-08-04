import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { ContaClient } from "./ContaClient";
import type { ProfileIntegrations } from "@/lib/types";

export const metadata = { title: "Conta e integrações · DOITFORMS" };
export const dynamic = "force-dynamic";

export default async function ContaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("df_profiles")
    .select("meta_pixel_id, meta_capi_token, ga_id, gtm_id, tiktok_pixel_id")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <Link href="/dashboard">
            <Logo />
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            ← Meus formulários
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <ContaClient
          email={user.email ?? ""}
          initial={(profile ?? {
            meta_pixel_id: null,
            meta_capi_token: null,
            ga_id: null,
            gtm_id: null,
            tiktok_pixel_id: null,
          }) as ProfileIntegrations}
        />
      </main>
    </div>
  );
}
