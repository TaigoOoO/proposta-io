"use client";

import { Plus, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatarMoeda } from "@/lib/formatters";
import type { CategoriaTemplate, ParcelaPagamento } from "@/types";

interface EditorParcelasProps {
  valorTotal: number;
  parcelas: ParcelaPagamento[];
  onChange: (parcelas: ParcelaPagamento[]) => void;
  /** Categoria já detectada/selecionada no Passo 2 — usada só para destacar a sugestão correspondente. */
  categoriaSugerida?: CategoriaTemplate | "";
}

interface TemplateParcelas {
  rotulo: string;
  parcelas: Omit<ParcelaPagamento, "id">[];
}

const TEMPLATES_PARCELAS: Record<string, TemplateParcelas> = {
  eventos: {
    rotulo: "Eventos",
    parcelas: [
      { percentual: 30, descricao: "Na assinatura do contrato", prazo_dias: 0, ordem: 0 },
      { percentual: 40, descricao: "15 dias antes do evento", prazo_dias: -15, ordem: 1 },
      { percentual: 30, descricao: "Após a realização do evento", prazo_dias: null, ordem: 2 }
    ]
  },
  construcao: {
    rotulo: "Construção",
    parcelas: [
      { percentual: 40, descricao: "Na assinatura do contrato (material)", prazo_dias: 0, ordem: 0 },
      { percentual: 40, descricao: "Durante a execução da obra", prazo_dias: null, ordem: 1 },
      { percentual: 20, descricao: "30 dias após a entrega (retentiva)", prazo_dias: 30, ordem: 2 }
    ]
  },
  design: {
    rotulo: "Design",
    parcelas: [
      { percentual: 50, descricao: "No início do projeto", prazo_dias: 0, ordem: 0 },
      { percentual: 30, descricao: "Na aprovação do conceito", prazo_dias: null, ordem: 1 },
      { percentual: 20, descricao: "Na entrega final", prazo_dias: null, ordem: 2 }
    ]
  },
  consultoria: {
    rotulo: "Consultoria",
    parcelas: [
      { percentual: 50, descricao: "No início do período", prazo_dias: 0, ordem: 0 },
      { percentual: 50, descricao: "Na entrega do relatório final", prazo_dias: null, ordem: 1 }
    ]
  },
  unico: {
    rotulo: "Único",
    parcelas: [{ percentual: 100, descricao: "Pagamento único", prazo_dias: 0, ordem: 0 }]
  }
};

function gerarIdParcela(): string {
  return `parcela-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function EditorParcelas({ valorTotal, parcelas, onChange, categoriaSugerida }: EditorParcelasProps) {
  const totalPercentual = parcelas.reduce((soma, p) => soma + p.percentual, 0);
  const somaCorreta = parcelas.length > 0 && Math.abs(totalPercentual - 100) < 0.01;

  function adicionarParcela() {
    const nova: ParcelaPagamento = {
      id: gerarIdParcela(),
      percentual: Math.max(0, 100 - totalPercentual),
      descricao: "",
      prazo_dias: null,
      ordem: parcelas.length
    };
    onChange([...parcelas, nova]);
  }

  function removerParcela(index: number) {
    const novas = parcelas.filter((_, i) => i !== index).map((p, i) => ({ ...p, ordem: i }));
    onChange(novas);
  }

  function atualizarParcela(index: number, patch: Partial<ParcelaPagamento>) {
    const novas = parcelas.map((parcela, i) => (i === index ? { ...parcela, ...patch } : parcela));
    onChange(novas);
  }

  function aplicarTemplate(template: TemplateParcelas) {
    onChange(
      template.parcelas.map((p, i) => ({
        ...p,
        id: gerarIdParcela(),
        ordem: i
      }))
    );
  }

  return (
    <div className="space-y-4">
      {/* Templates rápidos */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Sugestões:</span>
        {Object.entries(TEMPLATES_PARCELAS).map(([chave, template]) => (
          <button
            key={chave}
            type="button"
            onClick={() => aplicarTemplate(template)}
            className={`rounded-md px-2 py-1 text-xs transition-colors ${
              categoriaSugerida === chave
                ? "bg-primary/10 text-primary"
                : "bg-secondary hover:bg-secondary/80"
            }`}
          >
            {template.rotulo}
          </button>
        ))}
      </div>

      {/* Lista de parcelas */}
      {parcelas.length > 0 && (
        <div className="space-y-3">
          {parcelas.map((parcela, index) => {
            const valorParcela = valorTotal ? (valorTotal * parcela.percentual) / 100 : 0;

            return (
              <div
                key={parcela.id || index}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
              >
                <GripVertical className="mt-8 h-5 w-5 shrink-0 text-muted-foreground/40" />

                <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Percentual (%)
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      value={parcela.percentual}
                      onChange={(evento) =>
                        atualizarParcela(index, { percentual: Number(evento.target.value) })
                      }
                      className="mt-1 h-10 rounded-xl"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                      Descrição / Vencimento
                    </Label>
                    <Input
                      value={parcela.descricao}
                      onChange={(evento) => atualizarParcela(index, { descricao: evento.target.value })}
                      placeholder="Ex: Na assinatura do contrato"
                      className="mt-1 h-10 rounded-xl"
                    />
                  </div>
                </div>

                <div className="shrink-0 pt-6 text-right">
                  <p className="text-sm font-semibold">{formatarMoeda(valorParcela)}</p>
                  <p className="text-xs text-muted-foreground">{parcela.percentual}%</p>
                </div>

                <button
                  type="button"
                  onClick={() => removerParcela(index)}
                  className="mt-8 shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                  aria-label="Remover parcela"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Botão adicionar */}
      <Button type="button" variant="outline" onClick={adicionarParcela} className="h-12 w-full border-dashed">
        <Plus className="h-4 w-4" />
        Adicionar parcela
      </Button>

      {/* Total */}
      {parcelas.length > 0 && (
        <div
          className={`flex items-center justify-between rounded-lg p-3 ${
            somaCorreta ? "border border-emerald-200 bg-emerald-50" : "border border-red-200 bg-red-50"
          }`}
        >
          <span className="text-sm font-medium">
            {somaCorreta ? "Total: 100%" : `Total: ${totalPercentual}%`}
          </span>
          <span className="text-sm font-semibold">{somaCorreta ? "✓ Correto" : "Ajuste para 100%"}</span>
        </div>
      )}
    </div>
  );
}
