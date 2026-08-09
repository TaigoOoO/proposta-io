import { NextResponse, type NextRequest } from "next/server";
import { criarClienteSupabaseServidor } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const codigo = searchParams.get("code");

  try {
    if (codigo) {
      const supabase = await criarClienteSupabaseServidor();
      await supabase.auth.exchangeCodeForSession(codigo);
    }
  } catch (erro) {
    console.error("Erro ao trocar código de confirmação por sessão:", erro);
    return NextResponse.redirect(`${origin}/login`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
