import type { SupabaseClient } from "@supabase/supabase-js";
import type { OnboardingVisto } from "@/types";

/**
 * Lê o `onboarding_visto` atual do perfil e grava a versão mesclada com o
 * patch informado, sem apagar marcos já registrados. Usado em pontos do app
 * que não têm o estado completo do perfil em mãos (ex.: após criar a
 * primeira proposta, após compartilhar por WhatsApp).
 */
export async function marcarOnboardingVisto(
  supabase: SupabaseClient,
  perfilId: string,
  patch: Partial<OnboardingVisto>
): Promise<void> {
  const { data } = await supabase.from("perfis").select("onboarding_visto").eq("id", perfilId).single();
  const atual = (data?.onboarding_visto || {}) as OnboardingVisto;
  await supabase
    .from("perfis")
    .update({ onboarding_visto: { ...atual, ...patch } })
    .eq("id", perfilId);
}
