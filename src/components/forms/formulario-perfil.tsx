"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { criarClienteSupabase } from "@/lib/supabase";
import { esquemaPerfil, type PerfilInput } from "@/lib/validacoes";
import { mascararCnpj, mascararTelefone, cn } from "@/lib/utils";
import type { Perfil } from "@/types";

interface FormularioPerfilProps {
  perfil: Perfil;
}

export function FormularioPerfil({ perfil }: FormularioPerfilProps) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<PerfilInput>({
    resolver: zodResolver(esquemaPerfil),
    defaultValues: {
      nome_completo: perfil.nome_completo,
      nome_empresa: perfil.nome_empresa || "",
      cnpj: perfil.cnpj || "",
      telefone: perfil.telefone || "",
      endereco: perfil.endereco || ""
    }
  });

  const cnpj = watch("cnpj");
  const telefone = watch("telefone");

  async function aoSalvar(dados: PerfilInput) {
    setSalvando(true);
    const supabase = criarClienteSupabase();

    const perfilPreenchido = Boolean(dados.nome_empresa.trim());

    // Busca o onboarding_visto mais atual antes de mesclar, em vez de usar o
    // valor que veio nas props (pode estar desatualizado se outra tela
    // marcou um passo do onboarding entre o carregamento desta página e o
    // clique em salvar). Isso evita apagar marcos já registrados.
    const { data: perfilAtual } = await supabase
      .from("perfis")
      .select("onboarding_visto")
      .eq("id", perfil.id)
      .single();

    const onboardingBase = perfilAtual?.onboarding_visto || perfil.onboarding_visto || {};

    const { error } = await supabase.from("perfis").upsert({
      id: perfil.id,
      nome_completo: dados.nome_completo,
      nome_empresa: dados.nome_empresa || null,
      cnpj: dados.cnpj || null,
      telefone: dados.telefone || null,
      endereco: dados.endereco || null,
      onboarding_visto: perfilPreenchido ? { ...onboardingBase, perfil_preenchido: true } : onboardingBase
    });

    setSalvando(false);

    if (error) {
      toast.error("Não foi possível salvar seu perfil.");
      return;
    }

    toast.success("Perfil atualizado com sucesso!");

    // Sem isso, o Next.js pode reaproveitar a versão em cache das rotas já
    // visitadas (ex.: /dashboard) e o tour de onboarding continuaria
    // mostrando o estado antigo até um refresh manual.
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(aoSalvar)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="nome_completo">Nome completo *</Label>
        <Input
          id="nome_completo"
          className={cn(
            "h-12 rounded-xl",
            errors.nome_completo && "animate-shake border-destructive focus-visible:ring-destructive/20"
          )}
          {...register("nome_completo")}
        />
        {errors.nome_completo && <p className="text-xs text-destructive">{errors.nome_completo.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="nome_empresa">Nome da empresa</Label>
        <Input id="nome_empresa" className="h-12 rounded-xl" placeholder="Aparece no cabeçalho do PDF" {...register("nome_empresa")} />
        <p className="text-xs text-muted-foreground">
          Se preenchido, este nome aparece em destaque no cabeçalho das suas propostas em PDF.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            className={cn(
              "h-12 rounded-xl",
              errors.cnpj && "animate-shake border-destructive focus-visible:ring-destructive/20"
            )}
            placeholder="00.000.000/0000-00"
            value={cnpj}
            onChange={(evento) => setValue("cnpj", mascararCnpj(evento.target.value))}
          />
          {errors.cnpj && <p className="text-xs text-destructive">{errors.cnpj.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="telefone">Telefone / WhatsApp</Label>
          <Input
            id="telefone"
            className="h-12 rounded-xl"
            placeholder="(41) 99999-9999"
            value={telefone}
            onChange={(evento) => setValue("telefone", mascararTelefone(evento.target.value))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="endereco">Endereço</Label>
        <Textarea id="endereco" className="min-h-[100px] rounded-xl" rows={2} {...register("endereco")} />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" disabled={salvando}>
          {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Perfil
        </Button>
      </div>
    </form>
  );
}
