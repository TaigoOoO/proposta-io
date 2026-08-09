"use client";

import Link from "next/link";
import { MoreVertical, Trash2, Eye, Loader2, Check } from "lucide-react";
import { StatusBadge, CORES_PONTO } from "@/components/propostas/status-badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatarMoeda, formatarData, LABEL_STATUS, cn } from "@/lib/utils";
import type { Proposta, StatusProposta } from "@/types";

interface PropostaCardProps {
  proposta: Proposta;
  excluindo: boolean;
  onExcluir: (id: string) => void;
  onAtualizarStatus: (id: string, status: StatusProposta) => void;
}

const OPCOES_STATUS: StatusProposta[] = ["rascunho", "enviada", "aprovada", "rejeitada"];

export function PropostaCard({ proposta, excluindo, onExcluir, onAtualizarStatus }: PropostaCardProps) {
  return (
    <div className="group flex items-center justify-between gap-4 rounded-xl border border-stone-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg hover:shadow-stone-200/50">
      <Link href={`/propostas/${proposta.id}`} className="flex min-w-0 flex-1 items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-stone-900 transition-colors group-hover:text-primary">
            {proposta.titulo}
          </p>
          <p className="truncate text-xs text-stone-500">
            {proposta.cliente_nome} · {formatarData(proposta.created_at)}
          </p>
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-stone-900">{formatarMoeda(proposta.valor_estimado)}</p>
        </div>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={excluindo}
            className="shrink-0 cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Alterar status da proposta"
          >
            <StatusBadge key={proposta.status} status={proposta.status} className="animate-status-pulse" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 p-1.5">
          {OPCOES_STATUS.map((opcao) => {
            const ativo = proposta.status === opcao;
            return (
              <DropdownMenuItem
                key={opcao}
                disabled={ativo}
                onSelect={() => onAtualizarStatus(proposta.id, opcao)}
                className={cn(
                  "gap-2 rounded-md px-2.5 py-2",
                  ativo ? "bg-stone-100 font-medium text-stone-900" : "text-stone-700"
                )}
              >
                <span className={cn("h-2 w-2 shrink-0 rounded-full", CORES_PONTO[opcao])} />
                {LABEL_STATUS[opcao]}
                {ativo && <Check className="ml-auto h-3.5 w-3.5 shrink-0 text-stone-500" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0" disabled={excluindo}>
            {excluindo ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/propostas/${proposta.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Visualizar
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => onExcluir(proposta.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
