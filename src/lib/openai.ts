import { randomUUID } from "node:crypto";
import OpenAI from "openai";
import { z } from "zod";
import {
  CATEGORIAS_TEMPLATE,
  TIPOS_BLOCO,
  TONS_MENSAGEM,
  type BlocoProposta,
  type CategoriaTemplate,
  type GerarPropostaIaRequest,
  type MensagemWhatsapp,
  type ParcelaPagamento,
  type TipoBloco
} from "@/types";
import { formatarMoeda } from "@/lib/utils";
import { BLOCOS_SEMPRE_OBRIGATORIOS, ROTULO_BLOCO } from "@/lib/blocos";

let cliente: OpenAI | null = null;

/**
 * Retorna uma instância singleton do cliente OpenAI.
 * Deve ser usado apenas em código server-side (Route Handlers).
 */
export function criarClienteOpenAI(): OpenAI {
  if (!cliente) {
    cliente = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return cliente;
}

async function pedirJson(mensagemSistema: string, mensagemUsuario: string, maxTokens: number): Promise<unknown> {
  const openai = criarClienteOpenAI();

  const resposta = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: maxTokens,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: mensagemSistema },
      { role: "user", content: mensagemUsuario }
    ]
  });

  const texto = resposta.choices[0]?.message?.content;

  if (!texto) {
    throw new Error("A IA não retornou nenhuma resposta.");
  }

  return JSON.parse(texto) as unknown;
}

// ---------------------------------------------------------------------------
// Geração da proposta em blocos
// ---------------------------------------------------------------------------

const esquemaBlocoBruto = z.object({
  tipo: z.enum(TIPOS_BLOCO),
  titulo: z.string().min(1),
  conteudo: z.string().min(1)
});

const esquemaRespostaBlocos = z.object({
  blocos: z.array(esquemaBlocoBruto).min(1)
});

/**
 * Descreve o vencimento de uma parcela em linguagem natural, a partir de
 * `prazo_dias` (null = a combinar; negativo = antes do prazo/evento;
 * 0 = na assinatura; positivo = dias após a assinatura/entrega).
 */
function formatarPrazoParcela(prazoDias: number | null): string {
  if (prazoDias === null) return "a combinar";
  if (prazoDias === 0) return "na assinatura do contrato";
  if (prazoDias < 0) return `${Math.abs(prazoDias)} dia(s) antes do prazo combinado`;
  return `${prazoDias} dia(s) após a assinatura do contrato`;
}

/**
 * Monta uma tabela em Markdown com o detalhamento exato das parcelas,
 * calculada em código (não pela IA) para garantir que os valores em reais
 * batam com o percentual informado — evita erros de aritmética do modelo.
 */
function formatarParcelasParaIA(parcelas: ParcelaPagamento[], valorTotal: number): string {
  if (!parcelas || parcelas.length === 0) return "";

  const linhas = parcelas.map((parcela, indice) => {
    const valor = (valorTotal * parcela.percentual) / 100;
    const vencimento = parcela.descricao || formatarPrazoParcela(parcela.prazo_dias);
    return `| ${indice + 1}ª | ${parcela.percentual}% | ${formatarMoeda(valor)} | ${vencimento} |`;
  });

  return `| Parcela | Percentual | Valor | Vencimento |
| --- | --- | --- | --- |
${linhas.join("\n")}`;
}


