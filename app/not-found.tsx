import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 text-center">
      <div>
        <Logo className="justify-center" />
        <h1 className="mt-8 text-5xl font-extrabold text-slate-900">404</h1>
        <p className="mt-3 text-slate-500">
          Não encontramos essa página ou o formulário não está publicado.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
