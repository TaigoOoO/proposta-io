import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FormularioContato } from "@/components/landing/formulario-contato";

export const metadata: Metadata = {
  title: "Contato — Proposta.io",
  description: "Tem dúvidas, sugestões ou precisa de ajuda? Fale com a equipe do Proposta.io."
};

export default function PaginaContato() {
  return (
    <div className="animate-fade-in-up px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900">Fale conosco</h1>
        <p className="mt-4 text-lg text-stone-500">
          Tem dúvidas, sugestões ou precisa de ajuda? Manda um email.
        </p>
        <a
          href="mailto:contato@proposta.io"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Mail className="h-4 w-4" />
          contato@proposta.io
        </a>
      </div>

      <Card className="mx-auto mt-10 max-w-xl">
        <CardContent className="p-6 sm:p-8">
          <FormularioContato />
        </CardContent>
      </Card>
    </div>
  );
}
