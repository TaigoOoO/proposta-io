-- ============================================================================
-- Proposta.io — Setup inicial do banco de dados (Supabase / PostgreSQL)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Tabela: perfis (estende auth.users)
-- ----------------------------------------------------------------------------
create table public.perfis (
  id uuid references auth.users on delete cascade primary key,
  nome_completo text not null,
  nome_empresa text,
  cnpj text,
  telefone text,
  endereco text,
  created_at timestamp with time zone default now()
);

alter table public.perfis enable row level security;

create policy "Usuários podem ver o próprio perfil"
  on public.perfis for select
  using (auth.uid() = id);

create policy "Usuários podem atualizar o próprio perfil"
  on public.perfis for update
  using (auth.uid() = id);

create policy "Usuários podem inserir o próprio perfil"
  on public.perfis for insert
  with check (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- Tabela: propostas
-- ----------------------------------------------------------------------------
create table public.propostas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  cliente_nome text not null,
  cliente_email text,
  cliente_whatsapp text,
  cliente_endereco text,
  titulo text not null,
  descricao_servico text not null,
  valor_estimado numeric(12,2),
  prazo_dias integer,
  condicoes_pagamento text,
  validade_dias integer default 7,
  texto_gerado_ia text,
  status text default 'rascunho' check (status in ('rascunho', 'enviada', 'aprovada', 'rejeitada')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create index propostas_user_id_idx on public.propostas (user_id);
create index propostas_status_idx on public.propostas (status);
create index propostas_created_at_idx on public.propostas (created_at desc);

alter table public.propostas enable row level security;

-- RLS: usuário só vê/cria/edita/apaga as próprias propostas
create policy "Usuários podem ver as próprias propostas"
  on public.propostas for select
  using (auth.uid() = user_id);

create policy "Usuários podem criar propostas para si mesmos"
  on public.propostas for insert
  with check (auth.uid() = user_id);

create policy "Usuários podem atualizar as próprias propostas"
  on public.propostas for update
  using (auth.uid() = user_id);

create policy "Usuários podem apagar as próprias propostas"
  on public.propostas for delete
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Trigger: atualiza updated_at automaticamente em propostas
-- ----------------------------------------------------------------------------
create or replace function public.definir_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger propostas_updated_at
  before update on public.propostas
  for each row
  execute function public.definir_updated_at();

-- ----------------------------------------------------------------------------
-- Trigger: cria automaticamente um registro em "perfis" quando um novo
-- usuário se cadastra no Supabase Auth, usando os metadados enviados no
-- signUp (nome_completo).
-- ----------------------------------------------------------------------------
create or replace function public.lidar_novo_usuario()
returns trigger as $$
begin
  insert into public.perfis (id, nome_completo)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'nome_completo', ''));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.lidar_novo_usuario();
