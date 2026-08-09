"use client";

import { useState, type DragEvent } from "react";
import { ArrowLeft, Loader2, RefreshCcw, Sparkles, Plus, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BlocoEditorCard } from "@/components/propostas/bloco-editor-card";
import { reindexarBlocos, gerarIdBloco } from "@/lib/blocos";
import type { BlocoProposta, GerarPropostaIaRequest, GerarPropostaIaResponse } from "@/types";

interface FormularioIaProps {
  dadosGeracao: Omit<GerarPropostaIaRequest, "nome_prestador" | "nome_empresa">;
  onVoltar: () => void;
  onSalvar: (blocos: BlocoProposta[], templateId: string) => Promise<void>;
}

export function FormularioIa({ dadosGeracao, onVoltar, onSalvar }: FormularioIaProps) {
  const [blocos, setBlocos] = useState<BlocoProposta[]>([]);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [gerando, setGerando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [arrastandoId, setArrastandoId] = useState<string | null>(null);

  async function gerarBlocos() {
    setGerando(true);
    try {
      const resposta = await fetch("/api/propostas/gerar-ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosGeracao)
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Falha ao gerar proposta");
      }

      const resultado = dados as GerarPropostaIaResponse;
      setBlocos(resultado.blocos);
      setTemplateId(resultado.template_id);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível gerar o texto.");
    } finally {
      setGerando(false);
    }
  }

  function atualizarBloco(id: string, patch: Partial<BlocoProposta>) {
    setBlocos((atual) => atual.map((bloco) => (bloco.id === id ? { ...bloco, ...patch } : bloco)));
  }

  function removerBloco(id: string) {
    setBlocos((atual) => reindexarBlocos(atual.filter((bloco) => bloco.id !== id)));
  }

  function adicionarBloco() {
    const novo: BlocoProposta = {
      id: gerarIdBloco(),
      tipo: "custom",
      titulo: "Nova Seção",
      conteudo: "",
      obrigatorio: false,
      editavel: true,
      visivel: true,
      ordem: blocos.length
    };
    setBlocos((atual) => [...atual, novo]);
  }

  function aoIniciarArrasto(evento: DragEvent<HTMLDivElement>, id: string) {
    setArrastandoId(id);
    evento.dataTransfer.effectAllowed = "move";
  }

  function aoPassarPorCima(evento: DragEvent<HTMLDivElement>) {
    evento.preventDefault();
  }

  function aoSoltar(evento: DragEvent<HTMLDivElement>, idAlvo: string) {
    evento.preventDefault();
    if (!arrastandoId || arrastandoId === idAlvo) return;

    setBlocos((atual) => {
      const indiceOrigem = atual.findIndex((bloco) => bloco.id === arrastandoId);
      const indiceDestino = atual.findIndex((bloco) => bloco.id === idAlvo);
      if (indiceOrigem === -1 || indiceDestino === -1) return atual;

      const copia = [...atual];
      const [removido] = copia.splice(indiceOrigem, 1);
      if (!removido) return atual;
      copia.splice(indiceDestino, 0, removido);
      return reindexarBlocos(copia);
    });
    setArrastandoId(null);
  }

  async function salvar() {
    if (blocos.length === 0) {
      toast.error("Gere a proposta com IA antes de salvar.");
      return;
    }
    if (!templateId) {
      toast.error("Não foi possível identificar o template usado. Gere a proposta novamente.");
      return;
    }
    setSalvando(true);
    try {
      await onSalvar(blocos, templateId);
    } finally {
      setSalvando(false);
    }
  }

  if (blocos.length === 0 && !gerando) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div className="max-w-sm">
          <p className="text-base font-semibold text-stone-900">Pronto para gerar sua proposta</p>
          <p className="mt-1 text-sm text-stone-500">
            A IA vai transformar os dados que você preencheu em uma proposta organizada em blocos, pronta para
            editar e enviar.
          </p>
        </div>
        <Button size="lg" onClick={gerarBlocos}>
          <Sparkles className="h-4 w-4" />
          Gerar Proposta Profissional com IA
        </Button>
        <Button type="button" variant="ghost" onClick={onVoltar}>
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>
    );
  }

  if (gerando) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2 py-2 text-center">
          <Sparkles className="h-4 w-4 animate-pulse-soft text-primary" />
          <p className="text-sm text-stone-500">Gerando o texto da sua proposta com IA...</p>
        </div>
        {Array.from({ length: 4 }).map((_, indice) => (
          <div
            key={indice}
            className="space-y-3 rounded-xl border border-stone-200 bg-white p-5"
            style={{ animationDelay: `${indice * 100}ms` }}
          >
            <Skeleton className="h-3 w-1/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {blocos.map((bloco) => (
          <BlocoEditorCard
            key={bloco.id}
            bloco={bloco}
            onAtualizar={(patch) => atualizarBloco(bloco.id, patch)}
            onRemover={() => removerBloco(bloco.id)}
            onDragStart={(evento) => aoIniciarArrasto(evento, bloco.id)}
            onDragOver={aoPassarPorCima}
            onDrop={(evento) => aoSoltar(evento, bloco.id)}
            arrastando={arrastandoId === bloco.id}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={adicionarBloco}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 text-sm font-medium text-stone-500 transicao-premium hover:border-primary hover:text-primary"
      >
        <Plus className="h-4 w-4" />
        Adicionar bloco
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <Button type="button" variant="outline" onClick={gerarBlocos} disabled={salvando}>
          <RefreshCcw className="h-4 w-4" />
          Regenerar
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onVoltar} disabled={salvando}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button type="button" onClick={salvar} disabled={salvando}>
            {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Salvar e Gerar PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
