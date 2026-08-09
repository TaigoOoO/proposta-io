import { NextResponse, type NextRequest } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { criarClienteSupabaseServidor } from "@/lib/supabase-server";
import { PropostaPdfDocument } from "@/components/pdf/proposta-pdf-document";
import type { Proposta } from "@/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const supabase = await criarClienteSupabaseServidor();
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ erro: "Não autenticado." }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ erro: "Informe o id da proposta." }, { status: 400 });
    }

    const { data: proposta, error } = await supabase
      .from("propostas")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error || !proposta) {
      return NextResponse.json({ erro: "Proposta não encontrada." }, { status: 404 });
    }

    const { data: perfil } = await supabase
      .from("perfis")
      .select("nome_completo, nome_empresa")
      .eq("id", user.id)
      .single();

    const propostaTipada = proposta as Proposta;

    const buffer = await renderToBuffer(
      <PropostaPdfDocument
        proposta={propostaTipada}
        nomeCompleto={perfil?.nome_completo || user.email || "Prestador de serviço"}
        nomeEmpresa={perfil?.nome_empresa ?? null}
      />
    );

    const nomeArquivo = `proposta-${propostaTipada.titulo
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")}.pdf`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${nomeArquivo}"`
      }
    });
  } catch (erro) {
    console.error("Erro inesperado em GET /api/gerar-pdf:", erro);
    return NextResponse.json(
      { erro: "Não foi possível gerar o PDF. Tente novamente." },
      { status: 500 }
    );
  }
}
