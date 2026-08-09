import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { StatusProposta } from "@/types";
import { formatarMoeda, formatarMoedaSemSimbolo, parseMoeda } from "@/lib/formatters";

// Reexportadas para manter compatibilidade com o restante do app — a fonte
// canônica destas funções é "@/lib/formatters".
export { formatarMoeda, formatarMoedaSemSimbolo, parseMoeda };

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Converte uma string de input mascarado ("1.234,56") para número (1234.56).
 * Alias de `parseMoeda` mantido pelo nome usado historicamente nos formulários.
 */
export function moedaParaNumero(valorMascarado: string): number {
  return parseMoeda(valorMascarado);
}

/**
 * Aplica máscara de moeda brasileira enquanto o usuário digita.
 * Recebe o valor bruto (apenas dígitos) e retorna "1.234,56"
 */
export function mascararMoedaInput(valor: string): string {
  const digitos = valor.replace(/\D/g, "");
  if (!digitos) return "";
  const numero = parseInt(digitos, 10) / 100;
  return formatarMoedaSemSimbolo(numero);
}

/**
 * Aplica máscara de telefone/WhatsApp brasileiro: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export function mascararTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);

  if (digitos.length === 0) return "";
  if (digitos.length <= 2) return `(${digitos}`;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7, 11)}`;
}

/**
 * Remove a máscara do telefone, retornando apenas dígitos.
 */
export function limparTelefone(valor: string): string {
  return valor.replace(/\D/g, "");
}

/**
 * Aplica máscara de CNPJ: XX.XXX.XXX/XXXX-XX
 */
export function mascararCnpj(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 14);

  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 5) return `${digitos.slice(0, 2)}.${digitos.slice(2)}`;
  if (digitos.length <= 8) {
    return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5)}`;
  }
  if (digitos.length <= 12) {
    return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8)}`;
  }
  return `${digitos.slice(0, 2)}.${digitos.slice(2, 5)}.${digitos.slice(5, 8)}/${digitos.slice(8, 12)}-${digitos.slice(12, 14)}`;
}

/**
 * Valida o formato do CNPJ (XX.XXX.XXX/XXXX-XX ou 14 dígitos).
 * Não valida os dígitos verificadores, apenas o formato/quantidade.
 */
export function validarFormatoCnpj(valor: string): boolean {
  const digitos = valor.replace(/\D/g, "");
  return digitos.length === 14;
}

/**
 * Formata uma data ISO para o padrão brasileiro dd/mm/aaaa
 */
export function formatarData(data: string | Date): string {
  const d = typeof data === "string" ? new Date(data) : data;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(d);
}

/**
 * Formata uma data ISO com horário no padrão brasileiro dd/mm/aaaa às HH:mm
 */
export function formatarDataHora(data: string | Date): string {
  const d = typeof data === "string" ? new Date(data) : data;
  const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  }).format(d);
  const horaFormatada = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(d);
  return `${dataFormatada} às ${horaFormatada}`;
}

/**
 * Calcula a data de validade a partir de hoje + dias
 */
export function calcularDataValidade(diasValidade: number): Date {
  const data = new Date();
  data.setDate(data.getDate() + diasValidade);
  return data;
}

/**
 * Gera o link do WhatsApp (wa.me) com texto pré-formatado.
 */
export function gerarLinkWhatsapp(telefone: string, mensagem: string): string {
  const numeroLimpo = telefone.replace(/\D/g, "");
  const numeroComPais = numeroLimpo.startsWith("55") ? numeroLimpo : `55${numeroLimpo}`;
  return `https://wa.me/${numeroComPais}?text=${encodeURIComponent(mensagem)}`;
}

export const LABEL_STATUS: Record<StatusProposta, string> = {
  rascunho: "Rascunho",
  enviada: "Enviada",
  aprovada: "Aprovada",
  rejeitada: "Rejeitada"
};
