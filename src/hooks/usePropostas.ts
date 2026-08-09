"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LABEL_STATUS } from "@/lib/utils";
import type { Proposta, StatusProposta } from "@/types";

interface UsePropostasOpcoes {
  limite?: number;
}

interface EstadoPropostas {
  propostas: Proposta[];
  carregando: boolean;
  excluindoId: string | null;
  recarregar: () => Promise<void>;
  excluirProposta: (id: string) => Promise<void>;
  atualizarStatus: (id: string, status: StatusProposta) => Promise<void>;
}

interface RespostaListaPropostas {
  propostas?: Proposta[];
  erro?: string;
}

export function usePropostas(opcoes: UsePropostasOpcoes = {}): EstadoPropostas {
  const router = useRouter();
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [excluindoId, setExcluindoId] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    setCarregando(true);
    try {
      const query = opcoes.limite ? `?limite=${opcoes.limite}` : "";
      const resposta = await fetch(`/api/propostas${query}`, { cache: "no-store" });
      const dados = (await resposta.json().catch(() => null)) as RespostaListaPropostas | null;

      if (!resposta.ok) {
        throw new Error(dados?.erro || "Falha ao carregar propostas");
      }

      // Uma resposta 200 com lista vazia é um resultado válido (usuário sem
      // propostas ainda) e nunca deve disparar o toast de erro.
      setPropostas(Array.isArray(dados?.propostas) ? dados.propostas : []);
    } catch (erro) {
      console.error("Erro ao carregar propostas:", erro);
      toast.error("Não foi possível carregar suas propostas.");
    } finally {
      setCarregando(false);
    }
  }, [opcoes.limite]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  const excluirProposta = useCallback(async (id: string) => {
    setExcluindoId(id);
    try {
      const resposta = await fetch(`/api/propostas/${id}`, { method: "DELETE" });
      if (!resposta.ok) {
        throw new Error("Falha ao excluir proposta");
      }
      setPropostas((atual) => atual.filter((proposta) => proposta.id !== id));
      toast.success("Proposta excluída.");
    } catch {
      toast.error("Não foi possível excluir a proposta.");
    } finally {
      setExcluindoId(null);
    }
  }, []);

  const atualizarStatus = useCallback(async (id: string, status: StatusProposta) => {
    let statusAnterior: StatusProposta | null = null;

    // Atualização otimista: muda a UI imediatamente, antes da resposta do servidor.
    setPropostas((atual) =>
      atual.map((proposta) => {
        if (proposta.id !== id) return proposta;
        statusAnterior = proposta.status;
        return { ...proposta, status };
      })
    );

    try {
      const resposta = await fetch(`/api/propostas/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      if (!resposta.ok) {
        throw new Error("Falha ao atualizar status");
      }

      toast.success(`Status atualizado para ${LABEL_STATUS[status]}.`);

      // Força o Server Component do dashboard a recalcular os cards de
      // estatísticas (Valor Total Estimado, Taxa de Conversão etc.) com o
      // novo status — sem isso eles ficavam presos no valor de quando a
      // página carregou.
      router.refresh();
    } catch {
      // Reverte para o status anterior em caso de erro.
      if (statusAnterior) {
        const statusParaRestaurar = statusAnterior;
        setPropostas((atual) =>
          atual.map((proposta) => (proposta.id === id ? { ...proposta, status: statusParaRestaurar } : proposta))
        );
      }
      toast.error("Não foi possível atualizar o status. Tente novamente.");
    }
  }, [router]);

  return { propostas, carregando, excluindoId, recarregar, excluirProposta, atualizarStatus };
}
