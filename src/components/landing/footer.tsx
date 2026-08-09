import Link from "next/link";
import { FileText } from "lucide-react";

interface ColunaLinks {
  titulo: string;
  links: Array<{ rotulo: string; href: string }>;
}

const COLUNAS: ColunaLinks[] = [
  {
    titulo: "Produto",
    links: [
      { rotulo: "Dashboard", href: "/dashboard" },
      { rotulo: "Preços", href: "/#precos" },
      { rotulo: "Recursos", href: "/#recursos" }
    ]
  },
  {
    titulo: "Empresa",
    links: [
      { rotulo: "Sobre nós", href: "/sobre" },
      { rotulo: "Blog", href: "/blog" },
      { rotulo: "Contato", href: "/contato" }
    ]
  },
  {
    titulo: "Legal",
    links: [
      { rotulo: "Termos", href: "/termos" },
      { rotulo: "Privacidade", href: "/privacidade" }
    ]
  }
];

export function Footer() {
  const ano = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 bg-white px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
                <FileText className="h-4 w-4" />
              </div>
              <span className="text-base font-semibold tracking-tight text-stone-900">Proposta.io</span>
            </div>
            <p className="mt-3 max-w-[220px] text-sm text-stone-500">
              Propostas comerciais que convertem.
            </p>
          </div>

          {COLUNAS.map((coluna) => (
            <div key={coluna.titulo}>
              <p className="text-sm font-semibold text-stone-900">{coluna.titulo}</p>
              <ul className="mt-3 space-y-2.5">
                {coluna.links.map((link) => (
                  <li key={link.rotulo}>
                    <Link href={link.href} className="text-sm text-stone-500 transition-colors hover:text-primary">
                      {link.rotulo}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-stone-200 pt-8">
          <p className="text-sm text-stone-400">© {ano} Proposta.io. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
