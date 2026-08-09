import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — Proposta.io",
  description: "Dicas para fechar mais negócios: propostas comerciais, parcelamento e IA para prestadores de serviço."
};

interface Post {
  titulo: string;
  resumo: string;
  leitura: string;
}

const POSTS: Post[] = [
  {
    titulo: "Como escrever uma proposta que converte",
    resumo: "5 elementos que toda proposta comercial precisa ter.",
    leitura: "5 min de leitura"
  },
  {
    titulo: "Parcelamento: a estratégia que aumenta suas vendas",
    resumo: "Por que oferecer parcelas flexíveis faz o cliente dizer sim.",
    leitura: "4 min de leitura"
  },
  {
    titulo: "IA na rotina do prestador de serviço",
    resumo: "Como usar inteligência artificial sem perder o toque humano.",
    leitura: "6 min de leitura"
  }
];

export default function PaginaBlog() {
  return (
    <div className="animate-fade-in-up px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900">Blog</h1>
        <p className="mt-4 text-lg text-stone-500">Dicas para fechar mais negócios</p>
      </div>

      <div className="mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
        {POSTS.map((post) => (
          <article
            key={post.titulo}
            className="flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-40 items-center justify-center bg-stone-200">
              <FileText className="h-8 w-8 text-stone-400" />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <p className="text-xs font-medium uppercase tracking-wider text-stone-400">{post.leitura}</p>
              <h2 className="mt-2 text-lg font-semibold text-stone-900">{post.titulo}</h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-500">{post.resumo}</p>
              <Link
                href="#"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Ler mais
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
