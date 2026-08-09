"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const EASE_SAIDA = [0.16, 1, 0.3, 1] as const;

export function CtaFinal() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-stone-100 to-white px-4 py-20 sm:px-6 md:py-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5, ease: EASE_SAIDA }}
        className="mx-auto max-w-xl text-center"
      >
        <h2 className="text-3xl font-bold tracking-tight text-stone-900">
          Pronto para fechar mais negócios?
        </h2>
        <p className="mt-3 text-stone-500">
          Crie sua primeira proposta em menos de 5 minutos. É grátis.
        </p>
        <Link
          href="/register"
          className="mt-8 inline-flex h-14 items-center gap-2 rounded-xl bg-primary px-8 font-medium text-white shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-indigo-800 hover:shadow-xl active:scale-[0.97]"
        >
          Começar grátis
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </section>
  );
}
