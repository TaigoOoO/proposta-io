"use client";

import Link from "next/link";
import { FileStack, Send, TrendingUp, Wallet, Plus, UserCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InsightsPanel } from "@/components/dashboard/insights-panel";
import { OnboardingTooltip } from "@/components/onboarding/onboarding-tooltip";
import { useOnboarding } from "@/hooks/useOnboarding";
import { formatarMoeda, cn } from "@/lib/utils";
import type { EstatisticasDashboard, OnboardingVisto } from "@/types";

interface DashboardConteudoProps {
  estatisticas: EstatisticasDashboard;
  perfilId: string;
  perfilPreenchido: boolean;
  onboardingVisto: OnboardingVisto;
  totalPropostas: number;
}

export function DashboardConteudo({
  estatisticas,
  perfilId,
  perfilPreenchido,
  onboardingVisto,
  totalPropostas
}: DashboardConteudoProps) {
  const { passoAtivo, marcarVisto, pularTour } = useOnboarding({
    perfilId,
    onboardingInicial: onboardingVisto,
    perfilPreenchido,
    totalPropostas,
    compartilhouWhatsapp: Boolean(onboardingVisto.compartilhou_whatsapp)
  });

  const cartoes = [
    { titulo: "Total de Propostas", valor: estatisticas.totalPropostas.toString(), icone: FileStack },
    { titulo: "Enviadas este mês", valor: estatisticas.enviadasEsteMes.toString(), icone: Send },
    { titulo: "Taxa de Conversão", valor: `${estatisticas.taxaConversao.toFixed(0)}%`, icone: TrendingUp },
    { titulo: "Valor Total Estimado", valor: formatarMoeda(estatisticas.valorTotalEstimado), icone: Wallet }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {passoAtivo === 1 && (
        <OnboardingTooltip
          mostrar
          passo={1}
          totalPassos={4}
          titulo="Vamos criar seu perfil?"
          descricao="Preencha o nome da sua empresa para personalizar suas propostas e o PDF que você envia aos clientes."
          onFechar={() => marcarVisto("perfil_preenchido")}
          onPular={pularTour}
        >
          <Link
            href="/perfil"
            className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-medium text-primary transicao-premium hover:bg-primary/10"
          >
            <UserCircle className="h-4 w-4" />
            Complete seu perfil para começar
          </Link>
        </OnboardingTooltip>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Dashboard</h1>
          <p className="text-sm text-stone-500">Acompanhe suas propostas.</p>
        </div>
        <OnboardingTooltip
          mostrar={passoAtivo === 2}
          passo={2}
          totalPassos={4}
          titulo="Crie sua primeira proposta"
          descricao="Preencha os dados do cliente e do serviço — a IA cuida do texto profissional para você."
          onFechar={() => marcarVisto("primeira_proposta_criada")}
          onPular={pularTour}
          posicao="bottom-end"
        >
          <Button asChild size="lg" className="w-full shadow-premium sm:w-auto">
            <Link href="/propostas/nova">
              <Plus className="h-4 w-4" />
              Nova Proposta
            </Link>
          </Button>
        </OnboardingTooltip>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cartoes.map((cartao) => {
          const Icone = cartao.icone;
          const ehConversao = cartao.titulo === "Taxa de Conversão";
          const tamanhoFonteValor =
            cartao.valor.length > 14
              ? "text-lg"
              : cartao.valor.length > 11
                ? "text-xl"
                : cartao.valor.length > 8
                  ? "text-2xl"
                  : "text-3xl";
          return (
            <Card
              key={cartao.titulo}
              className="relative min-w-0 overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg hover:shadow-stone-200/50"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium uppercase tracking-wider text-stone-500">
                  {cartao.titulo}
                </CardTitle>
                <Icone className="absolute right-4 top-4 h-5 w-5 text-stone-300" />
              </CardHeader>
              <CardContent className="min-w-0">
                <p
                  className={cn(
                    "truncate font-semibold tracking-tight text-stone-900",
                    tamanhoFonteValor
                  )}
                  title={cartao.valor}
                >
                  {cartao.valor}
                </p>
                {ehConversao && (
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${Math.min(estatisticas.taxaConversao, 100)}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div>
        <OnboardingTooltip
          mostrar={passoAtivo === 4}
          passo={4}
          totalPassos={4}
          titulo="Você está indo bem!"
          descricao="Veja quais templates convertem mais e ajuste sua estratégia com base em dados reais."
          onFechar={() => marcarVisto("marco_tres_propostas")}
          onPular={pularTour}
        >
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-stone-900">Insights de Conversão</h2>
        </OnboardingTooltip>
        <InsightsPanel
          key={`${estatisticas.totalPropostas}-${estatisticas.enviadasEsteMes}-${estatisticas.taxaConversao}-${estatisticas.valorTotalEstimado}`}
        />
      </div>

      {/* FAB "Nova Proposta" — visível apenas em telas pequenas, acima da bottom nav */}
      <Button
        asChild
        size="icon"
        className="fixed bottom-20 right-4 z-30 h-14 w-14 rounded-full shadow-xl shadow-primary/30 lg:hidden"
      >
        <Link href="/propostas/nova" aria-label="Nova Proposta">
          <Plus className="h-6 w-6" />
        </Link>
      </Button>
    </div>
  );
}
