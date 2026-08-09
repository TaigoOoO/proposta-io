import { NextResponse } from "next/server";
import { criarClienteSupabaseServidor } from "@/lib/supabase-server";

export async function POST() {
  try {
    const supabase = await criarClienteSupabaseServidor();
    await supabase.auth.signOut();
    return NextResponse.json({ sucesso: true });
  } catch (erro) {
    console.error("Erro inesperado em POST /api/auth/logout:", erro);
    return NextResponse.json({ erro: "Não foi possível encerrar a sessão." }, { status: 500 });
  }
}
