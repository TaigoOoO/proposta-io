import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Proposta.io — Orçamentos profissionais com IA",
  description:
    "Crie propostas comerciais profissionais em minutos, com a ajuda de inteligência artificial, e envie para seus clientes por WhatsApp ou PDF."
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans text-foreground">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
