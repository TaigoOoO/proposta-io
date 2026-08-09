/**
 * Utilitários centralizados de formatação monetária no padrão brasileiro.
 * Esta é a fonte canônica — `src/lib/utils.ts` reexporta estas funções para
 * manter compatibilidade com o restante do app, então usar `formatarMoeda`
 * a partir de "@/lib/utils" ou de "@/lib/formatters" dá exatamente no mesmo.
 */

/**
 * Formata um valor em Real brasileiro: 38500 -> "R$ 38.500,00".
 * Aceita number, string numérica (ex: "38500.5") ou valores nulos/vazios.
 */
export function formatarMoeda(valor: number | string | null | undefined): string {
  if (valor === null || valor === undefined || valor === "") {
    return "R$ 0,00";
  }

  const numero = typeof valor === "string" ? parseFloat(valor) : valor;

  if (Number.isNaN(numero)) {
    return "R$ 0,00";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numero);
}

/**
 * Mesmo formato de `formatarMoeda`, mas sem o prefixo "R$" — útil para
 * campos de input onde o símbolo já aparece fora do campo.
 */
export function formatarMoedaSemSimbolo(valor: number | string | null | undefined): string {
  if (valor === null || valor === undefined || valor === "") {
    return "0,00";
  }

  const numero = typeof valor === "string" ? parseFloat(valor) : valor;

  if (Number.isNaN(numero)) {
    return "0,00";
  }

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numero);
}

/**
 * Converte uma string monetária em qualquer formato comum ("R$ 38.500,00",
 * "38500,00", "38500.00") para number. Retorna 0 se não conseguir parsear.
 */
export function parseMoeda(valor: string): number {
  const limpo = valor
    .replace(/R\$\s?/g, "")
    .replace(/\./g, "") // remove pontos de milhar
    .replace(/,/g, "."); // vírgula decimal vira ponto

  const numero = parseFloat(limpo);
  return Number.isNaN(numero) ? 0 : numero;
}
