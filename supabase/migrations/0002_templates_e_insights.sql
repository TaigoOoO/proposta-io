-- ============================================================================
-- Proposta.io — Migration 0002: templates inteligentes, blocos estruturados,
-- métricas de conversão e onboarding contextual.
-- Execute depois de 0001_init.sql.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabela: templates_proposta
-- ----------------------------------------------------------------------------
create table public.templates_proposta (
  id uuid default gen_random_uuid() primary key,
  categoria text not null check (categoria in ('eventos', 'construcao', 'design', 'consultoria', 'outros')),
  nome text not null,
  descricao text,
  prompt_sistema text not null,
  estrutura jsonb not null,
  ativo boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.templates_proposta enable row level security;

-- Templates são dados de referência compartilhados: qualquer usuário
-- autenticado pode lê-los, mas apenas administração via SQL pode escrevê-los.
create policy "Usuários autenticados podem ler templates ativos"
  on public.templates_proposta for select
  to authenticated
  using (ativo = true);

insert into public.templates_proposta (categoria, nome, descricao, prompt_sistema, estrutura) values
(
  'eventos',
  'Festa & Eventos',
  'Ideal para buffets, decoração, cerimonial, fotografia e organização de festas.',
  'Tom festivo, entusiasmado e detalhista. Enfatize a experiência memorável para os convidados e o cuidado com cada detalhe da celebração.',
  '["saudacao", "contexto", "descricao_servico", "cronograma", "investimento", "condicoes_pagamento", "validade", "fechamento"]'::jsonb
),
(
  'construcao',
  'Reforma & Construção',
  'Ideal para pedreiros, eletricistas, encanadores, pintores e reformas em geral.',
  'Tom técnico, profissional e transparente. Enfatize a qualidade dos materiais, prazos realistas e garantias oferecidas.',
  '["saudacao", "diagnostico", "escopo_tecnico", "materiais", "prazo_detalhado", "investimento", "garantia", "condicoes_pagamento", "validade"]'::jsonb
),
(
  'design',
  'Design & Criativo',
  'Ideal para designers gráficos, web designers, ilustradores e criativos em geral.',
  'Tom criativo, visionário e colaborativo. Enfatize o processo criativo, as etapas de revisão e o valor estratégico do design entregue.',
  '["saudacao", "briefing", "processo_criativo", "entregaveis", "revisoes", "investimento", "condicoes_pagamento", "validade", "fechamento"]'::jsonb
),
(
  'consultoria',
  'Consultoria & Assessoria',
  'Ideal para consultores, assessores financeiros, jurídicos e de negócios.',
  'Tom consultivo, estratégico e confiante. Enfatize o retorno sobre o investimento, a metodologia utilizada e os resultados mensuráveis.',
  '["saudacao", "diagnostico", "metodologia", "entregaveis", "metricas", "investimento", "condicoes_pagamento", "validade"]'::jsonb
),
(
  'outros',
  'Geral',
  'Template genérico para serviços que não se encaixam nas categorias específicas.',
  'Tom cordial, profissional e direto, adequado para qualquer tipo de prestação de serviço.',
  '["saudacao", "contexto", "descricao_servico", "investimento", "condicoes_pagamento", "validade", "fechamento"]'::jsonb
);

-- ----------------------------------------------------------------------------
-- Tabela: propostas — novas colunas para blocos, template e métricas
-- ----------------------------------------------------------------------------
alter table public.propostas
  add column blocos jsonb not null default '[]'::jsonb,
  add column categoria_detectada text,
  add column template_id uuid references public.templates_proposta (id) on delete set null,
  add column enviada_em timestamp with time zone,
  add column respondida_em timestamp with time zone;

comment on column public.propostas.blocos is 'Array de BlocoProposta (id, tipo, titulo, conteudo, obrigatorio, editavel, visivel, ordem)';
comment on column public.propostas.texto_gerado_ia is 'Texto plano derivado dos blocos visíveis, mantido para compatibilidade (busca simples, mensagens de WhatsApp)';

-- ----------------------------------------------------------------------------
-- Trigger: registra automaticamente quando a proposta foi enviada e quando
-- recebeu uma resposta (aprovada/rejeitada), para alimentar os insights.
-- ----------------------------------------------------------------------------
create or replace function public.registrar_transicao_status()
returns trigger as $$
begin
  if new.status = 'enviada' and old.status is distinct from 'enviada' and new.enviada_em is null then
    new.enviada_em = now();
  end if;

  if new.status in ('aprovada', 'rejeitada') and old.status is distinct from new.status and new.respondida_em is null then
    new.respondida_em = now();
  end if;

  return new;
end;
$$ language plpgsql;

create trigger propostas_registrar_transicao
  before update on public.propostas
  for each row
  execute function public.registrar_transicao_status();

-- ----------------------------------------------------------------------------
-- Tabela: perfis — onboarding contextual
-- ----------------------------------------------------------------------------
alter table public.perfis
  add column onboarding_visto jsonb not null default '{}'::jsonb;

comment on column public.perfis.onboarding_visto is 'Marcos de onboarding já vistos pelo usuário: perfil_preenchido, primeira_proposta_criada, compartilhou_whatsapp, marco_tres_propostas, tour_pulado';
