import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { criarClienteSupabaseServidor } from "@/lib/supabase-server";
import { esquemaBloco, esquemaParcelas } from "@/lib/validacoes";
import { textoPlanoDosBlocos } from "@/lib/blocos";
import { CATEGORIAS_TEMPLATE } from "@/types";
import type { Proposta } from "@/types";

const esquemaAtualizarProposta = z
  .object({
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
    blocos: z.array(esquemaBloco).min(1),
    categoria_detectada: z.enum(CATEGORIAS_TEMPLATE).nullable(),
    template_id: z.string().uuid().nullable(),
    status: z.enum(["rascunho", "enviada", "aprovada", "rejeitada"])
  })
  .partial();

interface Parametros {
  params: { id: string };
}

export async function GET(_request: NextRequest, { params }: Parametros) {
  try {
    const supabase = await criarClienteSupabaseServidor();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("propostas")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ erro: "Proposta não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ proposta: data as Proposta });
  } catch (erro) {
    console.error("Erro inesperado em GET /api/propostas/[id]:", erro);
    return NextResponse.json(
      { erro: "Ocorreu um erro inesperado ao carregar a proposta. Tente novamente." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: Parametros) {
  try {
    const supabase = await criarClienteSupabaseServidor();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    }

    const corpo = await request.json();
    const resultado = esquemaAtualizarProposta.safeParse(corpo);

    if (!resultado.success) {
      return NextResponse.json(
        { erro: "Dados inválidos.", detalhes: resultado.error.flatten() },
        { status: 400 }
      );
    }

    const { blocos, cliente_email, cliente_whatsapp, cliente_endereco, ...resto } = resultado.data;

    const atualizacao: Record<string, unknown> = { ...resto };

    if (cliente_email !== undefined) atualizacao.cliente_email = cliente_email || null;
    if (cliente_whatsapp !== undefined) atualizacao.cliente_whatsapp = cliente_whatsapp || null;
    if (cliente_endereco !== undefined) atualizacao.cliente_endereco = cliente_endereco || null;

    if (blocos !== undefined) {
      atualizacao.blocos = blocos;
      atualizacao.texto_gerado_ia = textoPlanoDosBlocos(blocos);
    }

    const { data, error } = await supabase
      .from("propostas")
      .update(atualizacao)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error || !data) {
      console.error("Erro ao atualizar proposta no Supabase:", error);
      return NextResponse.json(
        { erro: "Não foi possível atualizar a proposta. Tente novamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({ proposta: data as Proposta });
  } catch (erro) {
    console.error("Erro inesperado em PATCH /api/propostas/[id]:", erro);
    return NextResponse.json(
      { erro: "Ocorreu um erro inesperado ao atualizar a proposta. Tente novamente." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: Parametros) {
  try {
    const supabase = await criarClienteSupabaseServidor();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    }

    const { error } = await supabase
      .from("propostas")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Erro ao excluir proposta no Supabase:", error);
      return NextResponse.json(
        { erro: "Não foi possível excluir a proposta. Tente novamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({ sucesso: true });
  } catch (erro) {
    console.error("Erro inesperado em DELETE /api/propostas/[id]:", erro);
    return NextResponse.json(
      { erro: "Ocorreu um erro inesperado ao excluir a proposta. Tente novamente." },
      { status: 500 }
    );
  }
}
