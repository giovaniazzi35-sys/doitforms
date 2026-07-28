import Link from "next/link";
import { Logo } from "@/components/Logo";
import { PricingSection } from "@/components/marketing/PricingSection";
import { FaqSection } from "@/components/marketing/FaqSection";

export default function Home() {
  return (
    <div className="flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Features />
        <EditorPreview />
        <Integrations />
        <PricingSection />
        <FaqSection />
        <CtaBanner />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
          <a href="#recursos" className="hover:text-slate-900">Recursos</a>
          <a href="#precos" className="hover:text-slate-900">Preços</a>
          <a href="#faq" className="hover:text-slate-900">Dúvidas</a>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            Criar conta
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-20 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
          🇧🇷 Produto brasileiro
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
          Crie <span className="brand-text-gradient">formulários</span> que
          geram clientes
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          Monte pesquisas, quizzes e formulários de captação em minutos. Com
          rastreamento de UTM e <strong>Meta Pixel</strong> nativo para escalar
          seus anúncios. Pague em real, sem dólar.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-xl bg-brand-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-600/20 transition hover:bg-brand-700"
          >
            Começar grátis →
          </Link>
          <a
            href="#recursos"
            className="rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-base font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Ver recursos
          </a>
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Não pedimos cartão de crédito para começar.
        </p>

        <div className="animate-fade-up relative mx-auto mt-14 max-w-4xl">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white p-2 shadow-2xl shadow-slate-300/40">
            <div className="rounded-xl bg-white p-8 text-left">
              <div className="mb-6 flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-rose-300" />
                <span className="h-3 w-3 rounded-full bg-amber-300" />
                <span className="h-3 w-3 rounded-full bg-emerald-300" />
              </div>
              <p className="text-sm font-semibold text-brand-600">Pergunta 3 de 9</p>
              <h3 className="mt-2 text-2xl font-bold text-slate-900">
                Qual o faturamento médio da sua empresa?
              </h3>
              <div className="mt-5 grid gap-3">
                {[
                  "Até R$ 20.000 por mês",
                  "Entre R$ 20.000 e R$ 70.000 por mês",
                  "Entre R$ 70.000 e R$ 90.000 por mês",
                ].map((opt, i) => (
                  <div
                    key={opt}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-slate-700 ${
                      i === 2
                        ? "border-brand-400 bg-brand-50"
                        : "border-slate-200"
                    }`}
                  >
                    <span
                      className={`grid h-6 w-6 place-items-center rounded border text-xs font-bold ${
                        i === 2
                          ? "border-brand-500 bg-brand-500 text-white"
                          : "border-slate-300 text-slate-400"
                      }`}
                    >
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: "🧩",
    title: "Vários formatos",
    text: "Texto curto, múltipla escolha, escala de satisfação, telefone, e-mail e muito mais.",
  },
  {
    icon: "🎯",
    title: "Meta Pixel & UTM",
    text: "Dispare eventos PageView e Lead no Pixel do Meta e capture utm_source, gclid e fbclid automaticamente.",
  },
  {
    icon: "📊",
    title: "Exporte suas respostas",
    text: "Baixe tudo em CSV ou veja em formato de tabela, pronto para sua planilha.",
  },
  {
    icon: "🎨",
    title: "Sua marca, suas cores",
    text: "Personalize cores, fontes, logotipo e imagem de fundo do seu jeito.",
  },
  {
    icon: "⚡",
    title: "Atualização instantânea",
    text: "As respostas são salvas na hora. Nada de dados importantes se perderem.",
  },
  {
    icon: "🔗",
    title: "Link e incorporação",
    text: "Compartilhe por um link curto ou incorpore o formulário direto no seu site.",
  },
];

function Features() {
  return (
    <section id="recursos" className="mx-auto max-w-6xl px-4 py-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">
          Tudo que você precisa para captar leads
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Um conjunto de ferramentas simples e poderosas, prontas para te ajudar
          a obter as respostas que você precisa.
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-2xl">
              {f.icon}
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              {f.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function EditorPreview() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h2 className="text-3xl font-bold text-slate-900">
          O editor mais fácil que você já viu
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Construa seu formulário em segundos. Arraste, edite e publique — tudo
          o que você precisa para o seu primeiro formulário.
        </p>
        <div className="mx-auto mt-10 max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex h-10 items-center gap-2 border-b border-slate-100 bg-slate-50 px-4">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
          </div>
          <div className="grid grid-cols-3 text-left">
            <div className="col-span-1 space-y-2 border-r border-slate-100 bg-white p-4">
              {["Boas-vindas", "Qual o seu nome?", "WhatsApp", "Faturamento", "Obrigado!"].map(
                (s, i) => (
                  <div
                    key={s}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      i === 0
                        ? "bg-brand-50 font-medium text-brand-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {i + 1}. {s}
                  </div>
                ),
              )}
            </div>
            <div className="col-span-2 bg-slate-50 p-8">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-slate-900">
                  🚀 Tenha mais clientes todos os dias
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Exclusivo para empresas que investem em anúncios.
                </p>
                <button className="mt-6 w-full rounded-lg bg-brand-600 py-3 text-sm font-semibold text-white">
                  Quero começar →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Integrations() {
  const items = [
    "Planilhas",
    "Meta Pixel",
    "Google Ads",
    "Pixel",
    "Zapier",
    "Webhooks",
    "Slack",
    "Notion",
  ];
  return (
    <section className="mx-auto max-w-6xl px-4 py-20 text-center">
      <h2 className="text-3xl font-bold text-slate-900">
        Conecte com suas ferramentas
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-slate-600">
        Envie suas respostas para onde você já trabalha. Não perca nenhum lead.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        {items.map((i) => (
          <span
            key={i}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-600 shadow-sm"
          >
            {i}
          </span>
        ))}
      </div>
    </section>
  );
}

function CtaBanner() {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-24">
      <div className="brand-gradient overflow-hidden rounded-3xl px-8 py-14 text-center text-white shadow-xl">
        <h2 className="text-3xl font-bold">Pronto para captar mais clientes?</h2>
        <p className="mx-auto mt-3 max-w-lg text-white/90">
          Crie seu primeiro formulário agora. É grátis e leva menos de 2 minutos.
        </p>
        <Link
          href="/signup"
          className="mt-7 inline-block rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-brand-700 shadow-lg transition hover:bg-slate-50"
        >
          Criar conta grátis →
        </Link>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-slate-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-500 sm:flex-row">
        <Logo textClass="text-slate-700" />
        <p>Feito com 💜 no Brasil · doitforms {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
