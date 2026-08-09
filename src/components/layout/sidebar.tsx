"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileSignature, LayoutDashboard, FilePlus2, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const ITENS_NAV = [
  { href: "/dashboard", rotulo: "Dashboard", icone: LayoutDashboard },
  { href: "/propostas/nova", rotulo: "Nova Proposta", icone: FilePlus2 },
  { href: "/perfil", rotulo: "Perfil", icone: UserCircle }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-stone-200 bg-white lg:flex">
      <div className="flex items-center gap-2.5 p-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
          <FileSignature className="h-4 w-4" />
        </div>
        <span className="text-lg font-semibold tracking-tight text-stone-900">Proposta.io</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-4">
        {ITENS_NAV.map((item) => {
          const ativo = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icone = item.icone;
          return (
            <Link
              key={item.href}
              href={item.href}
              data-tour={item.href === "/perfil" ? "perfil" : item.href === "/propostas/nova" ? "nova-proposta" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg py-3 px-4 text-sm font-medium transition-all duration-200 hover:pl-5",
                ativo
                  ? "-ml-[2px] border-l-2 border-primary bg-primary/10 text-primary"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              )}
            >
              <Icone className="h-5 w-5" />
              {item.rotulo}
            </Link>
          );
        })}
      </nav>
      <div className="p-4">
        <p className="text-xs text-stone-400">Proposta.io · v2.0</p>
      </div>
    </aside>
  );
}
