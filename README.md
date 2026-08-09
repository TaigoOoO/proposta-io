# Proposta.io

Gerador de orçamentos com IA para prestadores de serviço do Brasil. Crie propostas comerciais profissionais em 3 passos, gere o texto com GPT-4o-mini organizado em blocos editáveis, baixe em PDF e compartilhe por WhatsApp com o tom certo.

## Novidades desta versão (v2)

**Correções críticas:**
- `criarClienteSupabaseServidor()` agora é `async` e usa `await cookies()` — corrige os erros 500 que aconteciam em todas as rotas de API.
- Campos opcionais do cliente (`cliente_email`, `cliente_whatsapp`, `cliente_endereco`) aceitam string vazia sem falhar a validação Zod.
- Todas as rotas de API têm `try/catch` com log detalhado no servidor e mensagens de erro claras para o usuário.

**Novidades de produto:**
- **Templates inteligentes**: a descrição do serviço é classificada por IA (`/api/classificar-servico`) em uma de 5 categorias, cada uma com um tom e uma estrutura de proposta diferentes.
- **Propostas em blocos**: a IA gera a proposta como blocos editáveis (saudação, investimento, condições etc.), que podem ser editados, ocultados, reordenados (arraste pelo ícone) ou removidos — como no Notion.
- **Insights de conversão**: o dashboard calcula taxa de conversão, tempo médio de resposta e o template mais efetivo, e a IA gera uma sugestão em linguagem natural (`/api/insights`).
- **Onboarding contextual**: dicas discretas aparecem no momento certo (perfil incompleto, primeira proposta, primeiro WhatsApp, marco de 3 propostas), sem tour genérico.
- **WhatsApp com tom adaptativo**: ao compartilhar, a IA sugere 3 variações de mensagem (direta, cordial, urgente) além da opção personalizada.
- **Redesign completo**: nova paleta (stone + índigo), tela de login em split-screen, tipografia em escala 1.25, grid de 8px e as animações da Parte 8 (fade-in-up, shimmer, pulse-soft, float).

Nenhuma biblioteca nova foi adicionada — tudo usa a stack já existente (Zod, OpenAI em modo JSON, HTML5 drag-and-drop nativo para os blocos).

## Stack

- **Next.js 14** (App Router) + **TypeScript** (modo `strict`, sem `any`)
- **Tailwind CSS** + **shadcn/ui** (construído com Radix UI)
- **Supabase** — PostgreSQL, Auth e Row Level Security
- **OpenAI** (GPT-4o-mini) para geração de texto
- **@react-pdf/renderer** para geração de PDF
- **Zod** + **react-hook-form** para formulários e validação
- **Framer Motion** (via classes de animação do Tailwind)

## 1. Pré-requisitos

