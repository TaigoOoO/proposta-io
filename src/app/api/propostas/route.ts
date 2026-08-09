import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { criarClienteSupabaseServidor } from "@/lib/supabase-server";
import { esquemaBloco, esquemaParcelas } from "@/lib/validacoes";
import { textoPlanoDosBlocos } from "@/lib/blocos";
import { CATEGORIAS_TEMPLATE } from "@/types";
import type { Proposta } from "@/types";

// Garante que esta rota nunca sirva uma resposta em cache — a lista de
// propostas precisa refletir o banco em tempo real a cada chamada.
export const dynamic = "force-dynamic";

const esquemaCriarProposta = z.object({
  cliente_nome: z.string().min(2),
  cliente_email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  cliente_whatsapp: z.string().optional().or(z.literal("")),
  cliente_endereco: z.string().optional().or(z.literal("")),
  titulo: z.string().min(3),
  descricao_servico: z.string().min(10),
  valor_estimado: z.number().nonnegative(),
  prazo_dias: z.number().int().positive(),
  condicoes_pagamento: esquemaParcelas,
  validade_dias: z.number().int().positive(),
  blocos: z.array(esquemaBloco).min(1, "A proposta precisa ter ao menos um bloco de conteúdo."),
  categoria_detectada: z.enum(CATEGORIAS_TEMPLATE).nullable().optional(),
  template_id: z.string().uuid().nullable().optional(),
  status: z.enum(["rascunho", "enviada", "aprovada", "rejeitada"]).default("rascunho")
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await criarClienteSupabaseServidor();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    }

    const limite = request.nextUrl.searchParams.get("limite");

    let consulta = supabase
      .from("propostas")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (limite) {
      consulta = consulta.limit(Number(limite));
    }

    const { data, error } = await consulta;

    if (error) {
      console.error("Erro ao listar propostas:", error);
      return NextResponse.json({ erro: "Não foi possível carregar as propostas." }, { status: 500 });
    }

    return NextResponse.json({ propostas: (data ?? []) as Proposta[] });
  } catch (erro) {
    console.error("Erro inesperado em GET /api/propostas:", erro);
    return NextResponse.json(
      { erro: "Ocorreu um erro inesperado ao carregar as propostas. Tente novamente." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await criarClienteSupabaseServidor();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    }

    const corpo = await request.json();
    const resultado = esquemaCriarProposta.safeParse(corpo);

    if (!resultado.success) {
      return NextResponse.json(
        { erro: "Dados inválidos.", detalhes: resultado.error.flatten() },
        { status: 400 }
      );
    }

    const { blocos, ...resto } = resultado.data;

    const parcelasComValor = resto.condicoes_pagamento.map((parcela) => ({
      ...parcela,
      valor_calculado: Math.round(((resto.valor_estimado * parcela.percentual) / 100) * 100) / 100
    }));

    const { data, error } = await supabase
      .from("propostas")
      .insert({
        ...resto,
        cliente_email: resto.cliente_email || null,
        cliente_whatsapp: resto.cliente_whatsapp || null,
        cliente_endereco: resto.cliente_endereco || null,
        categoria_detectada: resto.categoria_detectada || null,
        template_id: resto.template_id || null,
        condicoes_pagamento: parcelasComValor,
        blocos,
        texto_gerado_ia: textoPlanoDosBlocos(blocos),
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao salvar proposta no Supabase:", error);
      return NextResponse.json(
        { erro: "Não foi possível salvar a proposta. Tente novamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({ proposta: data as Proposta }, { status: 201 });
  } catch (erro) {
    console.error("Erro inesperado em POST /api/propostas:", erro);
    return NextResponse.json(
      { erro: "Ocorreu um erro inesperado ao salvar a proposta. Tente novamente." },
      { status: 500 }
    );
  }
}
