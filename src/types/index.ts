export type StatusProposta = "rascunho" | "enviada" | "aprovada" | "rejeitada";

// ---------------------------------------------------------------------------
// Condições de pagamento — parcelas flexíveis
// ---------------------------------------------------------------------------

export interface ParcelaPagamento {
  id?: string;
  percentual: number; // ex: 30 para 30%
  descricao: string; // ex: "Na assinatura do contrato"
  prazo_dias: number | null; // null = a combinar; negativo = antes do prazo/evento
  valor_calculado?: number;
  ordem: number;
}

// ---------------------------------------------------------------------------
// Blocos estruturados da proposta
// ---------------------------------------------------------------------------

export const TIPOS_BLOCO = [
  "saudacao",
  "contexto",
  "descricao_servico",
  "cronograma",
  "investimento",
  "condicoes_pagamento",
  "validade",
  "garantia",
  "fechamento",
  "diagnostico",
  "escopo_tecnico",
  "materiais",
  "prazo_detalhado",
  "briefing",
  "processo_criativo",
  "entregaveis",
  "revisoes",
  "metodologia",
  "metricas",
  "custom"
] as const;

export type TipoBloco = (typeof TIPOS_BLOCO)[number];

export interface BlocoProposta {
  id: string;
  tipo: TipoBloco;
  titulo: string;
  conteudo: string;
  obrigatorio: boolean;
  editavel: boolean;
  visivel: boolean;
  ordem: number;
}

// ---------------------------------------------------------------------------
// Templates inteligentes
// ---------------------------------------------------------------------------

export const CATEGORIAS_TEMPLATE = ["eventos", "construcao", "design", "consultoria", "outros"] as const;
export type CategoriaTemplate = (typeof CATEGORIAS_TEMPLATE)[number];

export interface TemplateProposta {
  id: string;
  categoria: CategoriaTemplate;
  nome: string;
  descricao: string | null;
  prompt_sistema: string;
  estrutura: TipoBloco[];
  ativo: boolean;
  created_at: string;
}

export interface ClassificarServicoRequest {
  descricao: string;
}

export interface ClassificarServicoResponse {
  categoria: CategoriaTemplate;
  confianca: number;
  template_id: string | null;
  template_nome: string | null;
}

// ---------------------------------------------------------------------------
// Onboarding contextual
// ---------------------------------------------------------------------------

export interface OnboardingVisto {
  perfil_preenchido?: boolean;
  primeira_proposta_criada?: boolean;
  compartilhou_whatsapp?: boolean;
  marco_tres_propostas?: boolean;
  tour_pulado?: boolean;
}

// ---------------------------------------------------------------------------
// Perfil e Proposta
// ---------------------------------------------------------------------------

export interface Perfil {
  id: string;
  nome_completo: string;
  nome_empresa: string | null;
  cnpj: string | null;
  telefone: string | null;
  endereco: string | null;
  onboarding_visto: OnboardingVisto;
  created_at: string;
}

export interface Proposta {
  id: string;
  user_id: string;
  cliente_nome: string;
  cliente_email: string | null;
  cliente_whatsapp: string | null;
  cliente_endereco: string | null;
  titulo: string;
  descricao_servico: string;
  valor_estimado: number | null;
  prazo_dias: number | null;
  condicoes_pagamento: ParcelaPagamento[];
  validade_dias: number;
  blocos: BlocoProposta[];
  texto_gerado_ia: string | null;
  categoria_detectada: CategoriaTemplate | null;
  template_id: string | null;
  status: StatusProposta;
  enviada_em: string | null;
  respondida_em: string | null;
  created_at: string;
  updated_at: string;
}

export interface NovaPropostaClienteInput {
  cliente_nome: string;
  cliente_email: string;
  cliente_whatsapp: string;
  cliente_endereco: string;
}

export interface NovaPropostaServicoInput {
  titulo: string;
  descricao_servico: string;
  valor_estimado: string;
  prazo_dias: string;
  condicoes_pagamento: ParcelaPagamento[];
  validade_dias: string;
}

export interface NovaPropostaInput
  extends NovaPropostaClienteInput,
    NovaPropostaServicoInput {}

export interface EstatisticasDashboard {
  totalPropostas: number;
  enviadasEsteMes: number;
  taxaConversao: number;
  valorTotalEstimado: number;
}

// ---------------------------------------------------------------------------
// Geração com IA (blocos)
// ---------------------------------------------------------------------------

export interface GerarPropostaIaRequest {
  cliente_nome: string;
  cliente_endereco: string;
  titulo: string;
  descricao_servico: string;
  valor_estimado: number;
  prazo_dias: number;
  condicoes_pagamento: ParcelaPagamento[];
  validade_dias: number;
  categoria: CategoriaTemplate;
  nome_prestador: string;
  nome_empresa: string | null;
}

export interface GerarPropostaIaResponse {
  blocos: BlocoProposta[];
  template_id: string;
  categoria: CategoriaTemplate;
}

// ---------------------------------------------------------------------------
// Insights de conversão
// ---------------------------------------------------------------------------

export interface EstatisticasInsights {
  taxaConversao: number;
  totalEnviadas: number;
  totalAprovadas: number;
  tempoMedioRespostaDias: number | null;
  templateMaisEfetivo: { categoria: CategoriaTemplate; nome: string; taxaConversao: number } | null;
  sugestaoIA: string;
}

// ---------------------------------------------------------------------------
// Mensagens de WhatsApp com tom adaptativo
// ---------------------------------------------------------------------------

export const TONS_MENSAGEM = ["direto", "cordial", "urgente"] as const;
export type TomMensagem = (typeof TONS_MENSAGEM)[number];

export interface MensagemWhatsapp {
  tom: TomMensagem;
  mensagem: string;
}

export interface ApiErro {
  erro: string;
  detalhes?: unknown;
}
