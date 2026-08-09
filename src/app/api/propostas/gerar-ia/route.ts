import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { criarClienteSupabaseServidor } from "@/lib/supabase-server";
import { gerarBlocosProposta } from "@/lib/openai";
import { esquemaParcelas } from "@/lib/validacoes";
import { CATEGORIAS_TEMPLATE, TIPOS_BLOCO } from "@/types";
import type { TemplateProposta } from "@/types";

const esquemaGerarIa = z.object({
  cliente_nome: z.string().min(2),
  cliente_endereco: z.string(),
  titulo: z.string().min(3),
  descricao_servico: z.string().min(10),
  valor_estimado: z.number().nonnegative(),
  prazo_dias: z.number().int().positive(),
  condicoes_pagamento: esquemaParcelas,
  validade_dias: z.number().int().positive(),
  categoria: z.enum(CATEGORIAS_TEMPLATE)
});

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
    const resultado = esquemaGerarIa.safeParse(corpo);

    if (!resultado.success) {
      return NextResponse.json(
        { erro: "Dados inválidos.", detalhes: resultado.error.flatten() },
        { status: 400 }
      );
    }

    const [{ data: perfil }, { data: template }] = await Promise.all([
      supabase.from("perfis").select("nome_completo, nome_empresa").eq("id", user.id).single(),
      supabase
        .from("templates_proposta")
        .select("*")
        .eq("categoria", resultado.data.categoria)
        .eq("ativo", true)
        .single()
    ]);

    if (!template) {
      return NextResponse.json(
        { erro: "Nenhum template disponível para esta categoria de serviço." },
        { status: 500 }
      );
    }

    const templateTipado = template as TemplateProposta;
    const estruturaValidada = z.array(z.enum(TIPOS_BLOCO)).parse(templateTipado.estrutura);

    const blocos = await gerarBlocosProposta(
      {
        ...resultado.data,
        nome_prestador: perfil?.nome_completo || user.email || "Prestador de serviço",
        nome_empresa: perfil?.nome_empresa ?? null
      },
      templateTipado.prompt_sistema,
      estruturaValidada
    );

    return NextResponse.json({
      blocos,
      template_id: templateTipado.id,
      categoria: templateTipado.categoria
    });
  } catch (erro) {
    console.error("Erro ao gerar proposta com IA:", erro);
    return NextResponse.json(
      { erro: "Não foi possível gerar o texto com a IA. Tente novamente." },
      { status: 502 }
    );
  }
}
