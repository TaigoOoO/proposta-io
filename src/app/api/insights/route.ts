import { NextResponse } from "next/server";
import { criarClienteSupabaseServidor } from "@/lib/supabase-server";
import { gerarSugestaoInsight } from "@/lib/openai";
import { ROTULO_CATEGORIA } from "@/lib/categorias";
import type { CategoriaTemplate, EstatisticasInsights, Proposta, TemplateProposta } from "@/types";

// Esta rota lê a sessão do usuário via cookies (criarClienteSupabaseServidor),
// então não pode ser pré-renderizada estaticamente no build.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await criarClienteSupabaseServidor();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    }

    const [{ data: propostasData, error: erroPropostas }, { data: templatesData }] = await Promise.all([
      supabase
        .from("propostas")
        .select("status, categoria_detectada, enviada_em, respondida_em")
        .eq("user_id", user.id),
      supabase.from("templates_proposta").select("categoria, nome").eq("ativo", true)
    ]);

    if (erroPropostas) {
      console.error("Erro ao buscar propostas para insights:", erroPropostas);
      return NextResponse.json({ erro: "Não foi possível calcular os insights." }, { status: 500 });
    }

    const propostas = (propostasData || []) as Pick<
      Proposta,
      "status" | "categoria_detectada" | "enviada_em" | "respondida_em"
    >[];

    const templates = (templatesData || []) as Pick<TemplateProposta, "categoria" | "nome">[];
    const nomeTemplatePorCategoria = new Map(templates.map((t) => [t.categoria, t.nome]));

    // "Enviada" aqui é definido pelo status atual (!= rascunho), não por
    // `enviada_em`: essa coluna só é preenchida pelo trigger quando o status
    // passa especificamente por "enviada". Se o usuário mudar o status direto
    // de Rascunho para Aprovada/Rejeitada (a UI permite isso), `enviada_em`
    // fica nulo e a proposta ficava invisível para os insights — mesmo sendo
    // exatamente o dado mais importante (uma decisão já tomada).
    const naoRascunho = propostas.filter((p) => p.status !== "rascunho");
    const totalEnviadas = naoRascunho.length;

    // Conversão = aprovadas sobre o total de propostas já decididas
    // (aprovada + rejeitada). Propostas ainda em "enviada" (sem decisão)
    // não entram no cálculo — ainda não têm resultado para medir.
    const decididas = propostas.filter((p) => p.status === "aprovada" || p.status === "rejeitada");
    const totalAprovadas = decididas.filter((p) => p.status === "aprovada").length;
    const taxaConversao = decididas.length > 0 ? (totalAprovadas / decididas.length) * 100 : 0;

    const respondidas = propostas.filter((p) => p.enviada_em && p.respondida_em);
    const tempoMedioRespostaDias =
      respondidas.length > 0
        ? respondidas.reduce((soma, p) => {
            const dias =
              (new Date(p.respondida_em as string).getTime() - new Date(p.enviada_em as string).getTime()) /
              (1000 * 60 * 60 * 24);
            return soma + dias;
          }, 0) / respondidas.length
        : null;

    const porCategoria = new Map<CategoriaTemplate, { aprovadas: number; rejeitadas: number }>();
    for (const proposta of decididas) {
      const categoria = (proposta.categoria_detectada || "outros") as CategoriaTemplate;
      const atual = porCategoria.get(categoria) || { aprovadas: 0, rejeitadas: 0 };
      if (proposta.status === "aprovada") {
        atual.aprovadas += 1;
      } else {
        atual.rejeitadas += 1;
      }
      porCategoria.set(categoria, atual);
    }

    const desempenhoTemplates = Array.from(porCategoria.entries()).map(([categoria, dados]) => {
      const totalDecididasCategoria = dados.aprovadas + dados.rejeitadas;
      return {
        categoria,
        nome: nomeTemplatePorCategoria.get(categoria) || ROTULO_CATEGORIA[categoria],
        taxaConversao: totalDecididasCategoria > 0 ? (dados.aprovadas / totalDecididasCategoria) * 100 : 0,
        totalEnviadas: totalDecididasCategoria
      };
    });

    const templateMaisEfetivo =
      desempenhoTemplates.length > 0
        ? desempenhoTemplates.reduce((melhor, atual) => (atual.taxaConversao > melhor.taxaConversao ? atual : melhor))
        : null;

    const sugestaoIA =
      totalEnviadas === 0
        ? "Envie sua primeira proposta para começar a receber sugestões personalizadas de conversão."
        : await gerarSugestaoInsight({
            taxaConversaoGeral: taxaConversao,
            totalEnviadas,
            templates: desempenhoTemplates
          });

    const resposta: EstatisticasInsights = {
      taxaConversao,
      totalEnviadas,
      totalAprovadas,
      tempoMedioRespostaDias,
      templateMaisEfetivo: templateMaisEfetivo
        ? {
            categoria: templateMaisEfetivo.categoria,
            nome: templateMaisEfetivo.nome,
            taxaConversao: templateMaisEfetivo.taxaConversao
          }
        : null,
      sugestaoIA
    };

    return NextResponse.json(resposta);
  } catch (erro) {
    console.error("Erro inesperado em GET /api/insights:", erro);
    return NextResponse.json(
      { erro: "Ocorreu um erro inesperado ao calcular os insights." },
      { status: 500 }
    );
  }
}
