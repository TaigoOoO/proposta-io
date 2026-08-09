import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { criarClienteSupabaseServidor } from "@/lib/supabase-server";
import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Cabecalho } from "@/components/layout/cabecalho";

// Todas as páginas protegidas dependem de dados de sessão/perfil sempre
// atualizados (nome exibido no cabeçalho, estado de onboarding). Forçamos
// renderização dinâmica para evitar respostas em cache desatualizadas.
export const dynamic = "force-dynamic";

export default async function LayoutProtegido({ children }: { children: ReactNode }) {
  const supabase = await criarClienteSupabaseServidor();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("nome_completo")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen bg-stone-50/60">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Cabecalho nomeCompleto={perfil?.nome_completo || user.email || "Usuário"} email={user.email || ""} />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-8">{children}</div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
