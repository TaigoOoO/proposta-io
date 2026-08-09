import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade — Proposta.io",
  description: "Como o Proposta.io coleta, usa e protege seus dados, em conformidade com a LGPD."
};

interface Secao {
  titulo: string;
  paragrafos: string[];
}

const SECOES: Secao[] = [
  {
    titulo: "1. Introdução",
    paragrafos: [
      "Esta Política de Privacidade explica como o Proposta.io coleta, usa e protege os seus dados e os dados dos seus clientes. Temos o compromisso de tratar essas informações em conformidade com a Lei Geral de Proteção de Dados (LGPD)."
    ]
  },
  {
    titulo: "2. Dados que coletamos",
    paragrafos: [
      "Coletamos dados de cadastro (nome, e-mail, nome da empresa, telefone) e os dados que você insere para gerar propostas, como nome, e-mail e endereço dos seus clientes, descrição de serviços e valores.",
      "Também podemos coletar dados de uso da plataforma, como páginas acessadas e ações realizadas, para melhorar o produto."
    ]
  },
  {
    titulo: "3. Como usamos os dados",
    paragrafos: [
      "Usamos os dados coletados para gerar suas propostas, manter sua conta funcionando, melhorar a qualidade das respostas da IA e enviar comunicações relevantes sobre o serviço.",
      "Não usamos os dados dos seus clientes para nenhuma finalidade além de gerar a proposta solicitada por você."
    ]
  },
  {
    titulo: "4. Compartilhamento",
    paragrafos: [
      "Nunca vendemos seus dados ou os dados dos seus clientes. Compartilhamos informações apenas com provedores essenciais para o funcionamento da plataforma, como Supabase (banco de dados e autenticação) e OpenAI (geração de texto por IA), sempre sob acordos de confidencialidade."
    ]
  },
  {
    titulo: "5. Segurança",
    paragrafos: [
      "Utilizamos criptografia em trânsito e em repouso, além de controle de acesso restrito, para proteger os dados armazenados na plataforma. Apenas você tem acesso às suas propostas — cada conta só enxerga seus próprios dados."
    ]
  },
  {
    titulo: "6. Seus direitos",
    paragrafos: [
      "Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento, entrando em contato pelo e-mail contato@proposta.io. Atendemos essas solicitações dentro dos prazos previstos pela LGPD."
    ]
  },
  {
    titulo: "7. Cookies",
    paragrafos: [
      "Utilizamos apenas cookies essenciais, necessários para manter você conectado e para o funcionamento básico da plataforma. Não utilizamos cookies de rastreamento publicitário."
    ]
  },
  {
    titulo: "8. Alterações nesta política",
    paragrafos: [
      "Esta Política de Privacidade pode ser atualizada periodicamente. Mudanças relevantes serão comunicadas por e-mail ou dentro da plataforma, com a data da última atualização sempre indicada no topo desta página."
    ]
  },
  {
    titulo: "9. Contato",
    paragrafos: [
      "Dúvidas sobre esta Política de Privacidade ou sobre o tratamento dos seus dados podem ser enviadas para contato@proposta.io."
    ]
  }
];

export default function PaginaPrivacidade() {
  return (
    <div className="animate-fade-in-up px-4 py-20 sm:px-6 md:py-28">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">Política de Privacidade</h1>
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
