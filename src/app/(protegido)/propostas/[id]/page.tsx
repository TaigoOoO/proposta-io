import { notFound } from "next/navigation";
import { criarClienteSupabaseServidor } from "@/lib/supabase-server";
import { PropostaPreview } from "@/components/propostas/proposta-preview";
import type { OnboardingVisto, Proposta } from "@/types";

// Evita que o estado de onboarding_visto (usado na dica do WhatsApp) fique
// preso em uma resposta em cache.
export const dynamic = "force-dynamic";

interface PaginaPropostaProps {
  params: { id: string };
}

export default async function PaginaProposta({ params }: PaginaPropostaProps) {
  const supabase = await criarClienteSupabaseServidor();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    notFound();
  }

  const { data: proposta, error } = await supabase
    .from("propostas")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (error || !proposta) {
    notFound();
  }

  const { data: perfil } = await supabase
    .from("perfis")
    .select("onboarding_visto")
    .eq("id", user.id)
    .single();

  return (
    <PropostaPreview
      proposta={proposta as Proposta}
      perfilId={user.id}
      onboardingVisto={(perfil?.onboarding_visto || {}) as OnboardingVisto}
    />
  );
}
