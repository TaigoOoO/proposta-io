import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NaoEncontrado() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
        <FileQuestion className="h-6 w-6 text-muted-foreground" />
      </div>
      <div>
        <h1 className="font-display text-xl font-semibold">Página não encontrada</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          O conteúdo que você está procurando não existe ou foi removido.
        </p>
      </div>
      <Button asChild>
        <Link href="/dashboard">Voltar ao Dashboard</Link>
      </Button>
    </div>
  );
}
