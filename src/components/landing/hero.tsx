"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

const EASE_SAIDA = [0.16, 1, 0.3, 1] as const;

/**
 * Maquete animada de uma proposta sendo finalizada — ocupa o lugar do
 * "screenshot do dashboard" citado no briefing. Em vez de simular uma
 * captura de tela genérica, ela usa a mesma linguagem visual do produto
 * real (cartão, badge de status com bolinha, cor de sucesso) para mostrar
 * o resultado concreto: uma proposta pronta e aprovada.
 */
function MaquetePropostaAnimada() {
  const containerRef = useRef<HTMLDivElement>(null);
  const dentroDaTela = useInView(containerRef, { once: true, margin: "-80px" });

  const linhas = [
    { largura: "92%" },
    { largura: "78%" },
    { largura: "85%" },
    { largura: "60%" }
  ];

  return (
    <div
      ref={containerRef}
      className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl"
    >
      <div className="flex items-center gap-2 border-b border-stone-200 bg-stone-50 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
          <span className="h-2.5 w-2.5 rounded-full bg-stone-300" />
        </div>
        <div className="mx-auto flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs text-stone-400 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          proposta.io/propostas/casamento-silva
        </div>
      </div>

      <div className="space-y-5 p-6 sm:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-stone-400">Orçamento para</p>
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={dentroDaTela ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4 }}
              className="text-lg font-semibold text-stone-900"
            >
              Casamento Silva &amp; Costa
            </motion.p>
          </div>
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={dentroDaTela ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.35, delay: 1.15, ease: EASE_SAIDA }}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Aprovada
          </motion.span>
        </div>

        <div className="space-y-2.5">
          {linhas.map((linha, indice) => (
            <motion.div
              key={indice}
              initial={{ opacity: 0 }}
              animate={dentroDaTela ? { opacity: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.35 + indice * 0.18 }}
              className="h-2.5 rounded-full bg-stone-100"
              style={{ width: linha.largura }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={dentroDaTela ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, delay: 1.0 }}
          className="flex items-center justify-between border-t border-stone-100 pt-4"
        >
          <span className="flex items-center gap-1.5 text-xs text-stone-400">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Gerada com IA em 8 segundos
          </span>
          <span className="text-lg font-semibold text-stone-900">R$ 12.500,00</span>
        </motion.div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:px-6 md:pb-24 md:pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(67,56,202,0.08),transparent)]"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_SAIDA }}
        className="mx-auto max-w-3xl text-center"
      >
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 md:text-6xl">
          Propostas comerciais que <span className="text-primary">convertem</span> — em 5 minutos
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-stone-500 md:text-xl">
          Deixe a IA criar propostas profissionais enquanto você foca no que importa: fechar negócios.
        </p>
        <div className="mt-8 flex flex-col items-center gap-2">
          <Link
            href="/register"
            className="inline-flex h-14 items-center gap-2 rounded-xl bg-primary px-8 font-medium text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-indigo-800 hover:shadow-xl active:scale-[0.97]"
          >
            Começar grátis
            <ArrowRight className="h-4 w-4" />
          </Link>
          <span className="text-sm text-stone-400">Não precisa de cartão</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: EASE_SAIDA }}
        className="mt-14 md:mt-16"
      >
        <MaquetePropostaAnimada />
      </motion.div>
    </section>
  );
}

interface EstatisticaProps {
  valorFinal: number;
  prefixo?: string;
  sufixo?: string;
  decimais?: number;
  rotulo: string;
}

function NumeroAnimado({ valorFinal, prefixo = "", sufixo = "", decimais = 0 }: EstatisticaProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const dentroDaTela = useInView(ref, { once: true, margin: "-60px" });
  const [valorExibido, setValorExibido] = useState(0);
  const contador = useMotionValue(0);

  useEffect(() => {
    if (!dentroDaTela) return;
    const controles = animate(contador, valorFinal, {
      duration: 1.6,
      ease: EASE_SAIDA,
      onUpdate: (valorAtual) => setValorExibido(valorAtual)
    });
    return () => controles.stop();
  }, [dentroDaTela, contador, valorFinal]);

  const textoFormatado =
    decimais > 0 ? valorExibido.toFixed(decimais).replace(".", ",") : Math.floor(valorExibido).toLocaleString("pt-BR");

  return (
    <span ref={ref}>
      {prefixo}
      {textoFormatado}
      {sufixo}
    </span>
  );
}

const ESTATISTICAS: EstatisticaProps[] = [
  { valorFinal: 1247, sufixo: "", rotulo: "propostas geradas este mês" },
  { valorFinal: 98, sufixo: "%", rotulo: "de aprovação dos clientes" },
  { valorFinal: 4.8, decimais: 1, sufixo: "★", rotulo: "no Google (127 avaliações)" },
  { valorFinal: 500, sufixo: "+", rotulo: "prestadores de serviço" }
];

export function SocialProof() {
  return (
    <section className="border-y border-stone-200 bg-white px-4 py-12 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.5, ease: EASE_SAIDA }}
        className="mx-auto grid max-w-4xl grid-cols-2 gap-8 divide-stone-200 sm:gap-6 md:grid-cols-4 md:divide-x"
      >
        {ESTATISTICAS.map((estatistica, indice) => (
          <div key={indice} className={indice > 0 ? "md:pl-6" : ""}>
            <p className="text-3xl font-bold tracking-tight text-stone-900">
              <NumeroAnimado {...estatistica} />
            </p>
            <p className="mt-1 text-sm text-stone-500">{estatistica.rotulo}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
