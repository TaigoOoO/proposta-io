import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { criarClienteSupabaseServidor } from "@/lib/supabase-server";
import { classificarDescricaoServico } from "@/lib/openai";
import type { ClassificarServicoResponse, TemplateProposta } from "@/types";

const esquemaClassificar = z.object({
  descricao: z.string().min(10, "Descreva o serviço com mais detalhes.")
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
    const resultado = esquemaClassificar.safeParse(corpo);

    if (!resultado.success) {
      return NextResponse.json(
        { erro: "Dados inválidos.", detalhes: resultado.error.flatten() },
        { status: 400 }
      );
    }

    const { categoria, confianca } = await classificarDescricaoServico(resultado.data.descricao);

    const { data: template } = await supabase
      .from("templates_proposta")
      .select("id, nome")
      .eq("categoria", categoria)
      .eq("ativo", true)
      .single();

    const templateTipado = template as Pick<TemplateProposta, "id" | "nome"> | null;

    const resposta: ClassificarServicoResponse = {
      categoria,
      confianca,
      template_id: templateTipado?.id ?? null,
      template_nome: templateTipado?.nome ?? null
    };

    return NextResponse.json(resposta);
  } catch (erro) {
    console.error("Erro ao classificar descrição de serviço:", erro);
    return NextResponse.json(
      { erro: "Não foi possível classificar o serviço. Tente novamente." },
      { status: 502 }
    );
  }
}
