import type { BlocoProposta, TipoBloco } from "@/types";

export const ROTULO_BLOCO: Record<TipoBloco, string> = {
  saudacao: "Saudação",
  contexto: "Contexto",
  descricao_servico: "Descrição do Serviço",
  cronograma: "Cronograma",
  investimento: "Investimento",
  condicoes_pagamento: "Condições de Pagamento",
  validade: "Validade da Proposta",
  garantia: "Garantia",
  fechamento: "Fechamento",
  diagnostico: "Diagnóstico",
  escopo_tecnico: "Escopo Técnico",
  materiais: "Materiais",
  prazo_detalhado: "Prazo Detalhado",
  briefing: "Briefing",
  processo_criativo: "Processo Criativo",
  entregaveis: "Entregáveis",
  revisoes: "Revisões",
  metodologia: "Metodologia",
  metricas: "Métricas",
  custom: "Seção Personalizada"
};

/** Blocos que nunca podem ser removidos pelo usuário, apenas editados. */
export const BLOCOS_SEMPRE_OBRIGATORIOS: readonly TipoBloco[] = [
  "descricao_servico",
  "investimento",
  "condicoes_pagamento",
  "validade"
];

/** Ordena os blocos pela propriedade `ordem`, sem mutar o array original. */
export function ordenarBlocos(blocos: BlocoProposta[]): BlocoProposta[] {
  return [...blocos].sort((a, b) => a.ordem - b.ordem);
}

/**
 * Deriva um texto plano a partir dos blocos visíveis, na ordem correta.
 * Usado como fallback em `texto_gerado_ia` (compatibilidade, busca simples)
 * e como base para as mensagens de WhatsApp.
 */
export function textoPlanoDosBlocos(blocos: BlocoProposta[]): string {
  return ordenarBlocos(blocos)
    .filter((bloco) => bloco.visivel)
    .map((bloco) => bloco.conteudo.trim())
    .filter(Boolean)
    .join("\n\n");
}

/** Reindexa a propriedade `ordem` de 0..n a partir da ordem atual do array. */
export function reindexarBlocos(blocos: BlocoProposta[]): BlocoProposta[] {
  return blocos.map((bloco, indice) => ({ ...bloco, ordem: indice }));
}

let contador = 0;

/** Gera um id local simples e estável para blocos criados no navegador. */
export function gerarIdBloco(): string {
  contador += 1;
  return `bloco-${Date.now()}-${contador}`;
}
