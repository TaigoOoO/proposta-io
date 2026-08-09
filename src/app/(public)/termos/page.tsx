import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso — Proposta.io",
  description: "Termos de Uso do Proposta.io: cadastro, planos, uso da IA, propriedade intelectual e mais."
};

interface Secao {
  titulo: string;
  paragrafos: string[];
}

const SECOES: Secao[] = [
  {
    titulo: "1. Aceitação dos termos",
    paragrafos: [
      "Ao criar uma conta ou utilizar o Proposta.io, você concorda integralmente com estes Termos de Uso. Se você não concordar com algum ponto, pedimos que não utilize a plataforma."
    ]
  },
  {
    titulo: "2. Descrição do serviço",
    paragrafos: [
      "O Proposta.io é um software como serviço (SaaS) que ajuda prestadores de serviço a criar, gerenciar e enviar propostas comerciais, com apoio de inteligência artificial, geração de PDF, parcelamento flexível e envio por WhatsApp.",
      "Podemos alterar, adicionar ou remover funcionalidades ao longo do tempo, sempre buscando manter a essência do serviço oferecido."
    ]
  },
  {
    titulo: "3. Cadastro e conta do usuário",
    paragrafos: [
      "Para usar o Proposta.io, é necessário criar uma conta com um e-mail válido. Você é responsável por manter a confidencialidade da sua senha e por todas as atividades realizadas na sua conta.",
      "Informações de cadastro devem ser verdadeiras e atualizadas. Contas duplicadas ou com dados falsos podem ser suspensas."
    ]
  },
  {
    titulo: "4. Planos e pagamentos",
    paragrafos: [
      "O Proposta.io oferece planos gratuitos e pagos, cobrados mensalmente. Os valores e limites de cada plano estão descritos na página de preços.",
      "Você pode cancelar sua assinatura a qualquer momento, sem multa ou taxa de cancelamento. O acesso aos recursos pagos permanece ativo até o fim do período já pago."
    ]
  },
  {
    titulo: "5. Uso da IA",
    paragrafos: [
      "O texto das propostas é gerado com apoio de inteligência artificial a partir das informações que você fornece. Embora buscamos entregar um resultado profissional, o conteúdo final gerado é de sua responsabilidade.",
      "Recomendamos sempre revisar o texto antes de enviar uma proposta a um cliente, verificando valores, prazos e condições."
    ]
  },
  {
    titulo: "6. Propriedade intelectual",
    paragrafos: [
      "Você mantém todos os direitos sobre as propostas, textos e dados que criar utilizando o Proposta.io. Não reivindicamos propriedade sobre o conteúdo gerado para a sua conta.",
      "A marca, o design e o código do Proposta.io são de propriedade da plataforma e não podem ser copiados ou reproduzidos sem autorização."
    ]
  },
  {
    titulo: "7. Limitação de responsabilidade",
    paragrafos: [
      "O Proposta.io é fornecido \"como está\". Não garantimos que o serviço estará livre de interrupções ou erros, e não nos responsabilizamos por decisões comerciais tomadas com base no conteúdo gerado pela IA.",
      "Em nenhuma hipótese seremos responsáveis por lucros cessantes ou danos indiretos decorrentes do uso ou da impossibilidade de uso da plataforma."
    ]
  },
  {
    titulo: "8. Modificações nos termos",
    paragrafos: [
      "Podemos atualizar estes Termos de Uso periodicamente. Alterações significativas serão comunicadas por e-mail ou dentro da própria plataforma. O uso contínuo do serviço após uma atualização representa a aceitação dos novos termos."
    ]
  },
  {
    titulo: "9. Contato",
    paragrafos: [
      "Dúvidas sobre estes Termos de Uso podem ser enviadas para contato@proposta.io."
    ]
  }
];

export default function PaginaTermos() {
  return (
    <div className="animate-fade-in-up px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">Termos de Uso</h1>
        <p className="mt-3 text-sm text-stone-400">Última atualização: 8 de agosto de 2026</p>

        <div className="mt-12 space-y-10">
          {SECOES.map((secao) => (
            <section key={secao.titulo}>
              <h2 className="text-lg font-semibold text-stone-900">{secao.titulo}</h2>
              <div className="mt-3 space-y-3">
                {secao.paragrafos.map((paragrafo, indice) => (
                  <p key={indice} className="text-sm leading-relaxed text-stone-600">
                    {paragrafo}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
