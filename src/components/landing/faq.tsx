"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const EASE_SAIDA: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface ItemFaq {
  pergunta: string;
  resposta: string;
}

const PERGUNTAS: ItemFaq[] = [
  {
    pergunta: "Preciso saber escrever propostas?",
    resposta: "Não. Você descreve o serviço em poucas linhas e a IA cria o texto completo da proposta para você."
  },
  {
    pergunta: "Posso editar o texto gerado?",
    resposta: "Sim. A proposta é organizada em blocos, e cada bloco pode ser editado, reordenado ou ocultado antes de enviar."
  },
  {
    pergunta: "O cliente precisa baixar algo?",
    resposta: "Não. Você pode enviar por link, PDF ou diretamente pelo WhatsApp — o cliente só precisa abrir e ler."
  },
  {
    pergunta: "Como funciona o plano Grátis?",
    resposta: "O plano Grátis permite criar até 3 propostas por mês, com templates básicos e sem geração por IA."
  },
  {
    pergunta: "Posso cancelar quando quiser?",
    resposta: "Sim, o cancelamento pode ser feito a qualquer momento, sem taxa e sem burocracia."
  },
  {
    pergunta: "Meus dados estão seguros?",
    resposta: "Sim. Seus dados e os dos seus clientes são protegidos com criptografia e tratados em conformidade com a LGPD."
  }
];

export function Faq() {
  const [abertaIndice, setAbertaIndice] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-2xl">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, ease: EASE_SAIDA }}
          className="text-center text-3xl font-bold tracking-tight text-stone-900"
        >
          Perguntas frequentes
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE_SAIDA }}
          className="mt-12 divide-y divide-stone-200 border-t border-stone-200"
        >
          {PERGUNTAS.map((item, indice) => {
            const aberta = abertaIndice === indice;
            return (
              <div key={item.pergunta}>
                <button
                  type="button"
                  onClick={() => setAbertaIndice(aberta ? null : indice)}
                  aria-expanded={aberta}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="text-base font-medium text-stone-900">{item.pergunta}</span>
                  <ChevronDown
                    className={cn(
                      "h-5 w-5 shrink-0 text-stone-400 transition-transform duration-200",
                      aberta && "rotate-180"
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {aberta && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: EASE_SAIDA }}
                      className="overflow-hidden"
                    >
                      <p className="pb-5 text-sm leading-relaxed text-stone-500">{item.resposta}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
