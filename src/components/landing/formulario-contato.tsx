"use client";

import { useState, type FormEvent } from "react";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function FormularioContato() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");

  function aoEnviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const assunto = `Contato via site — ${nome}`;
    const corpo = `Nome: ${nome}\nE-mail: ${email}\n\nMensagem:\n${mensagem}`;
    const linkMailto = `mailto:contato@proposta.io?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;

    toast.info("Abrindo seu aplicativo de e-mail...");
    window.location.href = linkMailto;
  }

  return (
    <form onSubmit={aoEnviar} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome</Label>
        <Input
          id="nome"
          className="h-12 rounded-xl"
          placeholder="Seu nome"
          required
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          className="h-12 rounded-xl"
          placeholder="voce@exemplo.com"
          required
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="mensagem">Mensagem</Label>
        <Textarea
          id="mensagem"
          className="min-h-[140px] rounded-xl"
          placeholder="Como podemos ajudar?"
          required
          value={mensagem}
          onChange={(evento) => setMensagem(evento.target.value)}
        />
      </div>

      <Button type="submit" size="lg" className="w-full">
        <Send className="h-4 w-4" />
        Enviar
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-stone-400">
        <Mail className="h-3.5 w-3.5" />
        Isso abre seu aplicativo de e-mail padrão com a mensagem pronta.
      </p>
    </form>
  );
}
