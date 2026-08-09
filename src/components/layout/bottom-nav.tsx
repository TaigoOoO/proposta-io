"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FilePlus2, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ITENS_NAV = [
  { href: "/dashboard", rotulo: "Dashboard", icone: LayoutDashboard },
  { href: "/propostas/nova", rotulo: "Nova Proposta", icone: FilePlus2 },
  { href: "/perfil", rotulo: "Perfil", icone: UserCircle }
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-stone-200 bg-white lg:hidden"
      style={{ boxShadow: "0 -1px 3px rgba(0,0,0,0.05)" }}
    >
      {ITENS_NAV.map((item) => {
        const ativo = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        const Icone = item.icone;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transicao-premium",
              ativo ? "text-primary" : "text-stone-400"
            )}
          >
            <Icone className="h-6 w-6" strokeWidth={ativo ? 2.25 : 2} />
            {item.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
