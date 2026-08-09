"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { criarClienteSupabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { esquemaCadastro, type CadastroInput } from "@/lib/validacoes";

const ROTULO_ESTILO = "text-xs font-medium uppercase tracking-wider text-stone-500";

function campoClasse(comErro: boolean): string {
  return cn(
    "h-12 rounded-xl border-stone-200 focus-visible:border-primary focus-visible:ring-primary/20",
    comErro && "animate-shake border-destructive focus-visible:ring-destructive/20"
  );
}

export default function PaginaCadastro() {
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<CadastroInput>({ resolver: zodResolver(esquemaCadastro) });

  async function aoEnviar(dados: CadastroInput) {
    setEnviando(true);
    const supabase = criarClienteSupabase();

    const { data, error } = await supabase.auth.signUp({
      email: dados.email,
      password: dados.senha,
      options: {
        data: { nome_completo: dados.nome_completo },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      setEnviando(false);
      toast.error(
        error.message === "User already registered"
          ? "Este e-mail já está cadastrado."
          : "Não foi possível criar sua conta. Tente novamente."
      );
      return;
    }

    if (data.session) {
      toast.success("Conta criada com sucesso!");
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setEnviando(false);
    toast.success("Quase lá! Confirme seu e-mail para ativar a conta.");
    router.push("/login");
  }

  return (
    <form onSubmit={handleSubmit(aoEnviar)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome_completo" className={ROTULO_ESTILO}>
          Nome completo
        </Label>
        <Input
          id="nome_completo"
          className={campoClasse(Boolean(errors.nome_completo))}
          placeholder="Seu nome"
          autoComplete="name"
          {...register("nome_completo")}
        />
        {errors.nome_completo && <p className="text-xs text-destructive">{errors.nome_completo.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="email" className={ROTULO_ESTILO}>
          E-mail
        </Label>
        <Input
          id="email"
          type="email"
          className={campoClasse(Boolean(errors.email))}
          placeholder="voce@exemplo.com"
          autoComplete="email"
          {...register("email")}
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="senha" className={ROTULO_ESTILO}>
          Senha
        </Label>
        <Input
          id="senha"
          type="password"
          className={campoClasse(Boolean(errors.senha))}
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          {...register("senha")}
        />
        {errors.senha && <p className="text-xs text-destructive">{errors.senha.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmar_senha" className={ROTULO_ESTILO}>
          Confirmar senha
        </Label>
        <Input
          id="confirmar_senha"
          type="password"
          className={campoClasse(Boolean(errors.confirmar_senha))}
          placeholder="Repita a senha"
          autoComplete="new-password"
          {...register("confirmar_senha")}
        />
        {errors.confirmar_senha && <p className="text-xs text-destructive">{errors.confirmar_senha.message}</p>}
      </div>
      <Button
        type="submit"
        className="h-12 w-full rounded-xl shadow-lg shadow-primary/25 transicao-premium hover:shadow-xl active:scale-[0.98]"
        disabled={enviando}
      >
        {enviando && <Loader2 className="h-4 w-4 animate-spin" />}
        Criar conta
      </Button>
    </form>
  );
}
