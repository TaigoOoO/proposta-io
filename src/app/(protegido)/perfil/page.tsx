import { redirect } from "next/navigation";
import { criarClienteSupabaseServidor } from "@/lib/supabase-server";
import { Card, CardContent } from "@/components/ui/card";
import { FormularioPerfil } from "@/components/forms/formulario-perfil";
import type { Perfil } from "@/types";

// Garante que os dados do perfil sejam sempre lidos direto do banco nesta
// página, nunca de uma resposta em cache — essencial para o formulário
// refletir o estado real assim que o usuário chega aqui.
export const dynamic = "force-dynamic";

export default async function PaginaPerfil() {
  const supabase = await criarClienteSupabaseServidor();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: perfil } = await supabase.from("perfis").select("*").eq("id", user.id).single();

  // Importante: esta página NUNCA redireciona de volta para /dashboard.
  // Se por algum motivo o registro em `perfis` ainda não existir (ex.: o
  // trigger de criação de perfil ainda não terminou), renderizamos o
  // formulário com valores em branco em vez de expulsar o usuário — ele
  // sempre precisa conseguir acessar e preencher o próprio perfil aqui.
  const perfilResolvido: Perfil = perfil
    ? (perfil as Perfil)
    : {
        id: user.id,
        nome_completo:
          typeof user.user_metadata?.["nome_completo"] === "string"
            ? (user.user_metadata["nome_completo"] as string)
            : user.email || "",
        nome_empresa: null,
        cnpj: null,
        telefone: null,
        endereco: null,
        onboarding_visto: {},
        created_at: new Date().toISOString()
      };

  return (
    <div className="mx-auto max-w-2xl animate-fade-in-up space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight">Meu Perfil</h1>
        <p className="text-sm text-muted-foreground">
          Estes dados aparecem no cabeçalho das suas propostas em PDF e são usados pela IA.
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <FormularioPerfil perfil={perfilResolvido} />
        </CardContent>
      </Card>
    </div>
  );
}
