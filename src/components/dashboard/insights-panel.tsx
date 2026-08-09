"use client";

import { useEffect, useState } from "react";
import { Clock3, Trophy, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { EstatisticasInsights } from "@/types";

const HOVER_CARD =
  "transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg hover:shadow-stone-200/50";

export function InsightsPanel() {
  const [insights, setInsights] = useState<EstatisticasInsights | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetch("/api/insights", { cache: "no-store" })
      .then(async (resposta) => {
        if (!resposta.ok) throw new Error("Falha ao carregar insights");
        const dados = (await resposta.json()) as EstatisticasInsights;
        setInsights(dados);
      })
      .catch(() => setInsights(null))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, indice) => (
          <div
            key={indice}
            className="space-y-3 rounded-2xl border border-stone-200 bg-white p-6"
            style={{ animationDelay: `${indice * 100}ms` }}
          >
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-7 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!insights || insights.totalEnviadas === 0) {
    return (
      <div className="animate-fade-in-up rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 p-6 text-sm text-stone-500">
        Envie propostas para começar a ver insights de conversão aqui.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className={`animate-fade-in-up opacity-0 ${HOVER_CARD}`}>
        <CardContent className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Tempo Médio de Resposta</p>
            <Clock3 className="h-5 w-5 text-stone-300" />
          </div>
          <p className="text-3xl font-semibold tracking-tight text-stone-900">
            {insights.tempoMedioRespostaDias !== null ? insights.tempoMedioRespostaDias.toFixed(1) : "—"}
            <span className="ml-1 text-base font-medium text-stone-400">dias</span>
          </p>
        </CardContent>
      </Card>

      <Card
        className={`animate-fade-in-up opacity-0 ${HOVER_CARD}`}
        style={{ animationDelay: "50ms" }}
      >
        <CardContent className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-500">Template Mais Efetivo</p>
            <Trophy className="h-5 w-5 text-stone-300" />
          </div>
          {insights.templateMaisEfetivo ? (
            <>
              <p className="text-lg font-semibold tracking-tight text-stone-900">
                {insights.templateMaisEfetivo.nome}
              </p>
              <p className="text-sm text-stone-500">
                {insights.templateMaisEfetivo.taxaConversao.toFixed(0)}% de conversão
              </p>
            </>
          ) : (
            <p className="text-sm text-stone-500">Ainda sem dados suficientes.</p>
          )}
        </CardContent>
      </Card>

      <Card
        className={`animate-fade-in-up opacity-0 border-primary/20 bg-primary/5 ${HOVER_CARD}`}
        style={{ animationDelay: "100ms" }}
      >
        <CardContent className="p-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-medium uppercase tracking-wider text-primary">Sugestão da IA</p>
            <Sparkles className="h-5 w-5 text-primary/50" />
          </div>
          <p className="text-sm leading-relaxed text-stone-700">{insights.sugestaoIA}</p>
        </CardContent>
      </Card>
    </div>
  );
}
