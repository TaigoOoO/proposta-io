import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { criarClienteSupabaseServidor } from "@/lib/supabase-server";
import { Hero, SocialProof } from "@/components/landing/hero";
import { ComoFunciona, Features } from "@/components/landing/features";
import { Precos } from "@/components/landing/precos";
import { Faq } from "@/components/landing/faq";
import { CtaFinal } from "@/components/landing/cta-final";

const TITULO = "Proposta.io — Propostas comerciais com IA em 5 minutos";
const DESCRICAO =
  "Crie propostas profissionais com inteligência artificial. Parcelas flexíveis, PDF, WhatsApp. Grátis para começar.";

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRICAO,
  openGraph: {
    title: TITULO,
    description: DESCRICAO,
    type: "website",
    locale: "pt_BR",
    siteName: "Proposta.io"
  },
  twitter: {
    card: "summary",
    title: TITULO,
    description: DESCRICAO
  }
};

export default async function PaginaInicial() {
  const supabase = await criarClienteSupabaseServidor();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <>
      <Hero />
      <SocialProof />
      <ComoFunciona />
      <Features />
      <Precos />
      <Faq />
      <CtaFinal />
    </>
  );
}
