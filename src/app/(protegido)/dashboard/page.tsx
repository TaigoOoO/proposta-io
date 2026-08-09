import { PropostaLista } from "@/components/propostas/proposta-lista";
import { DashboardConteudo } from "@/components/dashboard/dashboard-conteudo";
import { criarClienteSupabaseServidor } from "@/lib/supabase-server";
import type { Proposta, EstatisticasDashboard, OnboardingVisto } from "@/types";

// Esta página depende de `onboarding_visto` e `nome_empresa` estarem sempre
// atualizados (para decidir qual dica de onboarding mostrar). Forçamos
// renderização dinâmica para evitar que uma resposta em cache mostre um
// estado de onboarding desatualizado após o usuário completar uma etapa.
export const dynamic = "force-dynamic";

async function buscarEstatisticas(): Promise<EstatisticasDashboard> {
  const supabase = await criarClienteSupabaseServidor();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { totalPropostas: 0, enviadasEsteMes: 0, taxaConversao: 0, valorTotalEstimado: 0 };
  }

  const { data } = await supabase
    .from("propostas")
    .select("status, valor_estimado, created_at")
    .eq("user_id", user.id);

  const propostas = (data || []) as Pick<Proposta, "status" | "valor_estimado" | "created_at">[];

  const inicioDoMes = new Date();
  inicioDoMes.setDate(1);
  inicioDoMes.setHours(0, 0, 0, 0);

  const totalPropostas = propostas.length;

  const enviadasEsteMes = propostas.filter(
    (p) => p.status !== "rascunho" && new Date(p.created_at) >= inicioDoMes
  ).length;

  const finalizadas = propostas.filter((p) => p.status === "aprovada" || p.status === "rejeitada");
  const aprovadas = propostas.filter((p) => p.status === "aprovada").length;
  const taxaConversao = finalizadas.length > 0 ? (aprovadas / finalizadas.length) * 100 : 0;

  // "Valor Total Estimado" não deve contar negócios que o cliente recusou —
  // só rascunho, enviada e aprovada representam valor real ou em aberto.
  const valorTotalEstimado = propostas
    .filter((p) => p.status !== "rejeitada")
    .reduce((soma, p) => soma + (p.valor_estimado || 0), 0);

  return { totalPropostas, enviadasEsteMes, taxaConversao, valorTotalEstimado };
}

export default async function PaginaDashboard() {
  const supabase = await criarClienteSupabaseServidor();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const [estatisticas, perfilResultado] = await Promise.all([
    buscarEstatisticas(),
    user
      ? supabase.from("perfis").select("nome_empresa, onboarding_visto").eq("id", user.id).single()
      : Promise.resolve({ data: null })
  ]);

  const perfil = perfilResultado.data;
  const perfilPreenchido = Boolean(perfil?.nome_empresa);
  const onboardingVisto = (perfil?.onboarding_visto || {}) as OnboardingVisto;

  return (
    <div className="space-y-8">
      <DashboardConteudo
        estatisticas={estatisticas}
        perfilId={user?.id || ""}
        perfilPreenchido={perfilPreenchido}
        onboardingVisto={onboardingVisto}
        totalPropostas={estatisticas.totalPropostas}
      />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-stone-900">Últimas Propostas</h2>
        </div>
        <PropostaLista limite={5} />
      </div>
    </div>
  );
}
