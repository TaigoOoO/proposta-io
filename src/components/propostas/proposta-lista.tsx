"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { usePropostas } from "@/hooks/usePropostas";
import { PropostaCard } from "@/components/propostas/proposta-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface PropostaListaProps {
  limite?: number;
}

export function PropostaLista({ limite }: PropostaListaProps) {
  const options = limite !== undefined ? { limite } : {};
  const { propostas, carregando, excluindoId, excluirProposta, atualizarStatus } = usePropostas(options);

  if (carregando) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, indice) => (
          <Skeleton
            key={indice}
            className="h-[68px] w-full"
            style={{ animationDelay: `${indice * 100}ms` }}
          />
        ))}
      </div>
    );
  }

  if (propostas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 py-14 text-center animate-fade-in-up">
        <svg width={56} height={56} viewBox="0 0 56 56" fill="none" aria-hidden="true" className="animate-float">
          <rect
            x={12}
            y={6}
            width={32}
            height={44}
            rx={4}
            stroke="#a8a29e"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          <line x1={18} y1={20} x2={38} y2={20} stroke="#d6d3d1" strokeWidth={2} strokeLinecap="round" />
          <line x1={18} y1={28} x2={38} y2={28} stroke="#d6d3d1" strokeWidth={2} strokeLinecap="round" />
          <line x1={18} y1={36} x2={30} y2={36} stroke="#d6d3d1" strokeWidth={2} strokeLinecap="round" />
        </svg>
        <div>
          <p className="text-lg font-medium text-stone-900">Nenhuma proposta ainda</p>
          <p className="text-sm text-stone-500">Crie sua primeira proposta e feche seu próximo negócio.</p>
        </div>
        <Button asChild size="sm" className="mt-1 animate-pulse-soft hover:animate-none">
          <Link href="/propostas/nova">
            <Plus className="h-4 w-4" />
            Nova Proposta
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {propostas.map((proposta, indice) => (
        <div
          key={proposta.id}
          className="animate-fade-in-up opacity-0"
          style={{ animationDelay: `${indice * 50}ms` }}
        >
          <PropostaCard
            proposta={proposta}
            excluindo={excluindoId === proposta.id}
            onExcluir={excluirProposta}
            onAtualizarStatus={atualizarStatus}
          />
        </div>
      ))}
    </div>
  );
}
