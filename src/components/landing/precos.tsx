"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE_SAIDA = [0.16, 1, 0.3, 1] as const;

const VARIANTE_CONTAINER = {
  oculto: {},
  visivel: { transition: { staggerChildren: 0.1 } }
};

const VARIANTE_ITEM = {
  oculto: { opacity: 0, y: 20 },
  visivel: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_SAIDA } }
};

interface Plano {
  nome: string;
  preco: string;
  periodo?: string;
  destaque: boolean;
  recursos: string[];
  cta: string;
}

const PLANOS: Plano[] = [
  {
    nome: "Grátis",
    preco: "R$ 0",
    destaque: false,
    recursos: ["3 propostas por mês", "Sem geração por IA", "Templates básicos"],
    cta: "Criar conta"
  },
  {
    nome: "Start",
    preco: "R$ 29",
    periodo: "/mês",
    destaque: true,
    recursos: [
      "15 propostas por mês",
      "IA completa",
      "Templates premium",
      "PDF e envio por WhatsApp"
    ],
    cta: "Assinar agora"
  },
  {
    nome: "Pro",
    preco: "R$ 59",
    periodo: "/mês",
    destaque: false,
    recursos: [
      "40 propostas por mês",
      "IA completa",
      "Templates premium",
      "PDF e envio por WhatsApp",
      "Insights avançados",
      "Suporte prioritário"
    ],
    cta: "Assinar agora"
  }
];

export function Precos() {
  return (
    <section id="precos" className="px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE_SAIDA }}
          className="text-center text-3xl font-bold tracking-tight text-stone-900"
        >
          Escolha seu plano
        </motion.h2>

        <motion.div
          variants={VARIANTE_CONTAINER}
          initial="oculto"
          whileInView="visivel"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          {PLANOS.map((plano) => (
            <motion.div
              key={plano.nome}
              variants={VARIANTE_ITEM}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white p-8 transition-all duration-300 hover:-translate-y-0.5",
                plano.destaque
                  ? "border-primary shadow-lg shadow-primary/10 hover:shadow-xl"
                  : "border-stone-200 hover:shadow-md"
              )}
            >
              {plano.destaque && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white shadow-sm">
                  Mais popular
                </span>
              )}

              <h3 className="text-lg font-semibold text-stone-900">{plano.nome}</h3>
              <p className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-stone-900">{plano.preco}</span>
                {plano.periodo && <span className="text-sm text-stone-500">{plano.periodo}</span>}
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {plano.recursos.map((recurso) => (
                  <li key={recurso} className="flex items-start gap-2 text-sm text-stone-600">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {recurso}
                  </li>
                ))}
              </ul>

              <Link
                href="/register"
                className={cn(
                  "mt-8 inline-flex h-11 items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97]",
                  plano.destaque
                    ? "bg-primary text-white shadow-premium hover:bg-indigo-800 hover:shadow-lg"
                    : "border border-stone-200 text-stone-700 hover:bg-stone-50"
                )}
              >
                {plano.cta}
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-8 text-center text-xs text-stone-400">
          Pague via PIX ou cartão. Cancele quando quiser.
        </p>
      </div>
    </section>
  );
}