function montarPromptBlocos(
  dados: GerarPropostaIaRequest,
  promptSistemaTemplate: string,
  estrutura: TipoBloco[]
): string {
  const nomeAssinatura = dados.nome_empresa
    ? `${dados.nome_prestador} — ${dados.nome_empresa}`
    : dados.nome_prestador;

  const secoesEsperadas = estrutura.map((tipo) => `- ${tipo} ("${ROTULO_BLOCO[tipo]}")`).join("\n");
  const tabelaParcelas = formatarParcelasParaIA(dados.condicoes_pagamento, dados.valor_estimado);

  return `Gere o conteúdo de uma proposta comercial brasileira em português, dividida nos blocos abaixo, nesta ordem exata:
${secoesEsperadas}

DADOS DO CLIENTE:
- Nome: ${dados.cliente_nome}
${dados.cliente_endereco ? `- Endereço: ${dados.cliente_endereco}` : ""}

DADOS DO SERVIÇO:
- Título da proposta: ${dados.titulo}
- Descrição fornecida pelo prestador (use como base e desenvolva de forma profissional): ${dados.descricao_servico}
- Valor: ${formatarMoeda(dados.valor_estimado)}
- Prazo de execução: ${dados.prazo_dias} dia(s)
- Validade da proposta: ${dados.validade_dias} dia(s) a partir de hoje

TABELA DE PARCELAS (use estes valores exatamente como estão, não recalcule):
${tabelaParcelas}

PRESTADOR DE SERVIÇO (assinatura): ${nomeAssinatura}

Responda apenas com um objeto JSON no formato:
{"blocos": [{"tipo": "saudacao", "titulo": "Saudação", "conteudo": "..."}, ...]}

Regras:
- Gere exatamente um bloco para cada item da lista acima, na mesma ordem, com o "tipo" correspondente.
- "conteudo" deve ser texto simples (pode usar quebras de linha e marcadores "- " para listas), sem markdown de títulos — EXCETO no bloco "condicoes_pagamento", que deve reproduzir a tabela de parcelas fornecida acima (em Markdown, com os mesmos valores) seguida de uma frase curta sobre a forma de pagamento (PIX ou transferência bancária).
- O bloco de "investimento" deve declarar claramente o valor total em reais (${formatarMoeda(dados.valor_estimado)}).
- O bloco de "validade" deve informar que a proposta é válida por ${dados.validade_dias} dia(s) a partir da emissão.
- Não invente informações que não foram fornecidas e não altere os valores da tabela de parcelas.
- Não inclua nenhum texto fora do JSON.`;
}

/**
 * Gera a proposta comercial já dividida em blocos estruturados, seguindo o
 * tom definido pelo template do nicho detectado.
 */
export async function gerarBlocosProposta(
  dados: GerarPropostaIaRequest,
  promptSistemaTemplate: string,
  estrutura: TipoBloco[]
): Promise<BlocoProposta[]> {
  const mensagemSistema = `Você redige propostas comerciais profissionais em português do Brasil para prestadores de serviço, sempre respondendo em JSON válido. ${promptSistemaTemplate}`;
  const mensagemUsuario = montarPromptBlocos(dados, promptSistemaTemplate, estrutura);

  const bruto = await pedirJson(mensagemSistema, mensagemUsuario, 2200);
  const resultado = esquemaRespostaBlocos.safeParse(bruto);

  if (!resultado.success) {
    throw new Error("A IA retornou um formato de blocos inválido.");
  }

  return resultado.data.blocos.map((bloco, indice) => ({
    id: randomUUID(),
    tipo: bloco.tipo,
    titulo: bloco.titulo || ROTULO_BLOCO[bloco.tipo],
    conteudo: bloco.conteudo.trim(),
    obrigatorio: BLOCOS_SEMPRE_OBRIGATORIOS.includes(bloco.tipo),
    editavel: true,
    visivel: true,
    ordem: indice
  }));
}

// ---------------------------------------------------------------------------
// Classificação automática do tipo de serviço
// ---------------------------------------------------------------------------

const esquemaClassificacao = z.object({
  categoria: z.enum(CATEGORIAS_TEMPLATE),
  confianca: z.number().min(0).max(1)
});

/**
 * Classifica a descrição do serviço em uma das categorias de template
 * disponíveis, com um nível de confiança de 0 a 1.
 */
export async function classificarDescricaoServico(
  descricao: string
): Promise<{ categoria: CategoriaTemplate; confianca: number }> {
  const mensagemSistema =
    "Você classifica descrições de serviços de prestadores brasileiros em categorias de negócio, respondendo sempre em JSON válido.";

  const mensagemUsuario = `Classifique a descrição de serviço abaixo em UMA destas categorias: ${CATEGORIAS_TEMPLATE.join(", ")}.

- "eventos": festas, buffets, decoração, cerimonial, fotografia de eventos.
- "construcao": reformas, pedreiro, elétrica, hidráulica, pintura, marcenaria.
- "design": design gráfico, web design, identidade visual, ilustração.
- "consultoria": consultoria de negócios, financeira, jurídica, marketing, coaching.
- "outros": qualquer coisa que não se encaixe claramente nas anteriores.

Descrição do serviço: "${descricao}"

Responda apenas com: {"categoria": "eventos", "confianca": 0.0 a 1.0}
"confianca" reflete o quão certo você está da classificação.`;

  const bruto = await pedirJson(mensagemSistema, mensagemUsuario, 100);
  const resultado = esquemaClassificacao.safeParse(bruto);

  if (!resultado.success) {
    return { categoria: "outros", confianca: 0 };
  }

  return resultado.data;
}

