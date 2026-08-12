"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileSignature } from "lucide-react";
import { cn } from "@/lib/utils";

function IlustracaoProposta() {
  return (
    <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-48 w-48 sm:h-56 sm:w-56">
      <g stroke="white" strokeOpacity={0.85} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M56 24h84l24 24v148a6 6 0 0 1-6 6H56a6 6 0 0 1-6-6V30a6 6 0 0 1 6-6Z" />
        <path d="M140 24v24h24" />
        <path d="M74 84h72" strokeOpacity={0.55} />
        <path d="M74 104h72" strokeOpacity={0.55} />
        <path d="M74 124h48" strokeOpacity={0.55} />
      </g>
      <g>
        <circle cx={158} cy={158} r={34} fill="#1e1b4b" stroke="white" strokeOpacity={0.9} strokeWidth={2.5} />
        <path
          d="M143 158l10 10 22-22"
          stroke="white"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

function PadraoPontos() {
  return (
    <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <pattern id="grid-pontos" width={24} height={24} patternUnits="userSpaceOnUse">
          <circle cx={2} cy={2} r={1.4} fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid-pontos)" opacity={0.04} />
    </svg>
  );
}

export default function LayoutAuth({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const emLogin = pathname === "/login";

  return (
    <div className="flex min-h-screen">
      <div
        className="relative hidden w-[60%] flex-col items-center justify-center overflow-hidden lg:flex"
        style={{ background: "linear-gradient(160deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)" }}
      >
        <PadraoPontos />
        <div className="relative flex flex-col items-center gap-8 px-12 text-center">
          <div className="animate-float">
            <IlustracaoProposta />
          </div>
          <div>
            <p className="text-2xl font-light tracking-tight text-white/90">Propostas que convertem.</p>
            <p className="mt-2 text-sm font-normal text-white/60">Em minutos, não em horas.</p>
          </div>
        </div>
        <p className="absolute bottom-8 text-xs text-white/40">Em fase beta — junte-se aos primeiros usuários</p>
      </div>

      <div className="flex w-full flex-col items-center justify-center bg-stone-50 px-6 py-12 lg:w-[40%]">
        <div className="w-full max-w-sm animate-fade-in-up">
          <Link href="/login" className="mb-8 flex items-center justify-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
              <FileSignature className="h-4 w-4" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-stone-900">Proposta.io</span>
          </Link>

          <div className="mb-8 flex items-center justify-center gap-6 border-b border-stone-200">
            <Link
              href="/login"
              className={cn(
                "relative pb-3 text-sm font-medium transicao-premium",
                emLogin ? "text-stone-900" : "text-stone-400 hover:text-stone-600"
              )}
            >
              Entrar
              <span
                className={cn(
                  "absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-200",
                  emLogin ? "w-full" : "w-0"
                )}
              />
            </Link>
            <Link
              href="/register"
              className={cn(
                "relative pb-3 text-sm font-medium transicao-premium",
                !emLogin ? "text-stone-900" : "text-stone-400 hover:text-stone-600"
              )}
            >
              Criar conta
              <span
                className={cn(
                  "absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-200",
                  !emLogin ? "w-full" : "w-0"
                )}
              />
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
