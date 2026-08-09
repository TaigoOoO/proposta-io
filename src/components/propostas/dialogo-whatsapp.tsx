"use client";

import { useEffect, useState } from "react";
import { Target, Handshake, Zap, Pencil, Send } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { gerarLinkWhatsapp } from "@/lib/utils";
import type { MensagemWhatsapp, TomMensagem } from "@/types";

const CONFIGURACAO_TOM: Record<TomMensagem, { rotulo: string; icone: typeof Target }> = {
  direto: { rotulo: "Direto", icone: Target },
  cordial: { rotulo: "Cordial", icone: Handshake },
  urgente: { rotulo: "Urgente", icone: Zap }
};

interface DialogoWhatsappProps {
  aberto: boolean;
  onFechar: () => void;
  propostaId: string;
  clienteWhatsapp: string;
  onEnviado: () => void;
}

export function DialogoWhatsapp({ aberto, onFechar, propostaId, clienteWhatsapp, onEnviado }: DialogoWhatsappProps) {
  const [carregando, setCarregando] = useState(false);
  const [mensagens, setMensagens] = useState<MensagemWhatsapp[]>([]);
  const [modoPersonalizado, setModoPersonalizado] = useState(false);
  const [textoPersonalizado, setTextoPersonalizado] = useState("");

  useEffect(() => {
    if (!aberto) return;

    setModoPersonalizado(false);
    setMensagens([]);
    setCarregando(true);

    fetch(`/api/propostas/${propostaId}/whatsapp`, { method: "POST" })
      .then(async (resposta) => {
        const dados = await resposta.json();
        if (!resposta.ok) throw new Error(dados.erro || "Falha ao gerar mensagens");
        setMensagens(dados.mensagens as MensagemWhatsapp[]);
      })
      .catch(() => {
        toast.error("Não foi possível gerar as sugestões de mensagem.");
      })
      .finally(() => setCarregando(false));
  }, [aberto, propostaId]);

  function enviar(mensagem: string) {
    window.open(gerarLinkWhatsapp(clienteWhatsapp, mensagem), "_blank");
    onEnviado();
    onFechar();
  }

  return (
    <Dialog open={aberto} onOpenChange={(valor) => !valor && onFechar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Escolha o tom da mensagem</DialogTitle>
          <DialogDescription>A IA sugeriu 3 variações — escolha uma ou escreva a sua.</DialogDescription>
        </DialogHeader>

        {carregando ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, indice) => (
              <div
                key={indice}
                className="space-y-2 rounded-xl border border-stone-200 p-3"
                style={{ animationDelay: `${indice * 100}ms` }}
              >
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ))}
          </div>
        ) : modoPersonalizado ? (
          <div className="space-y-3">
            <Textarea
              value={textoPersonalizado}
              onChange={(evento) => setTextoPersonalizado(evento.target.value)}
              rows={4}
              placeholder="Escreva sua mensagem..."
              className="rounded-xl"
              autoFocus
            />
            <Button
              className="w-full"
              disabled={!textoPersonalizado.trim()}
              onClick={() => enviar(textoPersonalizado)}
            >
              <Send className="h-4 w-4" />
              Enviar pelo WhatsApp
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {mensagens.map((item) => {
              const config = CONFIGURACAO_TOM[item.tom];
              const Icone = config.icone;
              return (
                <button
                  key={item.tom}
                  type="button"
                  onClick={() => enviar(item.mensagem)}
                  className="w-full rounded-xl border border-stone-200 p-3 text-left transicao-premium hover:border-primary/40 hover:bg-primary/5"
                >
                  <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <Icone className="h-3.5 w-3.5" />
                    {config.rotulo}
                  </span>
                  <p className="text-sm leading-relaxed text-stone-700">{item.mensagem}</p>
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setModoPersonalizado(true)}
              className="flex w-full items-center gap-1.5 rounded-xl border border-dashed border-stone-300 p-3 text-sm font-medium text-stone-500 transicao-premium hover:border-primary hover:text-primary"
            >
              <Pencil className="h-3.5 w-3.5" />
              Personalizado
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