// ---------------------------------------------------------------------------
// Sugestão de insight de conversão
// ---------------------------------------------------------------------------

export interface DadosAgregadosInsight {
  taxaConversaoGeral: number;
  totalEnviadas: number;
  templates: Array<{ categoria: CategoriaTemplate; nome: string; taxaConversao: number; totalEnviadas: number }>;
}

/**
 * Gera uma frase curta em linguagem natural sugerindo uma ação com base nos
 * padrões observados nas propostas do usuário.
 */
export async function gerarSugestaoInsight(dados: DadosAgregadosInsight): Promise<string> {
  const mensagemSistema =
    "Você é um analista de vendas que dá sugestões curtas, específicas e acionáveis em português do Brasil, respondendo sempre em JSON válido.";

  const mensagemUsuario = `Com base nestes dados agregados de propostas comerciais de um prestador de serviço, escreva UMA frase curta (máximo 220 caracteres) com uma sugestão prática para aumentar a taxa de conversão. Baseie-se apenas nos números fornecidos, sem inventar dados.

Taxa de conversão geral: ${dados.taxaConversaoGeral.toFixed(0)}%
Total de propostas enviadas: ${dados.totalEnviadas}
Desempenho por template:
${dados.templates.map((t) => `- ${t.nome}: ${t.taxaConversao.toFixed(0)}% de conversão em ${t.totalEnviadas} proposta(s) enviada(s)`).join("\n")}

Responda apenas com: {"sugestao": "..."}`;

  const bruto = await pedirJson(mensagemSistema, mensagemUsuario, 200);
  const resultado = z.object({ sugestao: z.string().min(1) }).safeParse(bruto);

  if (!resultado.success) {
    return "Continue enviando propostas para desbloquear sugestões personalizadas de conversão.";
  }

  return resultado.data.sugestao;
}

// ---------------------------------------------------------------------------
// Mensagens de WhatsApp com tom adaptativo
// ---------------------------------------------------------------------------

const esquemaMensagensWhatsapp = z.object({
  mensagens: z
    .array(
      z.object({
        tom: z.enum(TONS_MENSAGEM),
        mensagem: z.string().min(1)
      })
    )
    .length(3)
});

export interface DadosMensagemWhatsapp {
  clienteNome: string;
  tituloProposta: string;
  valorEstimado: number;
}

/**
 * Gera 3 variações de mensagem de WhatsApp (direta, cordial, urgente) para o
 * prestador escolher antes de compartilhar a proposta com o cliente.
 */
export async function gerarMensagensWhatsapp(dados: DadosMensagemWhatsapp): Promise<MensagemWhatsapp[]> {
  const mensagemSistema =
    "Você escreve mensagens curtas de WhatsApp em português do Brasil para prestadores de serviço enviarem a clientes, sempre respondendo em JSON válido.";

  const mensagemUsuario = `Escreva 3 variações de mensagem de WhatsApp para o cliente "${dados.clienteNome}", sobre a proposta "${dados.tituloProposta}" no valor de ${formatarMoeda(dados.valorEstimado)}.

Tons:
- "direto": objetivo, poucas palavras, vai direto ao ponto.
- "cordial": educado, caloroso, sem pressa.
- "urgente": comunica que uma resposta rápida é importante, sem ser rude.

Cada mensagem deve ter no máximo 2 frases curtas, soar natural em WhatsApp (não formal como e-mail) e mencionar o nome do cliente.

Responda apenas com:
{"mensagens": [{"tom": "direto", "mensagem": "..."}, {"tom": "cordial", "mensagem": "..."}, {"tom": "urgente", "mensagem": "..."}]}`;

  const bruto = await pedirJson(mensagemSistema, mensagemUsuario, 400);
  const resultado = esquemaMensagensWhatsapp.safeParse(bruto);

  if (!resultado.success) {
    throw new Error("A IA retornou um formato de mensagens inválido.");
  }

  return resultado.data.mensagens;
}
