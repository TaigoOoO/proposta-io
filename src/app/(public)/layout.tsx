"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FileText, Menu, X } from "lucide-react";
import { Footer } from "@/components/landing/footer";

const EASE_SAIDA = [0.16, 1, 0.3, 1] as const;

export default function LayoutPublico({ children }: { children: ReactNode }) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMenuAberto(false)}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <FileText className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-stone-900">Proposta.io</span>
          </Link>

          <nav className="hidden items-center gap-2 sm:flex">
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-indigo-800 hover:shadow-md active:scale-[0.97]"
            >
              Criar conta
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMenuAberto((atual) => !atual)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 sm:hidden"
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuAberto}
          >
            {menuAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <AnimatePresence>
          {menuAberto && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE_SAIDA }}
              className="overflow-hidden border-t border-stone-200/80 bg-white/95 backdrop-blur-xl sm:hidden"
            >
              <div className="flex flex-col gap-1 px-4 py-3">
                <Link
                  href="/login"
                  onClick={() => setMenuAberto(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100"
                >
                  Entrar
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMenuAberto(false)}
                  className="rounded-lg bg-primary px-3 py-2.5 text-center text-sm font-medium text-white"
                >
                  Criar conta
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">{children}</main>

      <Footer />
    </div>
  );
}
