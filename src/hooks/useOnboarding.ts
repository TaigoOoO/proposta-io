"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { criarClienteSupabase } from "@/lib/supabase";
import type { OnboardingVisto } from "@/types";

interface UseOnboardingParams {
  perfilId: string;
  onboardingInicial: OnboardingVisto;
  perfilPreenchido: boolean;
  totalPropostas: number;
  compartilhouWhatsapp: boolean;
}

export type MarcoOnboarding =
  | "perfil_preenchido"
  | "primeira_proposta_criada"
  | "compartilhou_whatsapp"
  | "marco_tres_propostas";

interface EstadoOnboarding {
  passoAtivo: 1 | 2 | 3 | 4 | null;
  marcarVisto: (marco: MarcoOnboarding) => Promise<void>;
  pularTour: () => Promise<void>;
}

/**
 * Decide qual dica de onboarding contextual mostrar, com base no que o
 * usuário já fez (perfil preenchido, propostas criadas, WhatsApp
 * compartilhado). Cada dica só aparece uma vez — assim que vista ou pulada,
 * o marco correspondente é persistido em `perfis.onboarding_visto`.
 */
export function useOnboarding({
  perfilId,
  onboardingInicial,
  perfilPreenchido,
  totalPropostas,
  compartilhouWhatsapp
}: UseOnboardingParams): EstadoOnboarding {
  const router = useRouter();
  const [onboarding, setOnboarding] = useState<OnboardingVisto>(onboardingInicial);

  // `useState(onboardingInicial)` só usa esse valor na primeira renderização
  // deste componente. Se o usuário salva o perfil em /perfil e volta para o
  // /dashboard, o Server Component busca um `onboardingVisto` novo e o
  // repassa como prop — mas, sem este efeito, o estado interno do hook
  // continuaria com o valor antigo (React não remonta o Client Component
  // automaticamente só porque uma prop mudou). Sincronizamos aqui sempre que
  // a prop recebida do servidor mudar.
  useEffect(() => {
    setOnboarding(onboardingInicial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(onboardingInicial)]);

  const persistir = useCallback(
    async (patch: Partial<OnboardingVisto>) => {
      // Atualiza a partir do estado mais recente (functional update) em vez
      // de fechar sobre `onboarding`, evitando perder um patch anterior caso
      // duas chamadas aconteçam em sequência rápida.
      let atualizado: OnboardingVisto = { ...onboarding, ...patch };
      setOnboarding((atual) => {
        atualizado = { ...atual, ...patch };
        return atualizado;
      });

      if (!perfilId) {
        console.error("marcarOnboarding: perfilId ausente, gravação ignorada.");
        return;
      }

      const supabase = criarClienteSupabase();
      const { error } = await supabase
        .from("perfis")
        .update({ onboarding_visto: atualizado })
        .eq("id", perfilId);

      if (error) {
        console.error("Não foi possível salvar o progresso do onboarding:", error);
        toast.error("Não foi possível salvar sua preferência de tour. Tente novamente.");
        return;
      }

      // Invalida o cache de navegação do Next.js para que, ao visitar outra
      // rota (ex.: voltar para o /dashboard), os Server Components busquem
      // o `onboarding_visto` atualizado em vez de reaproveitar uma resposta
      // em cache com o estado antigo.
      router.refresh();
    },
    [onboarding, perfilId, router]
  );

  const marcarVisto = useCallback(
    async (marco: MarcoOnboarding) => {
      await persistir({ [marco]: true });
    },
    [persistir]
  );

  const pularTour = useCallback(async () => {
    await persistir({ tour_pulado: true });
  }, [persistir]);

  if (onboarding.tour_pulado) {
    return { passoAtivo: null, marcarVisto, pularTour };
  }

  let passoAtivo: 1 | 2 | 3 | 4 | null = null;

  if (!perfilPreenchido && !onboarding.perfil_preenchido) {
    passoAtivo = 1;
  } else if (totalPropostas === 0 && !onboarding.primeira_proposta_criada) {
    passoAtivo = 2;
  } else if (totalPropostas >= 1 && !compartilhouWhatsapp && !onboarding.compartilhou_whatsapp) {
    passoAtivo = 3;
  } else if (totalPropostas >= 3 && !onboarding.marco_tres_propostas) {
    passoAtivo = 4;
  }

  return { passoAtivo, marcarVisto, pularTour };
}
