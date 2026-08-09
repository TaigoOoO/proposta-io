import type { Metadata } from "next";
import { Sparkles, Zap, TrendingUp, type LucideIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Sobre nós — Proposta.io",
  description:
    "Criado por prestadores de serviço, para prestadores de serviço. Conheça a missão por trás do Proposta.io."
};

interface Valor {
  icone: LucideIcon;
  titulo: string;
  descricao: string;
}

const VALORES: Valor[] = [
  {
    icone: Sparkles,
    titulo: "IA com propósito",
    descricao: "Tecnologia que existe para resolver um problema real, não para impressionar."
  },
  {
    icone: Zap,
    titulo: "Simplicidade",
    descricao: "Se leva mais de 5 minutos, a gente simplifica."
  },
  {
    icone: TrendingUp,
    titulo: "Resultado",
    descricao: "O que importa é fechar negócio, não ficar bonito na tela."
  }
];

const PARAGRAFOS = [
  "O Proposta.io nasceu da frustração de perder negócios por não saber escrever propostas comerciais.",
  "Nossa missão é simples: dar a qualquer prestador de serviço as ferramentas que só agências tinham.",
  "Em 5 minutos, você cria uma proposta profissional com IA, parcelas flexíveis e envio por WhatsApp."
];

export default function PaginaSobre() {
  return (
    <div className="animate-fade-in-up px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900">Sobre o Proposta.io</h1>
        <p className="mt-4 text-lg text-stone-500">
          Criado por prestadores de serviço, para prestadores de serviço.
        </p>
      </div>

      <div className="mx-auto mt-12 max-w-2xl space-y-5">
        {PARAGRAFOS.map((paragrafo, indice) => (
          <p key={indice} className="text-base leading-relaxed text-stone-600">
            {paragrafo}
          </p>
        ))}
      </div>

      <div className="mx-auto mt-16 grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-3">
        {VALORES.map((valor) => {
          const Icone = valor.icone;
          return (
            <div
              key={valor.titulo}
              className="rounded-2xl border border-stone-200 bg-white p-6 text-center transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                <Icone className="h-5 w-5 text-primary" />
              </div>
              <h2 className="mt-4 text-base font-semibold text-stone-900">{valor.titulo}</h2>
              <p className="mt-1.5 text-sm text-stone-500">{valor.descricao}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
