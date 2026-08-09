"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, UserCircle } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { criarClienteSupabase } from "@/lib/supabase";

interface CabecalhoProps {
  nomeCompleto: string;
  email: string;
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 0 || partes[0] === "") return "?";
  if (partes.length === 1) return partes[0]!.slice(0, 2).toUpperCase();
  return `${partes[0]![0]}${partes[partes.length - 1]![0]}`.toUpperCase();
}

export function Cabecalho({ nomeCompleto, email }: CabecalhoProps) {
  const router = useRouter();

  async function sair() {
    const supabase = criarClienteSupabase();
    await supabase.auth.signOut();
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Você saiu da sua conta.");
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b border-stone-200/80 bg-white/70 px-4 backdrop-blur-xl lg:px-8">
      <span className="text-sm font-medium text-stone-500 lg:hidden">Proposta.io</span>
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{iniciais(nomeCompleto)}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="text-sm font-medium">{nomeCompleto}</p>
              <p className="truncate text-xs font-normal text-muted-foreground">{email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/perfil">
                <UserCircle className="mr-2 h-4 w-4" />
                Meu Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={sair} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
