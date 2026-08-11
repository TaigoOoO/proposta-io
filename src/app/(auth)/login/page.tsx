"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { criarClienteSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { esquemaLogin, type LoginInput } from "@/lib/validacoes";

/**
 * `useSearchParams()` exige que o componente que a utiliza esteja dentro de
 * um `<Suspense>` — sem isso, o Next.js não consegue pré-renderizar a rota
 * `/login` e o build falha. Por isso a lógica fica isolada aqui, e a página
 * (abaixo) só cuida de envolver este componente em Suspense.
 */
function ConteudoLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [enviando, setEnviando] = useState(false);
  const [modoRecuperacao, setModoRecuperacao] = useState(false);
  const [emailRecuperacao, setEmailRecuperacao] = useState("");
  const [enviandoRecuperacao, setEnviandoRecuperacao] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginInput>({ resolver: zodResolver(esquemaLogin) });

  async function aoEnviar(dados: LoginInput) {
    setEnviando(true);
    const supabase = criarClienteSupabase();

    const { error } = await supabase.auth.signInWithPassword({
      email: dados.email,
      password: dados.senha
    });

    if (error) {
      setEnviando(false);
      toast.error(
        error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : "Não foi possível entrar. Tente novamente."
      );
      return;
    }

    const redirecionarPara = searchParams.get("redirecionar") || "/dashboard";
    router.push(redirecionarPara);
    router.refresh();
  }

  async function enviarRecuperacao() {
    if (!emailRecuperacao.trim()) {
      toast.error("Informe seu e-mail.");
      return;
    }
    setEnviandoRecuperacao(true);
    const supabase = criarClienteSupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(emailRecuperacao, {
      redirectTo: `${window.location.origin}/auth/callback`
    });
    setEnviandoRecuperacao(false);

    if (error) {
      toast.error("Não foi possível enviar o link de recuperação.");
      return;
    }

    toast.success("Se o e-mail existir, você receberá um link de recuperação.");
    setModoRecuperacao(false);
  }

  if (modoRecuperacao) {
    return (
      <div className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-stone-900">Recuperar senha</p>
          <p className="mt-1 text-xs text-stone-500">Enviaremos um link para redefinir sua senha.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-recuperacao" className="text-xs font-medium uppercase tracking-wider text-stone-500">
            E-mail
          </Label>
          <Input
            id="email-recuperacao"
            type="email"
            className="h-12 rounded-xl border-stone-200 focus-visible:border-primary focus-visible:ring-primary/20"
            placeholder="voce@exemplo.com"
            value={emailRecuperacao}
            onChange={(evento) => setEmailRecuperacao(evento.target.value)}
          />
        </div>
        <Button
          className="h-12 w-full rounded-xl shadow-lg shadow-primary/25 transicao-premium hover:shadow-xl active:scale-[0.98]"
          onClick={enviarRecuperacao}
          disabled={enviandoRecuperacao}
        >
          {enviandoRecuperacao && <Loader2 className="h-4 w-4 animate-spin" />}
          Enviar link de recuperação
        </Button>
        <button
          type="button"
          onClick={() => setModoRecuperacao(false)}
          className="w-full text-center text-xs text-stone-500 underline-offset-4 hover:text-primary hover:underline"
        >
          Lembrei minha senha
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(aoEnviar)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-medium uppercase tracking-wider text-stone-500">
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            className={cn(
              "h-12 rounded-xl border-stone-200 focus-visible:border-primary focus-visible:ring-primary/20",
              errors.email && "animate-shake border-destructive focus-visible:ring-destructive/20"
            )}
            placeholder="voce@exemplo.com"
            autoComplete="email"
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="senha" className="text-xs font-medium uppercase tracking-wider text-stone-500">
              Senha
            </Label>
            <button
              type="button"
              onClick={() => setModoRecuperacao(true)}
              className="text-xs text-stone-500 underline-offset-4 hover:text-primary hover:underline"
            >
              Esqueci minha senha
            </button>
          </div>
          <Input
            id="senha"
            type="password"
            className={cn(
              "h-12 rounded-xl border-stone-200 focus-visible:border-primary focus-visible:ring-primary/20",
              errors.senha && "animate-shake border-destructive focus-visible:ring-destructive/20"
            )}
            placeholder="••••••••"
            autoComplete="current-password"
            {...register("senha")}
          />
          {errors.senha && <p className="text-xs text-destructive">{errors.senha.message}</p>}
        </div>
        <Button
          type="submit"
          className="h-12 w-full rounded-xl shadow-lg shadow-primary/25 transicao-premium hover:shadow-xl active:scale-[0.98]"
          disabled={enviando}
        >
          {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
          Entrar
        </Button>
      </form>
    </div>
  );
}

function CarregandoLogin() {
  return <div className="flex items-center justify-center py-16 text-sm text-stone-400">Carregando...</div>;
}

export default function PaginaLogin() {
  return (
    <Suspense fallback={<CarregandoLogin />}>
      <ConteudoLogin />
    </Suspense>
  );
}
