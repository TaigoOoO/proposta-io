import { NextResponse, type NextRequest } from "next/server";
import { criarClienteSupabaseServidor } from "@/lib/supabase-server";
import { gerarMensagensWhatsapp } from "@/lib/openai";
import type { Proposta } from "@/types";

interface Parametros {
  params: { id: string };
}

export async function POST(_request: NextRequest, { params }: Parametros) {
  try {
    const supabase = await criarClienteSupabaseServidor();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    }

    const { data: proposta, error } = await supabase
      .from("propostas")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error || !proposta) {
      return NextResponse.json({ erro: "Proposta não encontrada." }, { status: 404 });
    }

    const propostaTipada = proposta as Proposta;

    const mensagens = await gerarMensagensWhatsapp({
      clienteNome: propostaTipada.cliente_nome,
      tituloProposta: propostaTipada.titulo,
      valorEstimado: propostaTipada.valor_estimado || 0
    });

    return NextResponse.json({ mensagens });
  } catch (erro) {
    console.error("Erro ao gerar mensagens de WhatsApp:", erro);
    return NextResponse.json(
      { erro: "Não foi possível gerar as mensagens. Tente novamente." },
      { status: 502 }
    );
  }
}