- Node.js 18.18+ (recomendado 20 LTS)
- Uma conta gratuita no [Supabase](https://supabase.com)
- Uma chave de API da [OpenAI](https://platform.openai.com/api-keys) com acesso ao modelo `gpt-4o-mini`

## 2. Configurando o Supabase

1. Crie um novo projeto em [supabase.com](https://supabase.com/dashboard).
2. No painel do projeto, vá em **SQL Editor** → **New query**.
3. Cole o conteúdo do arquivo [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql) e execute (**Run**).
   Isso cria as tabelas `perfis` e `propostas`, as políticas de Row Level Security e os triggers de:
   - criação automática de perfil quando um usuário se cadastra;
   - atualização automática de `updated_at` nas propostas.
4. Em uma **nova query**, cole o conteúdo de [`supabase/migrations/0002_templates_e_insights.sql`](./supabase/migrations/0002_templates_e_insights.sql) e execute.
   Isso cria a tabela `templates_proposta` (com os 5 templates já cadastrados), adiciona as colunas `blocos`,
   `categoria_detectada`, `template_id`, `enviada_em` e `respondida_em` em `propostas`, adiciona
   `onboarding_visto` em `perfis`, e cria o trigger que registra automaticamente `enviada_em`/`respondida_em`
   quando o status da proposta muda.
5. Vá em **Project Settings → API** e copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (nunca exponha esta chave no cliente)
6. (Opcional, recomendado em produção) Em **Authentication → Providers → Email**, você pode desativar a confirmação
   de e-mail para testar mais rápido em ambiente local, ou manter ativada — o app já trata os dois casos
   (rota `/auth/callback`).

## 3. Instalação

```bash
# 1. Instale as dependências
npm install

# 2. Copie o arquivo de variáveis de ambiente
cp .env.local.example .env.local

# 3. Preencha o .env.local com suas credenciais
```

Edite `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
OPENAI_API_KEY=sk-...
```

## 4. Rodando localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000). Você será redirecionado para `/login`. Clique em
**"Criar conta grátis"** para se cadastrar — um perfil é criado automaticamente no banco.

## 5. Build de produção

```bash
npm run build
npm run start
```

## 6. Estrutura de pastas

```
src/
  app/
    (auth)/login, (auth)/register     — autenticação (split-screen com abas Entrar/Criar conta)
    (protegido)/dashboard             — dashboard com estatísticas, insights e últimas propostas
    (protegido)/propostas/nova        — wizard de 3 passos (cliente, serviço, blocos com IA)
    (protegido)/propostas/[id]        — visualização/preview da proposta em blocos
    (protegido)/perfil                — dados do prestador (nome da empresa, CNPJ etc.)
    api/propostas                     — CRUD de propostas (REST, protegido por sessão)
    api/propostas/gerar-ia            — geração da proposta em blocos via GPT-4o-mini
    api/propostas/[id]/whatsapp       — gera as 3 variações de mensagem de WhatsApp
    api/classificar-servico           — classifica a descrição do serviço em um template
    api/insights                      — métricas de conversão + sugestão da IA
    api/gerar-pdf                     — geração e streaming do PDF (a partir dos blocos)
    api/auth/logout                   — encerramento de sessão no servidor
    auth/callback                     — troca do código de confirmação/recuperação por sessão
  components/
    ui/            — primitivos shadcn/ui (button, card, input, select, dialog, stepper...)
    forms/         — formulários reutilizáveis (cliente, serviço + classificação, blocos com IA, perfil)
    propostas/     — lista, card, preview, editor de blocos, ícones e diálogo de WhatsApp
    pdf/           — documento React-PDF (renderiza os blocos) e visualizador embutido
    layout/        — sidebar, bottom nav e cabeçalho
    dashboard/     — conteúdo do dashboard e painel de insights
    onboarding/    — tooltip de onboarding contextual
  lib/             — clientes Supabase/OpenAI, blocos, categorias, onboarding, máscaras BR, validações Zod
  hooks/           — useAuth, usePropostas, useOnboarding
  types/           — tipos TypeScript compartilhados (inclui BlocoProposta, TemplateProposta, Insights)
supabase/migrations/
  0001_init.sql                       — schema inicial (perfis, propostas, RLS)
  0002_templates_e_insights.sql       — templates, blocos, métricas de conversão, onboarding
```

## 7. Decisões de implementação (leia antes de reportar "bug")

O prompt original definia uma estrutura de pastas de referência. Para que o app funcione de ponta a ponta com
dados reais (sem mocks), algumas adições necessárias foram feitas — documentadas aqui para transparência:

- **`@supabase/ssr`** foi adicionado como dependência. É o pacote oficial da Supabase para autenticação com
  cookies em Next.js App Router (Server Components, Route Handlers e Middleware); sem ele, sessões não
  persistem corretamente entre requisições no App Router.
- **`@radix-ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `lucide-react`, `tailwindcss-animate`,
  `sonner`** são as dependências que compõem o próprio shadcn/ui — shadcn não é um pacote único, é um conjunto
  de componentes copiados para o projeto que dependem dessas bibliotecas.
- A biblioteca de geração de PDF é **`@react-pdf/renderer`** (o pacote `react-pdf` "puro" serve apenas para
  *visualizar* PDFs existentes, não para gerá-los — o requisito era gerar PDFs a partir de componentes React).
- As rotas autenticadas (`/dashboard`, `/propostas/*`, `/perfil`) foram agrupadas sob `src/app/(protegido)/`
  (route group) para compartilhar um único layout com sidebar/bottom nav — isso **não** altera as URLs finais
  (continuam `/dashboard`, `/propostas/nova` etc.), apenas organiza o código.
- Foi adicionada a página **`/perfil`**, ausente na especificação original, mas necessária: o schema de
  `perfis` inclui `nome_empresa`, `cnpj`, `telefone` e `endereco`, usados no cabeçalho do PDF e no prompt da IA
  — sem uma tela para preenchê-los, esses campos nunca poderiam ser definidos pelo usuário.
- Login/cadastro chamam o SDK do Supabase diretamente do cliente (`supabase.auth.signInWithPassword` /
  `signUp`), que é o padrão recomendado pela Supabase para App Router — evita duplicar lógica de autenticação
  em rotas de API separadas. Já o **logout** passa por uma rota de servidor (`/api/auth/logout`) para garantir
  que os cookies de sessão sejam limpos corretamente também no lado do servidor.
- O envio por e-mail é simulado com um toast **"Em breve"**, exatamente como pedido na especificação (não é um
  mock de dados, é uma funcionalidade explicitamente fora do escopo desta primeira versão).
- **Geração estruturada com IA**: em vez de adicionar uma biblioteca de structured outputs, a geração de
  blocos, a classificação de serviço, a sugestão de insight e as mensagens de WhatsApp usam o modo nativo
  `response_format: { type: "json_object" }` da API da OpenAI, com o JSON validado por Zod antes de ser usado
  — sem bibliotecas novas, com o mesmo nível de segurança de tipos.
- **Reordenar blocos por arraste** usa a API nativa de drag-and-drop do HTML5 (`draggable`, `onDragStart`,
  `onDragOver`, `onDrop`), já que a lista de regras proíbe adicionar bibliotecas como `@dnd-kit`.
- **Link "Esqueci minha senha"**: estava especificado apenas visualmente, mas foi implementado de fato (com
  `supabase.auth.resetPasswordForEmail`) para não deixar um elemento de UI sem função — evita uma
  funcionalidade "quebrada" na tela de login.
- **`onboarding_visto`** é lido e escrito diretamente pelo cliente (Supabase JS) com leitura-antes-de-escrita
  para mesclar apenas o marco alterado; como é um dado de baixa concorrência (o próprio usuário, em uma aba),
  o pequeno risco de corrida entre escritas simultâneas foi aceito em troca de simplicidade.

## 8. Segurança

- Todas as tabelas têm **Row Level Security** habilitado: cada usuário só lê/escreve seus próprios dados
  (`auth.uid() = user_id`).
- A `SUPABASE_SERVICE_ROLE_KEY` só é usada por `criarClienteSupabaseAdmin()` em `src/lib/supabase-server.ts` e
  nunca é enviada ao navegador — atualmente não está em uso ativo nas rotas (todas operam com a sessão do
  próprio usuário), mas fica disponível para eventuais tarefas administrativas futuras.
- O `middleware.ts` protege `/dashboard` e `/propostas/*` no nível de rota, e cada API route também valida a
  sessão de forma independente antes de tocar no banco.
