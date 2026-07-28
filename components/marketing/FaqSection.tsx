const FAQS = [
  {
    q: "Como funciona o doitforms?",
    a: "Você cria um formulário no editor, adiciona perguntas de vários tipos, personaliza as cores e publica. O link pode ser compartilhado ou incorporado no seu site. As respostas ficam salvas na sua conta.",
  },
  {
    q: "Posso rastrear meus anúncios com o Meta Pixel?",
    a: "Sim. Cada formulário tem um campo para o ID do seu Pixel do Meta. Disparamos automaticamente os eventos PageView (ao abrir) e Lead (ao concluir), além de capturar utm_source, utm_medium, gclid e fbclid de cada resposta.",
  },
  {
    q: "Posso personalizar meu formulário?",
    a: "Com certeza. Você pode alterar a cor do botão, da pergunta, da resposta e do fundo, adicionar seu logotipo, uma imagem de fundo e escolher a fonte.",
  },
  {
    q: "Como exporto as respostas?",
    a: "Na aba Respostas você pode ver cada resposta em detalhe, alternar para o formato de tabela e exportar tudo em CSV com um clique.",
  },
  {
    q: "O doitforms salva as respostas automaticamente?",
    a: "Sim. Cada envio é salvo na hora no nosso banco de dados. Você não perde nenhuma resposta.",
  },
  {
    q: "Posso incorporar o formulário no meu site?",
    a: "Sim. Na aba Compartilhar você gera um código de incorporação (iframe) com a largura e altura que quiser.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim, sem multa e sem burocracia. Você continua no ar até o fim do período já pago.",
  },
];

export function FaqSection() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">Perguntas frequentes</h2>
        <p className="mt-3 text-slate-600">
          Tire suas dúvidas sobre o doitforms.
        </p>
      </div>
      <div className="mt-10 divide-y divide-slate-100 rounded-2xl border border-slate-100">
        {FAQS.map((f) => (
          <details key={f.q} className="group px-6 py-5">
            <summary className="flex cursor-pointer items-center justify-between text-left font-medium text-slate-800 [&::-webkit-details-marker]:hidden">
              {f.q}
              <span className="ml-4 text-2xl text-slate-400 transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
