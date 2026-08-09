"use client";

import { useState, type DragEvent } from "react";
import { Pencil, Eye, EyeOff, Trash2, GripVertical, Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ICONE_BLOCO } from "@/components/propostas/icone-bloco";
import type { BlocoProposta } from "@/types";

interface BlocoEditorCardProps {
  bloco: BlocoProposta;
  onAtualizar: (patch: Partial<BlocoProposta>) => void;
  onRemover: () => void;
  onDragStart: (evento: DragEvent<HTMLDivElement>) => void;
  onDragOver: (evento: DragEvent<HTMLDivElement>) => void;
  onDrop: (evento: DragEvent<HTMLDivElement>) => void;
  arrastando: boolean;
}

export function BlocoEditorCard({
  bloco,
  onAtualizar,
  onRemover,
  onDragStart,
  onDragOver,
  onDrop,
  arrastando
}: BlocoEditorCardProps) {
  const [editando, setEditando] = useState(false);
  const Icone = ICONE_BLOCO[bloco.tipo];

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={cn(
        "rounded-xl border bg-white p-5 transicao-premium",
        editando ? "border-primary ring-1 ring-primary/20" : "border-stone-200",
        !bloco.visivel && "opacity-50",
        arrastando && "opacity-40"
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-stone-300 active:cursor-grabbing" />
          <Icone className="h-4 w-4 shrink-0 text-primary" />
          <p className="truncate text-sm font-semibold text-stone-700">{bloco.titulo}</p>
          {!bloco.visivel && (
            <Badge variant="outline" className="shrink-0 border-stone-200 text-stone-400">
              Oculto
            </Badge>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setEditando((atual) => !atual)}
            aria-label={editando ? "Concluir edição" : "Editar bloco"}
            className="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-stone-50 hover:text-stone-600"
          >
            {editando ? <Check className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => onAtualizar({ visivel: !bloco.visivel })}
            aria-label={bloco.visivel ? "Ocultar bloco" : "Mostrar bloco"}
            className="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-stone-50 hover:text-stone-600"
          >
            {bloco.visivel ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
          {!bloco.obrigatorio && (
            <button
              type="button"
              onClick={onRemover}
              aria-label="Remover bloco"
              className="rounded-md p-1.5 text-stone-400 transition-colors hover:bg-red-50 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {editando ? (
        <Textarea
          value={bloco.conteudo}
          onChange={(evento) => onAtualizar({ conteudo: evento.target.value })}
          rows={6}
          autoFocus
          className="rounded-lg text-sm"
        />
      ) : (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{bloco.conteudo}</p>
      )}
    </div>
  );
}
