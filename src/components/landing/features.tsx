"use client";

import { motion } from "framer-motion";
import {
  ClipboardList,
  Sparkles,
  Send,
  PenLine,
  Wallet,
  MessageCircle,
  FileText,
  BarChart3,
  ShieldCheck,
  type LucideIcon
} from "lucide-react";

const EASE_SAIDA = [0.16, 1, 0.3, 1] as const;

const VARIANTE_CONTAINER = {
  oculto: {},
  visivel: { transition: { staggerChildren: 0.12 } }
};

const VARIANTE_ITEM = {
  oculto: { opacity: 0, y: 20 },
  visivel: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_SAIDA } }
};

interface PassoProcesso {
  numero: string;
  icone: LucideIcon;
  titulo: string;
  descricao: string;
}

const PASSOS: PassoProcesso[] = [
  {
    numero: "01",
    icone: ClipboardList,
    titulo: "Preencha os dados",
    descricao: "Digite os dados do cliente e do serviço. Não precisa escrever nada."
  },
  {
    numero: "02",
    icone: Sparkles,
    titulo: "A IA gera a proposta",
    descricao: "Em segundos, uma proposta comercial profissional, com o tom certo. Sua cara."
  },
  {
    numero: "03",
    icone: Send,
    titulo: "Envie e feche",
    descricao: "PDF, WhatsApp ou link profissional. Seu cliente aprova em 1 clique."
  }
];

export function ComoFunciona() {
  return (
    <section className="px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE_SAIDA }}
          className="mx-auto max-w-xl text-center"
        >
          <p className="text-sm font-medium uppercase tracking-wider text-primary">Como funciona</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-stone-900">
            Da ideia à proposta fechada
          </h2>
        </motion.div>

        <motion.div
          variants={VARIANTE_CONTAINER}
          initial="oculto"
          whileInView="visivel"
          viewport={{ once: true, margin: "-80px" }}
          className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8"
        >
          <div
            aria-hidden
            className="absolute left-0 right-0 top-[52px] hidden h-px bg-gradient-to-r from-transparent via-stone-200 to-transparent md:block"
          />
          {PASSOS.map((passo) => {
            const Icone = passo.icone;
            return (
              <motion.div key={passo.numero} variants={VARIANTE_ITEM} className="relative text-center">
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
                  <span
                    aria-hidden
                    className="absolute text-6xl font-bold text-stone-100 select-none"
                  >
                    {passo.numero}
                  </span>
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-stone-200 bg-white shadow-sm">
                    <Icone className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-stone-900">{passo.titulo}</h3>
                <p className="mx-auto mt-2 max-w-xs text-stone-500">{passo.descricao}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

interface Recurso {
  icone: LucideIcon;
  titulo: string;
  descricao: string;
}

const RECURSOS: Recurso[] = [
  {
    icone: PenLine,
    titulo: "IA que escreve por você",
    descricao: "Descreva o serviço em 2 linhas. A IA cria uma proposta completa, profissional e personalizada."
  },
  {
    icone: Wallet,
    titulo: "Parcelas do seu jeito",
    descricao: "30% na assinatura, 40% antes, 30% depois. Ou pagamento único. Você define."
  },
  {
    icone: MessageCircle,
    titulo: "Envio por WhatsApp",
    descricao: "Gere o link, envie no WhatsApp. Seu cliente vê e aprova no celular."
  },
  {
    icone: FileText,
    titulo: "PDF profissional",
    descricao: "Baixe um PDF lindo com sua marca, pronto para assinar."
  },
  {
    icone: BarChart3,
    titulo: "Insights de conversão",
    descricao: "Saiba qual template converte mais. A IA sugere melhorias."
  },
  {
    icone: ShieldCheck,
    titulo: "Seguro e privado",
    descricao: "Seus dados e dos seus clientes protegidos. Nunca vendemos informação."
  }
];

export function Features() {
  return (
    <section id="recursos" className="bg-white px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE_SAIDA }}
          className="text-center text-3xl font-bold tracking-tight text-stone-900"
        >
          Tudo que você precisa para fechar mais negócios
        </motion.h2>

        <motion.div
          variants={VARIANTE_CONTAINER}
          initial="oculto"
          whileInView="visivel"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {RECURSOS.map((recurso) => {
            const Icone = recurso.icone;
            return (
              <motion.div
                key={recurso.titulo}
                variants={VARIANTE_ITEM}
                className="rounded-2xl border border-stone-200 bg-white p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Icone className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900">{recurso.titulo}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-stone-500">{recurso.descricao}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
