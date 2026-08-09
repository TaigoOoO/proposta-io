"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Stepper } from "@/components/ui/stepper";
import { FormularioCliente } from "@/components/forms/formulario-cliente";
import { FormularioServico } from "@/components/forms/formulario-servico";
import { FormularioIa } from "@/components/forms/formulario-ia";
import { criarClienteSupabase } from "@/lib/supabase";
import { marcarOnboardingVisto } from "@/lib/onboarding";
import { limparTelefone, moedaParaNumero } from "@/lib/utils";
import type {
  NovaPropostaClienteInput,
  NovaPropostaServicoInput,
  CategoriaTemplate,
  BlocoProposta,
  Proposta
} from "@/types";

const ETAPAS = [
  { numero: 1, titulo: "Cliente" },
  { numero: 2, titulo: "Serviço" },
  { numero: 3, titulo: "Gerar com IA" }
];

const CLIENTE_INICIAL: NovaPropostaClienteInput = {
  cliente_nome: "",
  cliente_email: "",
  cliente_whatsapp: "",
  cliente_endereco: ""
};

const SERVICO_INICIAL: NovaPropostaServicoInput = {
  titulo: "",
  descricao_servico: "",
  valor_estimado: "",
  prazo_dias: "",
  condicoes_pagamento: [],
  validade_dias: "7"
};

export default function PaginaNovaProposta() {
  const router = useRouter();
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [dadosCliente, setDadosCliente] = useState<NovaPropostaClienteInput>(CLIENTE_INICIAL);
  const [dadosServico, setDadosServico] = useState<NovaPropostaServicoInput>(SERVICO_INICIAL);
  const [categoria, setCategoria] = useState<CategoriaTemplate | "">("");

  function aoAvancarCliente(dados: NovaPropostaClienteInput) {
    setDadosCliente(dados);
    setEtapaAtual(2);
  }

  function aoAvancarServico(dados: NovaPropostaServicoInput, categoriaEscolhida: CategoriaTemplate) {
    setDadosServico(dados);
    setCategoria(categoriaEscolhida);
    setEtapaAtual(3);
  }

  async function aoSalvar(blocos: BlocoProposta[], templateId: string) {
    try {
      const resposta = await fetch("/api/propostas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cliente_nome: dadosCliente.cliente_nome,
          cliente_email: dadosCliente.cliente_email,
          cliente_whatsapp: limparTelefone(dadosCliente.cliente_whatsapp),
          cliente_endereco: dadosCliente.cliente_endereco,
          titulo: dadosServico.titulo,
          descricao_servico: dadosServico.descricao_servico,
          valor_estimado: moedaParaNumero(dadosServico.valor_estimado),
          prazo_dias: Number(dadosServico.prazo_dias),
          condicoes_pagamento: dadosServico.condicoes_pagamento,
          validade_dias: Number(dadosServico.validade_dias || "7"),
          blocos,
          categoria_detectada: categoria || null,
          template_id: templateId,
          status: "rascunho"
        })
      });

      const dados = await resposta.json();

      if (!resposta.ok) {
        throw new Error(dados.erro || "Falha ao salvar a proposta");
      }

      const proposta = dados.proposta as Proposta;

      const supabase = criarClienteSupabase();
      const {
        data: { user }
      } = await supabase.auth.getUser();
      if (user) {
        await marcarOnboardingVisto(supabase, user.id, { primeira_proposta_criada: true });
        // Evita que o /dashboard mostre um estado de onboarding desatualizado
        // (em cache) caso o usuário volte para lá depois.
        router.refresh();
      }

      toast.success("Proposta salva com sucesso!");
      router.push(`/propostas/${proposta.id}`);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível salvar a proposta.");
    }
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in-up space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-stone-900">Nova Proposta</h1>
        <p className="text-sm text-stone-500">Preencha as etapas abaixo para gerar sua proposta.</p>
      </div>

      <Stepper etapas={ETAPAS} etapaAtual={etapaAtual} />

      <div className="rounded-2xl border border-stone-100 bg-stone-50/80 p-6">
        {etapaAtual === 1 && (
          <FormularioCliente valoresIniciais={dadosCliente} onAvancar={aoAvancarCliente} />
        )}
        {etapaAtual === 2 && (
          <FormularioServico
            valoresIniciais={dadosServico}
            categoriaInicial={categoria}
            onAvancar={aoAvancarServico}
            onVoltar={() => setEtapaAtual(1)}
          />
        )}
        {etapaAtual === 3 && (
          <FormularioIa
            dadosGeracao={{
              cliente_nome: dadosCliente.cliente_nome,
              cliente_endereco: dadosCliente.cliente_endereco,
              titulo: dadosServico.titulo,
              descricao_servico: dadosServico.descricao_servico,
              valor_estimado: moedaParaNumero(dadosServico.valor_estimado),
              prazo_dias: Number(dadosServico.prazo_dias),
              condicoes_pagamento: dadosServico.condicoes_pagamento,
              validade_dias: Number(dadosServico.validade_dias || "7"),
              categoria: (categoria || "outros") as CategoriaTemplate
            }}
            onVoltar={() => setEtapaAtual(2)}
            onSalvar={aoSalvar}
          />
        )}
      </div>
    </div>
  );
}
