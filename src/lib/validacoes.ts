import { z } from "zod";
import { TIPOS_BLOCO } from "@/types";
import { validarFormatoCnpj } from "@/lib/utils";

export const esquemaBloco = z.object({
  id: z.string().min(1),
  tipo: z.enum(TIPOS_BLOCO),
  titulo: z.string().min(1),
  conteudo: z.string(),
  obrigatorio: z.boolean(),
  editavel: z.boolean(),
  visivel: z.boolean(),
  ordem: z.number().int().nonnegative()
});
export type BlocoInput = z.infer<typeof esquemaBloco>;


export const esquemaLogin = z.object({
  email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
  senha: z.string().min(1, "Informe a senha")
});
export type LoginInput = z.infer<typeof esquemaLogin>;

export const esquemaCadastro = z
  .object({
    nome_completo: z.string().min(2, "Informe seu nome completo"),
    email: z.string().min(1, "Informe o e-mail").email("E-mail inválido"),
    senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    confirmar_senha: z.string().min(1, "Confirme sua senha")
  })
  .refine((dados) => dados.senha === dados.confirmar_senha, {
    message: "As senhas não coincidem",
    path: ["confirmar_senha"]
  });
export type CadastroInput = z.infer<typeof esquemaCadastro>;

export const esquemaPasso1Cliente = z.object({
  cliente_nome: z.string().min(2, "Informe o nome do cliente"),
  cliente_email: z
    .string()
    .refine((valor) => valor === "" || z.string().email().safeParse(valor).success, {
      message: "E-mail inválido"
    }),
  cliente_whatsapp: z.string().refine(
    (valor) => valor === "" || valor.replace(/\D/g, "").length >= 10,
    "WhatsApp incompleto"
  ),
  cliente_endereco: z.string()
});
export type Passo1ClienteInput = z.infer<typeof esquemaPasso1Cliente>;

export const esquemaParcela = z.object({
  id: z.string().optional(),
  percentual: z.number().min(1, "O percentual deve ser maior que zero").max(100),
  descricao: z.string().min(2, "Descreva a parcela").max(200),
  prazo_dias: z.number().int().nullable(),
  valor_calculado: z.number().optional(),
  ordem: z.number().int().min(0)
});
export type ParcelaInput = z.infer<typeof esquemaParcela>;

export const esquemaParcelas = z
  .array(esquemaParcela)
  .min(1, "Adicione ao menos uma parcela")
  .refine(
    (parcelas) => {
      const total = parcelas.reduce((soma, p) => soma + p.percentual, 0);
      // Tolerância de 0.01 para evitar falsos negativos por arredondamento
      // de ponto flutuante (ex: 33.33 + 33.33 + 33.34).
      return Math.abs(total - 100) < 0.01;
    },
    { message: "A soma das parcelas deve ser exatamente 100%" }
  );

export const esquemaPasso2Servico = z.object({
  titulo: z.string().min(3, "Informe um título para a proposta"),
  descricao_servico: z.string().min(10, "Descreva o serviço com mais detalhes"),
  valor_estimado: z.string().min(1, "Informe o valor estimado"),
  prazo_dias: z
    .string()
    .min(1, "Informe o prazo de execução")
    .refine((v) => Number(v) > 0, "O prazo deve ser maior que zero"),
  condicoes_pagamento: esquemaParcelas,
  validade_dias: z
    .string()
    .min(1, "Informe a validade da proposta")
    .refine((v) => Number(v) > 0, "A validade deve ser maior que zero")
});
export type Passo2ServicoInput = z.infer<typeof esquemaPasso2Servico>;

export const esquemaPerfil = z.object({
  nome_completo: z.string().min(2, "Informe seu nome completo"),
  nome_empresa: z.string(),
  cnpj: z
    .string()
    .refine((valor) => valor === "" || validarFormatoCnpj(valor), "CNPJ em formato inválido"),
  telefone: z.string(),
  endereco: z.string()
});
export type PerfilInput = z.infer<typeof esquemaPerfil>;
