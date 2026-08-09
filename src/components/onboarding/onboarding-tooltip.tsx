"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingTooltipProps {
  mostrar: boolean;
  passo: number;
  totalPassos: number;
  titulo: string;
  descricao: string;
  onFechar: () => void;
  onPular: () => void;
  posicao?: "bottom-start" | "bottom-end" | "top-start";
  children: ReactNode;
}

export function OnboardingTooltip({
  mostrar,
  passo,
  totalPassos,
  titulo,
  descricao,
  onFechar,
  onPular,
  posicao = "bottom-start",
  children
}: OnboardingTooltipProps) {
  return (
    <div className="relative inline-flex">
      {children}
      {mostrar && (
        <div
          role="status"
          className={cn(
            "absolute z-30 w-64 animate-fade-in-up rounded-xl border border-primary/20 bg-white p-4 shadow-lg",
            posicao === "bottom-start" && "left-0 top-[calc(100%+10px)]",
            posicao === "bottom-end" && "right-0 top-[calc(100%+10px)]",
            posicao === "top-start" && "bottom-[calc(100%+10px)] left-0"
          )}
        >
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar dica"
            className="absolute right-2.5 top-2.5 rounded-md p-0.5 text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <p className="pr-4 text-sm font-semibold text-stone-900">{titulo}</p>
          <p className="mt-1 text-xs leading-relaxed text-stone-500">{descricao}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] font-medium text-stone-400">
              Passo {passo} de {totalPassos}
            </span>
            <button
              type="button"
              onClick={onPular}
              className="text-[11px] font-medium text-stone-500 underline-offset-2 hover:text-primary hover:underline"
            >
              Pular tour
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
