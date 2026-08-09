"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Download, MessageCircle, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/propostas/status-badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { OnboardingTooltip } from "@/components/onboarding/onboarding-tooltip";
import { DialogoWhatsapp } from "@/components/propostas/dialogo-whatsapp";
import { ICONE_BLOCO } from "@/components/propostas/icone-bloco";
import { criarClienteSupabase } from "@/lib/supabase";
import { marcarOnboardingVisto } from "@/lib/onboarding";
import { ordenarBlocos } from "@/lib/blocos";
import {
  formatarMoeda,
  formatarData,
  formatarDataHora,
  calcularDataValidade,
  mascararTelefone,
  LABEL_STATUS
} from "@/lib/utils";
import type { OnboardingVisto, Proposta, StatusProposta } from "@/types";

interface PropostaPreviewProps {
  proposta: Proposta;
  perfilId: string;
  onboardingVisto: OnboardingVisto;
}

export function PropostaPreview({ proposta: propostaInicial, perfilId, onboardingVisto }: PropostaPreviewProps) {
  const router = useRouter();
  const [proposta, setProposta] = useState(propostaInicial);
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);
  const [whatsappAberto, setWhatsappAberto] = useState(false);
  const [dicaWhatsappVista, setDicaWhatsappVista] = useState(
    onboardingVisto.tour_pulado || onboardingVisto.compartilhou_whatsapp || false
  );

  async function alterarStatus(novoStatus: string) {
    setAtualizandoStatus(true);
    try {
      const resposta = await fetch(`/api/propostas/${proposta.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: novoStatus })
      });

      if (!resposta.ok) {
        throw new Error("Falha ao atualizar status");
      }

      const dados = await resposta.json();
      setProposta(dados.proposta as Proposta);
      toast.success("Status atualizado.");
      router.refresh();
    } catch {
      toast.error("Não foi possível atualizar o status.");
    } finally {
      setAtualizandoStatus(false);
    }
  }

  async function marcarWhatsappVisto() {
    setDicaWhatsappVista(true);
    const supabase = criarClienteSupabase();
    await marcarOnboardingVisto(supabase, perfilId, { compartilhou_whatsapp: true });
    // Evita que outras páginas (ex.: /dashboard) mostrem um estado de
    // onboarding desatualizado vindo do cache de navegação.
    router.refresh();
  }

  function abrirWhatsapp() {
    if (!proposta.cliente_whatsapp) {
      toast.error("Este cliente não tem um número de WhatsApp cadastrado.");
      return;
    }
    setWhatsappAberto(true);
  }

  function enviarPorEmail() {
    toast.info("Envio por e-mail em breve.");
  }

  const dataValidade = formatarData(calcularDataValidade(proposta.validade_dias));
  const blocosVisiveis = ordenarBlocos(proposta.blocos || []).filter((bloco) => bloco.visivel);
  const saudacaoBloco = blocosVisiveis.find((bloco) => bloco.tipo === "saudacao");
  const fechamentoBloco = blocosVisiveis.find((bloco) => bloco.tipo === "fechamento");
  const blocosMeio = blocosVisiveis.filter((bloco) => bloco.tipo !== "saudacao" && bloco.tipo !== "fechamento");
  const mostrarDicaWhatsapp = !dicaWhatsappVista;

  return (
    <div className="mx-auto max-w-3xl animate-fade-in-up space-y-6">
      <nav className="flex items-center gap-1.5 text-xs text-stone-500">
        <Link href="/dashboard" className="hover:text-primary">
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-stone-400">Propostas</span>
        <ChevronRight className="h-3 w-3" />
        <span className="truncate text-stone-700">{proposta.titulo}</span>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-stone-900">{proposta.titulo}</h1>
          <p className="text-sm text-stone-500">
            Para {proposta.cliente_nome} · criada em {formatarDataHora(proposta.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={proposta.status} />
          <Select value={proposta.status} onValueChange={alterarStatus} disabled={atualizandoStatus}>
            <SelectTrigger className="h-9 w-[160px] rounded-lg">
              {atualizandoStatus ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SelectValue placeholder="Alterar status" />
              )}
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(LABEL_STATUS) as StatusProposta[]).map((status) => (
                <SelectItem key={status} value={status}>
                  {LABEL_STATUS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild className="shadow-premium">
          <a href={`/api/gerar-pdf?id=${proposta.id}`} download>
            <Download className="h-4 w-4" />
            Baixar PDF
          </a>
        </Button>

        <OnboardingTooltip
          mostrar={mostrarDicaWhatsapp}
          passo={3}
          totalPassos={4}
          titulo="Compartilhe por WhatsApp"
          descricao="Enviar a proposta direto pelo WhatsApp costuma trazer uma resposta mais rápida do cliente."
          onFechar={marcarWhatsappVisto}
          onPular={marcarWhatsappVisto}
        >
          <Button variant="outline" onClick={abrirWhatsapp}>
            <MessageCircle className="h-4 w-4" style={{ color: "#25d366" }} />
            Compartilhar por WhatsApp
          </Button>
        </OnboardingTooltip>

        <Button variant="outline" onClick={enviarPorEmail}>
          <Mail className="h-4 w-4" />
          Enviar por Email
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="grid grid-cols-2 gap-4 rounded-xl bg-stone-50 p-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-stone-500">Investimento</p>
              <p className="font-semibold text-stone-900">{formatarMoeda(proposta.valor_estimado)}</p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Prazo</p>
              <p className="font-semibold text-stone-900">{proposta.prazo_dias} dia(s)</p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Pagamento</p>
              <p className="font-semibold text-stone-900">
                {proposta.condicoes_pagamento.length === 0
                  ? "—"
                  : proposta.condicoes_pagamento.length === 1
                    ? "Pagamento único"
                    : `${proposta.condicoes_pagamento.length}x parcelas`}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-500">Válida até</p>
              <p className="font-semibold text-stone-900">{dataValidade}</p>
            </div>
          </div>

          {proposta.condicoes_pagamento.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-stone-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 text-left text-xs font-semibold uppercase tracking-wide text-stone-500">
                    <th className="px-4 py-2.5">Parcela</th>
                    <th className="px-4 py-2.5">Percentual</th>
                    <th className="px-4 py-2.5">Valor</th>
                    <th className="px-4 py-2.5">Vencimento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {proposta.condicoes_pagamento.map((parcela, indice) => (
                    <tr key={parcela.id || indice}>
                      <td className="px-4 py-2.5 font-medium text-stone-900">{indice + 1}ª</td>
                      <td className="px-4 py-2.5 text-stone-700">{parcela.percentual}%</td>
                      <td className="px-4 py-2.5 font-semibold text-stone-900">
                        {formatarMoeda(
                          parcela.valor_calculado ?? ((proposta.valor_estimado || 0) * parcela.percentual) / 100
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-stone-700">{parcela.descricao}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {saudacaoBloco && (
            <div className="mb-8 border-b border-stone-200 pb-8">
              <p className="whitespace-pre-wrap text-base leading-relaxed text-stone-800">
                {saudacaoBloco.conteudo}
              </p>
            </div>
          )}

          {blocosMeio.length > 0 && (
            <div className="divide-y divide-stone-100">
              {blocosMeio.map((bloco) => {
                const Icone = ICONE_BLOCO[bloco.tipo];
                return (
                  <div key={bloco.id} className="py-4 first:pt-0 last:pb-0">
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
                      <Icone className="h-3.5 w-3.5" />
                      {bloco.titulo}
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{bloco.conteudo}</p>
                  </div>
                );
              })}
            </div>
          )}

          {fechamentoBloco && (
            <div className="mt-8 border-t border-stone-200 pt-8">
              <p className="whitespace-pre-wrap text-base italic leading-relaxed text-stone-600">
                {fechamentoBloco.conteudo}
              </p>
            </div>
          )}

          {blocosVisiveis.length === 0 && (
            <p className="py-4 text-sm text-stone-500">Esta proposta ainda não tem conteúdo gerado.</p>
          )}

          {(proposta.cliente_email || proposta.cliente_whatsapp || proposta.cliente_endereco) && (
            <div className="border-t border-stone-100 pt-4 text-xs text-stone-500">
              <p className="mb-1 font-medium text-stone-700">Contato do cliente</p>
              {proposta.cliente_email && <p>E-mail: {proposta.cliente_email}</p>}
              {proposta.cliente_whatsapp && <p>WhatsApp: {mascararTelefone(proposta.cliente_whatsapp)}</p>}
              {proposta.cliente_endereco && <p>Endereço: {proposta.cliente_endereco}</p>}
            </div>
          )}
        </CardContent>
      </Card>

      <DialogoWhatsapp
        aberto={whatsappAberto}
        onFechar={() => setWhatsappAberto(false)}
        propostaId={proposta.id}
        clienteWhatsapp={proposta.cliente_whatsapp || ""}
        onEnviado={marcarWhatsappVisto}
      />
    </div>
  );
}
