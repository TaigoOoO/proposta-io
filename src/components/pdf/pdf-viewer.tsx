"use client";

import { FileText } from "lucide-react";

interface PdfViewerProps {
  propostaId: string;
}

export function PdfViewer({ propostaId }: PdfViewerProps) {
  const url = `/api/gerar-pdf?id=${propostaId}`;

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-muted">
      <div className="flex items-center gap-2 border-b border-border bg-background px-4 py-2.5">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">Pré-visualização do PDF</span>
      </div>
      <iframe src={url} title="Pré-visualização da proposta em PDF" className="h-[600px] w-full" />
    </div>
  );
}
