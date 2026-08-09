"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { esquemaPasso1Cliente, type Passo1ClienteInput } from "@/lib/validacoes";
import { mascararTelefone, cn } from "@/lib/utils";
import type { NovaPropostaClienteInput } from "@/types";

interface FormularioClienteProps {
  valoresIniciais: NovaPropostaClienteInput;
  onAvancar: (dados: NovaPropostaClienteInput) => void;
}

function campoClasse(comErro: boolean): string {
  return cn("h-12 rounded-xl", comErro && "animate-shake border-destructive focus-visible:ring-destructive/20");
}

export function FormularioCliente({ valoresIniciais, onAvancar }: FormularioClienteProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<Passo1ClienteInput>({
    resolver: zodResolver(esquemaPasso1Cliente),
    defaultValues: valoresIniciais
  });

  const whatsapp = watch("cliente_whatsapp");

  return (
    <form onSubmit={handleSubmit(onAvancar)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="cliente_nome">Nome do cliente *</Label>
        <Input
          id="cliente_nome"
          className={campoClasse(Boolean(errors.cliente_nome))}
          placeholder="Ex: Maria Oliveira"
          {...register("cliente_nome")}
        />
        {errors.cliente_nome && <p className="text-xs text-destructive">{errors.cliente_nome.message}</p>}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="cliente_email">E-mail do cliente</Label>
          <Input
            id="cliente_email"
            type="email"
            className={campoClasse(Boolean(errors.cliente_email))}
            placeholder="cliente@exemplo.com"
            {...register("cliente_email")}
          />
          {errors.cliente_email && <p className="text-xs text-destructive">{errors.cliente_email.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cliente_whatsapp">WhatsApp do cliente</Label>
          <Input
            id="cliente_whatsapp"
            className={campoClasse(Boolean(errors.cliente_whatsapp))}
            placeholder="(41) 99999-9999"
            value={whatsapp}
            onChange={(evento) => setValue("cliente_whatsapp", mascararTelefone(evento.target.value))}
          />
          {errors.cliente_whatsapp && (
            <p className="text-xs text-destructive">{errors.cliente_whatsapp.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cliente_endereco">Endereço (opcional)</Label>
        <Textarea
          id="cliente_endereco"
          className="min-h-[100px] rounded-xl"
          placeholder="Rua, número, bairro, cidade — UF"
          rows={2}
          {...register("cliente_endereco")}
        />
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" size="lg">
          Continuar
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
