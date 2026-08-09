"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditorParcelas } from "@/components/forms/editor-parcelas";
import { esquemaPasso2Servico, type Passo2ServicoInput } from "@/lib/validacoes";
import { mascararMoedaInput, moedaParaNumero, cn } from "@/lib/utils";
import { ROTULO_CATEGORIA } from "@/lib/categorias";
import { ICONE_CATEGORIA } from "@/components/propostas/icone-categoria";
import { CATEGORIAS_TEMPLATE, type CategoriaTemplate } from "@/types";
import type { NovaPropostaServicoInput } from "@/types";

interface FormularioServicoProps {
  valoresIniciais: NovaPropostaServicoInput;
  categoriaInicial: CategoriaTemplate | "";
  onAvancar: (dados: NovaPropostaServicoInput, categoria: CategoriaTemplate) => void;
  onVoltar: () => void;
}

function campoClasse(comErro: boolean, extra = ""): string {
  return cn(
    "h-12 rounded-xl",
    extra,
    comErro && "animate-shake border-destructive focus-visible:ring-destructive/20"
  );
}

export function FormularioServico({
  valoresIniciais,
  categoriaInicial,
  onAvancar,
  onVoltar
}: FormularioServicoProps) {
  const [categoria, setCategoria] = useState<CategoriaTemplate | "">(categoriaInicial);
  const [confianca, setConfianca] = useState<number | null>(null);
  const [classificando, setClassificando] = useState(false);
  const [escolhaManual, setEscolhaManual] = useState(false);
  const [ultimaDescricaoClassificada, setUltimaDescricaoClassificada] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<Passo2ServicoInput>({
    resolver: zodResolver(esquemaPasso2Servico),
    defaultValues: {
      titulo: valoresIniciais.titulo,
      descricao_servico: valoresIniciais.descricao_servico,
      valor_estimado: valoresIniciais.valor_estimado,
      prazo_dias: valoresIniciais.prazo_dias,
      condicoes_pagamento: valoresIniciais.condicoes_pagamento,
      validade_dias: valoresIniciais.validade_dias || "7"
    }
  });

  const valorEstimado = watch("valor_estimado");
  const parcelas = watch("condicoes_pagamento");
  const { onBlur: onBlurRegistrado, ...registroDescricao } = register("descricao_servico");

  async function classificarDescricao(descricao: string) {
    if (descricao.trim().length < 10 || descricao === ultimaDescricaoClassificada) return;

    setUltimaDescricaoClassificada(descricao);
    setClassificando(true);
    try {
      const resposta = await fetch("/api/classificar-servico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao })
      });

      if (!resposta.ok) return;

      const dados = (await resposta.json()) as { categoria: CategoriaTemplate; confianca: number };
      setConfianca(dados.confianca);

      if (dados.confianca > 0.7) {
        setCategoria(dados.categoria);
        setEscolhaManual(false);
      } else {
        setCategoria((atual) => atual || dados.categoria);
        setEscolhaManual(true);
      }
    } catch {
      // Classificação é apenas um auxílio — falhas silenciosas não bloqueiam o fluxo.
    } finally {
      setClassificando(false);
    }
  }

  function aoSubmeter(dados: Passo2ServicoInput) {
    onAvancar(dados, (categoria || "outros") as CategoriaTemplate);
  }

  const IconeDetectado = categoria ? ICONE_CATEGORIA[categoria] : null;
  const mensagemErroParcelas = errors.condicoes_pagamento?.message as string | undefined;

  return (
    <form onSubmit={handleSubmit(aoSubmeter)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="titulo">Título da proposta *</Label>
        <Input
          id="titulo"
          className={campoClasse(Boolean(errors.titulo))}
          placeholder="Ex: Orçamento para Festa de Aniversário"
          {...register("titulo")}
        />
        {errors.titulo && <p className="text-xs text-destructive">{errors.titulo.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="descricao_servico">Descrição do serviço *</Label>
        <Textarea
          id="descricao_servico"
          className={cn(
            "min-h-[140px] rounded-xl",
            errors.descricao_servico && "animate-shake border-destructive focus-visible:ring-destructive/20"
          )}
          placeholder="Descreva livremente o que será feito, materiais, escopo, etc."
          rows={5}
          onBlur={(evento) => {
            onBlurRegistrado(evento);
            classificarDescricao(evento.target.value);
          }}
          {...registroDescricao}
        />
        {errors.descricao_servico && (
          <p className="text-xs text-destructive">{errors.descricao_servico.message}</p>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {classificando && (
            <span className="flex items-center gap-1.5 text-xs text-stone-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Detectando tipo de serviço...
            </span>
          )}

          {!classificando && categoria && !escolhaManual && (
            <Badge variant="outline" className="gap-1.5 border-primary/20 bg-primary/10 py-1 text-primary">
              {IconeDetectado && <IconeDetectado className="h-3.5 w-3.5" />}
              Detectamos: {ROTULO_CATEGORIA[categoria]}
            </Badge>
          )}

          {!classificando && categoria && !escolhaManual && (
            <button
              type="button"
              onClick={() => setEscolhaManual(true)}
              className="text-xs text-stone-400 underline-offset-2 hover:text-primary hover:underline"
            >
              Não é isso?
            </button>
          )}

          {!classificando && (escolhaManual || (!categoria && confianca !== null)) && (
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-stone-400" />
              <Select value={categoria || undefined} onValueChange={(valor) => setCategoria(valor as CategoriaTemplate)}>
                <SelectTrigger className="h-9 w-56 rounded-lg text-xs">
                  <SelectValue placeholder="Tipo de serviço" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIAS_TEMPLATE.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {ROTULO_CATEGORIA[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="valor_estimado">Valor estimado (R$) *</Label>
          <Input
            id="valor_estimado"
            className={campoClasse(Boolean(errors.valor_estimado))}
            inputMode="numeric"
            placeholder="0,00"
            value={valorEstimado}
            onChange={(evento) => setValue("valor_estimado", mascararMoedaInput(evento.target.value))}
          />
          {errors.valor_estimado && <p className="text-xs text-destructive">{errors.valor_estimado.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="prazo_dias">Prazo de execução (dias) *</Label>
          <Input
            id="prazo_dias"
            className={campoClasse(Boolean(errors.prazo_dias))}
            type="number"
            min={1}
            placeholder="Ex: 15"
            {...register("prazo_dias")}
          />
          {errors.prazo_dias && <p className="text-xs text-destructive">{errors.prazo_dias.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="validade_dias">Validade da proposta (dias)</Label>
        <Input
          id="validade_dias"
          className={campoClasse(Boolean(errors.validade_dias), "max-w-[200px]")}
          type="number"
          min={1}
          placeholder="7"
          {...register("validade_dias")}
        />
        {errors.validade_dias && <p className="text-xs text-destructive">{errors.validade_dias.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>Condições de pagamento *</Label>
        <EditorParcelas
          valorTotal={moedaParaNumero(valorEstimado)}
          parcelas={parcelas}
          onChange={(novasParcelas) => setValue("condicoes_pagamento", novasParcelas, { shouldValidate: true })}
          categoriaSugerida={categoria}
        />
        {mensagemErroParcelas && <p className="text-xs text-destructive">{mensagemErroParcelas}</p>}
      </div>

      <div className="flex justify-between pt-2">
        <Button type="button" variant="outline" size="lg" onClick={onVoltar}>
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <Button type="submit" size="lg">
          Continuar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
