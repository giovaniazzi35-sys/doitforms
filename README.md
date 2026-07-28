# doitforms

Construtor de formulários inteligentes (clone do respondi.app) com rastreamento
de **UTM / GCLID / FBCLID** e **Meta (Facebook) Pixel** nativo. Feito com
Next.js 16 (App Router) + Supabase + Tailwind CSS.

## Recursos

- **Landing page** em PT-BR (hero, recursos, editor, integrações, preços, FAQ).
- **Autenticação** (Supabase Auth – e-mail/senha).
- **Dashboard** de formulários com contagem de respostas.
- **Editor multi-etapas** estilo typeform: telas de boas-vindas/agradecimento e
  campos de resposta curta, texto longo, e-mail, telefone e múltipla escolha.
  Reordenar, editar e publicar.
- **Personalização** de estilo (cores, fonte, bordas, logo, imagem de fundo).
- **Formulário público** (`/f/[slug]`) + **incorporação** (`/embed/[slug]`).
- **Meta Pixel por formulário**: dispara `PageView` ao abrir e `Lead` ao concluir
  (nomes de evento configuráveis, evento por etapa opcional). Captura `fbclid`,
  `_fbp` e sintetiza `_fbc`.
- **Rastreamento** de `utm_source/medium/campaign/term/content`, `gclid`, `fbclid`
  salvos em cada resposta.
- **Respostas**: visão detalhada com bloco de rastreamento, visão em tabela e
  **exportação CSV**.
- **Conversions API** (server-side) com rota scaffold em `app/api/capi`.

## Stack

- Next.js 16 + React 19 + TypeScript
- Tailwind CSS v4
- Supabase (Postgres + Auth + RLS)
- Deploy: Vercel

## Banco de dados (Supabase)

Tabelas com prefixo `df_` e RLS por dono:

- `df_profiles` — perfil (criado por trigger no signup)
- `df_forms` — formulários (estilo, settings, pixel, tracking)
- `df_form_fields` — campos/etapas
- `df_responses` — respostas + dados de rastreamento
- `df_response_answers` — respostas por campo

Envios públicos passam pela função `df_submit_response` (`SECURITY DEFINER`), que
valida se o formulário está publicado antes de inserir — o `anon` nunca escreve
diretamente nas tabelas.

## Desenvolvimento

```bash
npm install
cp .env.example .env.local   # preencha as variáveis do Supabase
npm run dev
```

## Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave publishable/anon |
| `NEXT_PUBLIC_SITE_URL` | URL pública (redirects de auth, links) |
| `META_CAPI_ACCESS_TOKEN` | (Opcional) token da Conversions API do Meta |

## Deploy (Vercel)

1. Configure as variáveis acima no projeto Vercel.
2. Em Supabase → Authentication → URL Configuration, defina o **Site URL** e os
   **Redirect URLs** para o domínio da Vercel (`https://SEU-APP.vercel.app`).
