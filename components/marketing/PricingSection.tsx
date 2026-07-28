import Link from "next/link";

const PLANS = [
  {
    name: "Grátis",
    price: "R$ 0,00",
    period: "",
    desc: "Para pequenos projetos pessoais que estão iniciando.",
    cta: "Começar grátis",
    highlight: false,
    features: [
      "100 respostas por mês",
      "3 formulários",
      "Suporte em português",
      "Rastreamento UTM básico",
      "Múltiplos formatos de campo",
    ],
  },
  {
    name: "Solo",
    price: "R$ 57,00",
    period: "/mês",
    desc: "Para projetos pessoais que precisam de mais recursos.",
    cta: "Assinar",
    highlight: false,
    features: [
      "1.000 respostas por mês",
      "Formulários ilimitados",
      "Remover a marca doitforms",
      "Personalize cores e logotipo",
      "Google Analytics",
    ],
  },
  {
    name: "PRO",
    price: "R$ 147,00",
    period: "/mês",
    desc: "Para profissionais com campanhas de tráfego pago.",
    cta: "Assinar",
    highlight: true,
    features: [
      "5.000 respostas por mês",
      "Meta Pixel + eventos Lead",
      "Alerta por WhatsApp e e-mail",
      "Encaminhar respostas",
      "Facebook Pixel & Google Tag",
    ],
  },
  {
    name: "Empresa",
    price: "R$ 237,00",
    period: "/mês",
    desc: "Para empresas e times que precisam colaborar.",
    cta: "Assinar",
    highlight: false,
    features: [
      "15.000 respostas por mês",
      "Múltiplos usuários",
      "Domínio personalizado",
      "Times e permissões",
      "Suporte prioritário",
    ],
  },
];

export function PricingSection() {
  return (
    <section id="precos" className="bg-slate-900 py-20 text-white">
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Sim, aceitamos boleto! 😉</h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Cansado de pagar IOF e nunca saber quanto a mensalidade do seu
            serviço vai custar no fim do mês? Nós também.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((p) => (
            <div
              key={p.name}
              className={`flex flex-col rounded-2xl p-6 ${
                p.highlight
                  ? "bg-white text-slate-900 shadow-2xl ring-2 ring-brand-500"
                  : "bg-slate-800 text-white"
              }`}
            >
              {p.highlight && (
                <span className="mb-2 inline-block w-fit rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                  Mais popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <div className="mt-2 flex items-end gap-1">
                <span className="text-3xl font-extrabold">{p.price}</span>
                <span
                  className={`pb-1 text-sm ${
                    p.highlight ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  {p.period}
                </span>
              </div>
              <p
                className={`mt-2 text-sm ${
                  p.highlight ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {p.desc}
              </p>
              <Link
                href="/signup"
                className={`mt-5 rounded-lg py-2.5 text-center text-sm font-semibold transition ${
                  p.highlight
                    ? "bg-brand-600 text-white hover:bg-brand-700"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {p.cta}
              </Link>
              <ul className="mt-6 space-y-2.5 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span
                      className={
                        p.highlight ? "text-brand-600" : "text-brand-400"
                      }
                    >
                      ✓
                    </span>
                    <span className={p.highlight ? "text-slate-700" : "text-slate-300"}>
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-8 text-center text-sm text-slate-400">
          Quer pagar via boleto bancário? Fale com a gente.
        </p>
      </div>
    </section>
  );
}
